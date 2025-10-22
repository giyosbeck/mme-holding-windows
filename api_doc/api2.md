# MME Holding API Documentation

## FACTORY MANAGER Role APIs

This document covers:
- Login/Authentication APIs
- All APIs used by FACTORY MANAGER role users

---

## 1. Authentication APIs

The app uses a **two-step OTP-based authentication** system.

### Base URLs

| Environment | Base URL |
|-------------|----------|
| Production | `https://team.mme-holding.uz` |
| Development | `https://dastur.mme-holding.uz` |

---

### 1.1 Phone Login Request (Step 1)

Sends phone number to request OTP code.

**Endpoint:** `POST /login/phone`

**Request Body:**
```json
{
  "phone": "998901234567"
}
```

**Notes:**
- Phone number must be sent without "+" prefix
- Spaces should be removed
- Example: "+998 90 123 45 67" → "998901234567"

**Response:**
```json
{
  "code": 12345
}
```

**Response Fields:**
- `code` - 5-digit OTP code (also sent via SMS)

---

### 1.2 OTP Verification (Step 2)

Verifies the OTP code and authenticates the user.

**Endpoint:** `POST /login/code`

**Request Body:**
```json
{
  "phone": "998901234567",
  "code": 12345
}
```

**Response:**
```json
{
  "expired": false,
  "userID": "user-identifier",
  "userRole": "6",
  "userRoleStatus": 1,
  "token": "authentication-token",
  "selected_language": "uz"
}
```

**Response Fields:**
- `expired` - Boolean indicating if account is expired
- `userID` - Unique user identifier
- `userRole` - User's role code (FACTORY_MANAGER = "6")
- `userRoleStatus` - Role status (0 = pending, 1+ = active)
- `token` - Authentication token for subsequent requests
- `selected_language` - User's preferred language code

**Role Codes:**
- `"6"` = FACTORY_MANAGER

---

### 1.3 Authentication Headers

All subsequent API requests after login must include:

**Headers:**
```
Authorization: mme:{token}
Content-Type: application/json
Accept: application/json
```

**Example:**
```
Authorization: mme:abc123def456xyz789
```

---

## 2. FACTORY MANAGER Role APIs

### Role Information
- **Role Code:** `"6"`
- **Enum:** `FACTORY_MANAGER`
- **User Check:** `User.shared.isFactoryManager`

---

## 3. Order Management APIs

These APIs manage dress orders for salons and brides.

---

### 3.1 Get All Dress Orders

Retrieves list of all dress orders with filtering options.

**Endpoint:** `GET /dress-order/all`

**Headers:** Requires authentication token

**Query Parameters:**
```
accepted={true|false}&dress_author_id={designerId}
```

**Parameters:**
- `accepted` - Filter by acceptance status (true/false)
- `dress_author_id` - Filter by designer ID (optional, used by Designers)

**Response:**
```json
[
  {
    "id": "string",
    "order_number": 12345,
    "salon_name": "Salon Name",
    "dress_name": "Wedding Dress",
    "debt_and_taken_money": {
      "debt": 5000000,
      "taken_money": 3000000
    },
    "accepted": false,
    "ready": false
  }
]
```

**Response Fields:**
- `id` - Order ID
- `order_number` - Unique order number
- `salon_name` - Name of the salon
- `dress_name` - Name/type of dress
- `debt_and_taken_money` - Payment tracking
  - `debt` - Outstanding amount
  - `taken_money` - Amount paid
- `accepted` - Whether order is accepted by Factory Manager
- `ready` - Whether order is ready/completed

**Used In:**
- `StOrdersVC` - Orders list screen
- `StOrdersVM.getDresses()` - Main orders view

---

### 3.2 Get Dress Order Details

Retrieves complete details for a specific dress order.

**Endpoint:** `GET /dress-order/by-id-new/{id}/`

**Headers:** Requires authentication token

**Path Parameters:**
- `{id}` - Order ID

**Request Body:** None

**Response:**
```json
{
  "id": "string",
  "order_number": 12345,
  "dress_name": "Wedding Dress",
  "shleft_size": 42,
  "dress_color": "White",
  "base_price": 10000000,
  "description": "Custom wedding dress details",
  "dress_images": ["url1", "url2"],
  "order_dress_images": ["url1", "url2"],
  "bride_data": {
    "name_bride": "Bride Name",
    "phone_bride": "998901234567",
    "wedding_date_bride": "2024-06-15",
    "bride_money": 5000000,
    "bride_debt": 5000000
  },
  "salon_data": {
    "salon_name": "Salon Name",
    "customer_phone": "998901234567",
    "salon_money": 3000000,
    "salon_debt": 7000000
  },
  "accepted": false,
  "ready": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Response Fields:**
- `id` - Order ID
- `order_number` - Unique order number
- `dress_name` - Name/type of dress
- `shleft_size` - Dress size
- `dress_color` - Dress color
- `base_price` - Base price of the dress
- `description` - Order description and notes
- `dress_images` - Array of dress template image URLs
- `order_dress_images` - Array of customer's reference image URLs
- `bride_data` - Bride information object
  - `name_bride` - Bride's name
  - `phone_bride` - Bride's phone number
  - `wedding_date_bride` - Wedding date
  - `bride_money` - Amount paid by bride
  - `bride_debt` - Bride's outstanding amount
- `salon_data` - Salon information object
  - `salon_name` - Salon name
  - `customer_phone` - Salon contact phone
  - `salon_money` - Amount paid by salon
  - `salon_debt` - Salon's outstanding amount
- `accepted` - Whether order is accepted
- `ready` - Whether order is completed
- `created_at` - Order creation timestamp

**Used In:**
- `StOrderDetailVC` - Order detail screen
- `StOrderDetailsVM.getDressesDetail()` - Order details view

---

### 3.3 Get Rejected Orders

Retrieves paginated list of all rejected dress orders.

**Endpoint:** `GET /dress-order/rejected/all`

**Headers:** Requires authentication token

**Query Parameters:**
```
limit={limit}&offset={offset}
```

**Parameters:**
- `limit` - Number of orders per page (default: 20)
- `offset` - Page offset for pagination

**Response:**
```json
{
  "orders": [
    {
      "id": "string",
      "order_number": 12345,
      "salon_name": "Salon Name",
      "dress_name": "Wedding Dress",
      "reject_description": "Quality issues with fabric",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150
}
```

**Response Fields:**
- `orders` - Array of rejected orders
  - `id` - Order ID
  - `order_number` - Unique order number
  - `salon_name` - Salon name
  - `dress_name` - Dress name
  - `reject_description` - Reason for rejection
  - `created_at` - Rejection timestamp
- `total` - Total count of rejected orders

**Used In:**
- `StOrdersVM.getAllDressRejectedAll()` - Rejected orders list
- `RejectedOrdersAllVC` - Rejected orders screen

---

### 3.4 Accept Dress Order

Accepts or rejects a dress order.

**Endpoint:** `PUT /dress-order/accept`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "id": "order-id",
  "accept": true,
  "reject_description": "Optional rejection reason"
}
```

**Request Fields:**
- `id` - Order ID (required)
- `accept` - Boolean to accept (true) or reject (false) (required)
- `reject_description` - Rejection reason (required if accept = false)

**Response:**
```json
{
  "data": {
    "id": "order-id"
  }
}
```

**Notes:**
- If `accept = true`, order is accepted
- If `accept = false`, order is rejected and `reject_description` is required
- Only Factory Manager can accept/reject orders

**Used In:**
- `StOrderDetailsVM.orderAcceptOrReject(accept: true)` - Accept order
- `StOrderDetailsVM.orderAcceptOrReject(accept: false, rejectText: "...")` - Reject order

---

### 3.5 Mark Dress Order as Ready

Marks a dress order as ready/completed.

**Endpoint:** `PUT /dress-order/ready`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "id": "order-id",
  "ready": true
}
```

**Request Fields:**
- `id` - Order ID (required)
- `ready` - Boolean to mark as ready (true) or not ready (false) (required)

**Response:**
```json
{
  "data": {
    "id": "order-id"
  }
}
```

**Notes:**
- Only Factory Manager can mark orders as ready
- Order must be accepted before it can be marked as ready

**Used In:**
- `StOrderDetailsVM.orderReady(ready: true)` - Mark order as ready

---

## 4. Designer Idea Management APIs

These APIs manage the conversion of designer ideas into actual dresses.

---

### 4.1 Get Completed Ideas

Retrieves list of completed designer ideas available for conversion to dresses.

**Endpoint:** `GET /designer/completed/ideas`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "idea_name": "Summer Collection Dress",
    "idea_image": "https://example.com/image.jpg"
  }
]
```

**Response Fields:**
- `id` - Idea ID
- `idea_name` - Name of the idea
- `idea_image` - Image URL of the idea

**Used In:**
- `ConvertIdeaToDressScreenVM.fetchData()` - Convert Idea to Dress screen

---

### 4.2 Get Idea Details

Retrieves complete details for a specific designer idea.

**Endpoint:** `GET /designer/get/idea/{id}/v2`

**Headers:** Requires authentication token

**Path Parameters:**
- `{id}` - Idea ID

**Request Body:** None

**Response:**
```json
{
  "id": "string",
  "idea_name": "Summer Collection Dress",
  "image": "https://example.com/image.jpg",
  "description": "Detailed description of the design",
  "task_templates": [
    {
      "id": "string",
      "task_name": "Cutting",
      "status": "completed"
    }
  ],
  "staff_members": [
    {
      "id": "string",
      "name": "Worker Name",
      "role": "SEWING_MANAGER"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Response Fields:**
- `id` - Idea ID
- `idea_name` - Name of the idea
- `image` - Primary image URL
- `description` - Idea description
- `task_templates` - Array of assigned tasks
  - `id` - Task ID
  - `task_name` - Task name
  - `status` - Task status
- `staff_members` - Array of assigned workers
  - `id` - Worker ID
  - `name` - Worker name
  - `role` - Worker role
- `created_at` - Creation timestamp

**Used In:**
- `IdeaToDressDetailScreen` - Idea detail screen
- `DesignerIdeaDetailScreenVM.getDesignerIdea()` - Idea details view

---

### 4.3 Transfer Idea to Dress

Approves or rejects the conversion of a designer idea to an actual dress.

**Endpoint:** `PATCH /designer/transfer/to/dress`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "ideaId": "idea-id",
  "action": "TRANSFER"
}
```

**Request Fields:**
- `ideaId` - ID of the idea (required)
- `action` - Action to perform (required)
  - `"TRANSFER"` - Approve and convert idea to dress
  - `"REJECTED"` - Reject the idea

**Response:**
```json
{
  "data": {
    "id": "idea-id"
  }
}
```

**Status Enum Values:**
- `TRANSFER` - Idea is approved for production
- `REJECTED` - Idea is rejected

**Notes:**
- Only Factory Manager can approve/reject idea transfers
- After transfer, idea becomes available as a dress template

**Used In:**
- `DesignerIdeaDetailScreenVM.isTransferred()` - Approve idea transfer
- `DesignerIdeaDetailScreenVM.rejectDesignerIdea()` - Reject idea

---

## 5. Dress Inventory APIs

These APIs manage the dress catalog/inventory.

---

### 5.1 Get All Dresses

Retrieves list of all dresses in inventory.

**Endpoint:** `GET /dress/all`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "dress_image": ["url1", "url2", "url3"],
    "dress_name": "Wedding Dress Classic",
    "dress_color": "White",
    "dress_shleft_size": 42
  }
]
```

**Response Fields:**
- `id` - Dress ID
- `dress_image` - Array of dress image URLs
- `dress_name` - Name of the dress
- `dress_color` - Dress color
- `dress_shleft_size` - Available size

**Used In:**
- `StoreShirtsScreenVM.getAllDresses()` - Store dresses screen

---

## 6. Reports & Statistics APIs

These APIs provide warehouse reports and statistics for Factory Manager.

---

### 6.1 Get Warehouse Report General

Retrieves general warehouse statistics for a date range.

**Endpoint:** `GET /report/warehouse-general`

**Headers:** Requires authentication token

**Query Parameters:**
```
from={fromDate}&to={toDate}
```

**Parameters:**
- `from` - Start date (format: "yyyy-MM-dd") (required)
- `to` - End date (format: "yyyy-MM-dd") (required)

**Response:**
```json
{
  "orders_count": 150,
  "accepted": 120,
  "not_accepted": 20,
  "rejected": 10
}
```

**Response Fields:**
- `orders_count` - Total number of orders in date range
- `accepted` - Number of accepted orders
- `not_accepted` - Number of pending orders
- `rejected` - Number of rejected orders

**Used In:**
- `InfoStReportGeneralVM.getReport()` - General statistics view
- `InfoMainVC` - Statistics tab

---

### 6.2 Get Warehouse Report by User ID

Retrieves warehouse statistics filtered by specific user.

**Endpoint:** `GET /report/warehouse-general`

**Headers:** Requires authentication token

**Query Parameters:**
```
from={fromDate}&to={toDate}&user_id={userId}
```

**Parameters:**
- `from` - Start date (format: "yyyy-MM-dd") (required)
- `to` - End date (format: "yyyy-MM-dd") (required)
- `user_id` - User ID to filter by (required)

**Response:**
```json
{
  "orders_count": 50,
  "accepted": 40,
  "not_accepted": 8,
  "rejected": 2
}
```

**Used In:**
- `InfoStReportGeneralVM.getReportByUserID()` - User-specific statistics

---

### 6.3 Get Warehouse Report Details

Retrieves detailed warehouse report with order breakdown.

**Endpoint:** `GET /report/warehouse-details`

**Headers:** Requires authentication token

**Query Parameters:**
```
user_id={userId}
```

**Parameters:**
- `user_id` - User ID (optional)

**Response:**
```json
{
  "reports": [
    {
      "order_id": "string",
      "order_number": 12345,
      "dress_name": "Wedding Dress",
      "salon_name": "Salon Name",
      "status": "accepted",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "report_order_count": "150"
}
```

**Response Fields:**
- `reports` - Array of report entries
  - `order_id` - Order ID
  - `order_number` - Order number
  - `dress_name` - Dress name
  - `salon_name` - Salon name
  - `status` - Order status
  - `created_at` - Creation timestamp
- `report_order_count` - Total count as string

**Used In:**
- `StReportVM.getReports()` - Detailed reports view
- `StorReportVC` - Reports screen

---

## 7. User Profile APIs

These APIs manage user profile information.

---

### 7.1 Get Profile Data

Gets user profile information.

**Endpoint:** `GET /user/{userId}`

**Headers:** Requires authentication token

**Path Parameters:**
- `{userId}` - User ID

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "surname": "string",
  "phone": "998901234567",
  "role": "FACTORY_MANAGER",
  "language": "uz"
}
```

**Response Fields:**
- `id` - User ID
- `name` - User's first name
- `surname` - User's last name
- `phone` - User's phone number
- `role` - User's role
- `language` - Preferred language code

**Used In:**
- `InfoStReportGeneralVM.getProfileData()` - Profile data retrieval

---

### 7.2 Get User Information

Gets user information including account status.

**Endpoint:** `GET /login/user/{userId}`

**Headers:** Requires authentication token

**Path Parameters:**
- `{userId}` - User ID

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "phone": "998901234567",
  "role": "FACTORY_MANAGER",
  "roleStatus": 1,
  "expired": false
}
```

---

### 7.3 Edit Profile

Updates user profile information.

**Endpoint:** `PUT /user/data`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "id": "string",
  "name": "string",
  "surname": "string",
  "language": "uz"
}
```

**Request Fields:**
- `id` - User ID (required)
- `name` - User's first name (required)
- `surname` - User's last name (required)
- `language` - Preferred language code (required)

---

### 7.4 Get Phone Change Code

Requests verification code for phone number change.

**Endpoint:** `GET /user/code-change-phone`

**Headers:** Requires authentication token

**Query Parameters:**
```
phone={newPhoneNumber}
```

**Parameters:**
- `phone` - New phone number (without + prefix)

**Response:**
```json
{
  "code": 12345
}
```

---

### 7.5 Verification Code

Verifies phone change code.

**Endpoint:** `PUT /user/code-phone`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "code": 12345
}
```

**Request Fields:**
- `code` - 5-digit verification code

---

## 8. FACTORY MANAGER Role Workflow

### Tab Bar Navigation:
1. **Orders Tab** - View and manage dress orders
2. **Statistics Tab** - View reports and statistics (Factory Manager only)
3. **Reports Tab** - Detailed warehouse reports
4. **Profile Tab** - User profile management

### Main Features:

#### 1. Order Management Workflow:
1. View all orders (accepted/unaccepted)
2. Search/filter orders by salon name, dress name, order number
3. View order details (dress specs, images, bride/salon info, prices)
4. Accept or reject orders with optional rejection description
5. Mark accepted orders as ready/completed
6. Track payment status (debt and taken money)
7. View rejected orders history

#### 2. Idea to Dress Conversion Workflow:
1. View completed designer ideas
2. Review idea details (images, description, assigned workers, tasks)
3. Approve idea for production (TRANSFER action)
4. Reject idea with reason (REJECTED action)
5. Browse idea image gallery

#### 3. Dress Inventory Workflow:
1. View all dresses in store
2. Browse dress grid with images
3. View dress details (name, color, size)

#### 4. Reports & Statistics Workflow:
1. View general statistics dashboard
   - Total orders count
   - Accepted orders
   - Unaccepted orders
   - Rejected orders
2. Filter statistics by date range
3. Filter statistics by specific user
4. View detailed order reports
5. Track warehouse performance

---

## 9. API Summary

### Total Endpoints: 16

| Category | Count | Endpoints |
|----------|-------|-----------|
| Authentication | 2 | Phone login, OTP verification |
| Order Management | 5 | Get all, get details, get rejected, accept, mark ready |
| Designer Idea Management | 3 | Get completed ideas, get idea details, transfer to dress |
| Dress Inventory | 1 | Get all dresses |
| Reports & Statistics | 3 | General report, report by user, detailed report |
| User Profile | 5 | Get profile, user info, edit, phone change, verify code |

---

## 10. Important Notes

### Authentication Flow:
1. User enters phone number
2. App requests OTP via `/login/phone`
3. User receives SMS with OTP code
4. User enters OTP
5. App verifies OTP via `/login/code`
6. App receives auth token and role code "6"
7. Token stored in UserDefaults with key `.token`
8. All subsequent requests use `Authorization: mme:{token}` header

### Factory Manager Specific Features:
- **Statistics Tab**: Only visible to Factory Manager role
- **Order Actions**: Accept/Reject/Ready buttons only available to Factory Manager
- **Idea Approval**: Only Factory Manager can approve/reject idea transfers
- **Reports Access**: Full access to warehouse reports and statistics

### Role-Based UI Rendering:
```swift
// Check if user is Factory Manager
if User.shared.isFactoryManager {
    // Show Factory Manager specific UI
    // Show statistics tab
    // Show action buttons
}
```

### Network Configuration:
- Uses Alamofire framework
- JSON encoding for request bodies
- All authenticated requests require `Authorization: mme:{token}` header
- Base URL switches between production and development via UserDefaults

### Error Handling:
- Role status must be > 0 for active users
- Expired accounts cannot log in
- Network errors display user alerts
- OTP expires after 120 seconds

### Data Persistence:
- User role stored in `UserDefaults` with key `.userRoleStatus`
- Auth token stored with key `.token`
- User ID stored with key `.userID`
- Language preference stored with key `.selectedLanguage`

---

## 11. Factory Manager Permissions

### What Factory Manager Can Do:
✅ View all dress orders
✅ Accept or reject orders
✅ Mark orders as ready/completed
✅ View rejected orders
✅ Approve designer ideas for production
✅ Reject designer ideas
✅ View all dresses in inventory
✅ View warehouse statistics and reports
✅ Filter reports by date and user
✅ Manage own profile

### What Factory Manager Cannot Do:
❌ Create new dress orders (done by Salons)
❌ Create designer ideas (done by Designers)
❌ Manage warehouse inventory (done by Warehouse role)
❌ Modify other users' profiles

---

## File References

### API Managers:
- `StorageAPI.swift` - Primary API manager for Factory Manager (orders, reports)
- `DesignerAPIManager.swift` - Designer idea management
- `SlSellerAPI.swift` - Dress inventory management
- `ProfileSideAPI.swift` - User profile management
- `RegisterAPI.swift` - Authentication endpoints
- `Net.swift` - Network layer

### Factory Manager Screens (UIKit):
- `FactoryManagerTabBar.swift` - Main tab bar navigation
- `StOrdersVC.swift` - Orders list screen
- `StOrderDetailVC.swift` - Order detail screen
- `RejectedOrdersAllVC.swift` - Rejected orders list
- `InfoMainVC.swift` - Statistics main screen
- `StReportVC.swift` - Reports screen
- `StProfileVC.swift` - Profile screen

### Factory Manager Screens (SwiftUI):
- `ConvertIdeaToDressScreen/` - Completed ideas list
- `IdeaToDressDetailScreen/` - Idea detail with approval
- `StoreShirtsScreen/` - Dress inventory grid

### View Models:
- `StOrdersVM.swift` - Orders list logic
- `StOrderDetailsVM.swift` - Order detail logic
- `ConvertIdeaToDressScreenVM.swift` - Ideas list logic
- `DesignerIdeaDetailScreenVM.swift` - Idea detail logic
- `StoreShirtsScreenVM.swift` - Dress inventory logic
- `InfoStReportGeneralVM.swift` - Statistics logic
- `StReportVM.swift` - Reports logic

### Models & Enums:
- `User.swift` - User role checking
- `StHomeDressesDM.swift` - Order list data model
- `StDressOrderDetailDM.swift` - Order detail data model
- `ConvertIdeaToDressScreenDM.swift` - Idea list data model
- `DesignerIdeaDM.swift` - Idea detail data model
- `DressDM.swift` - Dress data model
- `ReportWarehouseGeneralDM.swift` - Statistics data model
- `IdeaToDressDetailStatusEnum.swift` - Idea approval status enum

---

## 12. Sample Use Cases

### Use Case 1: Accept a Dress Order
```
1. Factory Manager opens Orders tab
2. Views list of unaccepted orders
3. Taps on an order to view details
4. Reviews dress specifications, images, bride/salon information
5. Taps "Accept" button
6. API call: PUT /dress-order/accept with accept=true
7. Order status changes to "accepted"
8. Order appears in accepted orders list
```

### Use Case 2: Approve Designer Idea
```
1. Factory Manager opens "Convert Idea to Dress" screen
2. Views list of completed designer ideas
3. Taps on an idea to view details
4. Reviews idea images, description, assigned workers
5. Taps "Approve" button
6. API call: PATCH /designer/transfer/to/dress with action="TRANSFER"
7. Idea is converted to dress template
8. Dress becomes available in inventory
```

### Use Case 3: View Statistics
```
1. Factory Manager opens Statistics tab
2. Selects date range (from/to dates)
3. API call: GET /report/warehouse-general with date parameters
4. Views dashboard showing:
   - Total orders: 150
   - Accepted: 120
   - Unaccepted: 20
   - Rejected: 10
5. Optionally filters by specific user
```

---

End of Factory Manager API Documentation
