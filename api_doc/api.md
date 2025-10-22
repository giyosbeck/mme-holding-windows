# MME Holding API Documentation

## WAREHOUSE Role APIs

This document covers:
- Login/Authentication APIs
- All APIs used by WAREHOUSE role users

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
  "userRole": "2",
  "userRoleStatus": 1,
  "token": "authentication-token",
  "selected_language": "uz"
}
```

**Response Fields:**
- `expired` - Boolean indicating if account is expired
- `userID` - Unique user identifier
- `userRole` - User's role code (WAREHOUSE = "2")
- `userRoleStatus` - Role status (0 = pending, 1+ = active)
- `token` - Authentication token for subsequent requests
- `selected_language` - User's preferred language code

**Role Codes:**
- `"2"` = WAREHOUSE

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

## 2. WAREHOUSE Role APIs

### Role Information
- **Role Code:** `"2"`
- **Enum:** `WAREHOUSE`
- **User Check:** `User.shared.isWarehouse`

---

## 3. Supply Management APIs

These APIs manage product supplies to employees and projects.

---

### 3.1 Create Supply

Creates a new supply entry when providing products to employees.

**Endpoint:** `POST /supply/create`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "product_id": "string",
  "project_id": "string",
  "receiver_id": "string",
  "quantity": 100
}
```

**Request Fields:**
- `product_id` - ID of the product being supplied
- `project_id` - ID of the project
- `receiver_id` - ID of the employee receiving the product
- `quantity` - Amount being supplied

**Response:**
Returns supply ID on success

**Used In:**
- Warehouse Product Use Sheet (when creating supplies)
- Warehouse Products Type List Screen

---

### 3.2 Get Employee Projects

Retrieves all projects associated with a specific employee.

**Endpoint:** `GET /supply/get/employee/projects`

**Headers:** Requires authentication token

**Query Parameters:**
```
role={roleEnum}&employeeId={employeeId}
```

**Parameters:**
- `role` - Employee role (e.g., "DESIGNER", "HR_MANAGER", "SEWING_MANAGER")
- `employeeId` - ID of the employee

**Response:**
```json
[
  {
    "projectId": "string",
    "projectName": "string"
  }
]
```

**Used In:**
- Warehouse Product Supply Form Screen (when selecting employee projects)

---

### 3.3 Return Product

Marks a supply as returned by the warehouse.

**Endpoint:** `PATCH /supply/returned/{supplyId}`

**Headers:** Requires authentication token

**Path Parameters:**
- `{supplyId}` - ID of the supply to return

**Request Body:**
```json
{
  "quantity": 50
}
```

**Request Fields:**
- `quantity` - Amount being returned

**Used In:**
- Warehouse Supply Received Product Screen

---

### 3.4 Accept Supply Product

Marks a supply as accepted/received.

**Endpoint:** `PATCH /supply/accepted/{supplyId}/product`

**Headers:** Requires authentication token

**Path Parameters:**
- `{supplyId}` - ID of the supply to accept

**Request Body:** None

**Response:**
Returns supply ID on success

**Used In:**
- Warehouse Supply Received Product Screen

---

### 3.5 Cancel Supply Product

Marks a supply as cancelled.

**Endpoint:** `PATCH /supply/cancelled/{supplyId}/product`

**Headers:** Requires authentication token

**Path Parameters:**
- `{supplyId}` - ID of the supply to cancel

**Request Body:** None

**Response:**
Returns supply ID on success

**Used In:**
- Warehouse Supply Received Product Screen

---

### 3.6 Get Projects List

Retrieves list of all supply projects.

**Endpoint:** `GET /supply/get/projects`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "projectName": "string",
    "image": "string",
    "projectType": "string",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

**Response Fields:**
- `id` - Project ID
- `projectName` - Name of the project
- `image` - Project image URL
- `projectType` - Type of project
- `createdAt` - Project creation timestamp

**Used In:**
- Warehouse Product Supply History Screen

---

### 3.7 Get Products by Project ID

Retrieves all products in a supply project.

**Endpoint:** `GET /supply/get/{projectId}/products`

**Headers:** Requires authentication token

**Path Parameters:**
- `{projectId}` - ID of the project

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "productId": "string",
    "productName": "string",
    "productImage": "string",
    "productCount": "100",
    "status": "pending",
    "givenAt": "2024-01-15T10:30:00Z"
  }
]
```

**Response Fields:**
- `id` - Supply ID
- `productId` - Product ID
- `productName` - Name of the product
- `productImage` - Product image URL
- `productCount` - Quantity supplied
- `status` - Supply status: "pending", "accepted", "canceled"
- `givenAt` - Timestamp when product was given

**Used In:**
- Warehouse Supply Received Product Screen

---

## 4. Product Management APIs

These APIs manage warehouse inventory and product catalog.

---

### 4.1 Get Product Categories

Retrieves list of all product categories.

**Endpoint:** `GET /product-category/all`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "name": "string"
  }
]
```

**Used In:**
- Warehouse Products Type List Screen

---

### 4.2 Create Product Category

Creates a new product category.

**Endpoint:** `POST /product-category/create`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "name": "string"
}
```

**Response:**
Returns category ID and name on success

---

### 4.3 Create Product Name

Creates a new product name under a category.

**Endpoint:** `POST /product-name/create`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "name": "string",
  "warehouse_product_category_id": "string"
}
```

**Request Fields:**
- `name` - Product name
- `warehouse_product_category_id` - Category ID for the product

---

### 4.4 Create Product Item

Creates a new product in warehouse inventory.

**Endpoint:** `POST /product/create`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "product_name": "string",
  "product_count": 100,
  "product_price_usd": 50.00,
  "product_price_uzs": 500000,
  "unit_of_measure": "string",
  "product_count_warning_limit": 10,
  "warehouse_product_category_id": "string",
  "created_at": "2024-01-15T10:30:00Z",
  "product_description": "string",
  "product_image": "string",
  "product_code": "string"
}
```

**Request Fields:**
- `product_name` - Name of the product (required)
- `product_count` - Initial quantity (required)
- `product_price_usd` - Price in USD (required)
- `product_price_uzs` - Price in UZS (required)
- `unit_of_measure` - Unit of measurement (required)
- `product_count_warning_limit` - Minimum quantity alert threshold (required)
- `warehouse_product_category_id` - Category ID (required)
- `created_at` - Creation timestamp (optional)
- `product_description` - Product description (optional)
- `product_image` - Product image URL (optional)
- `product_code` - Product code/SKU (optional)

**Used In:**
- Add Items screen (when adding new products)

---

### 4.5 Get All Products

Retrieves paginated list of all products.

**Endpoint:** `GET /product/all`

**Headers:** Requires authentication token

**Query Parameters:**
```
limit={limit}&offset={offset}&search={searchTerm}
```

**Parameters:**
- `limit` - Number of products per page (required)
- `offset` - Page offset (required)
- `search` - Search term for filtering (optional)

**Response:**
```json
{
  "products": [
    {
      "id": "string",
      "product_name": "string",
      "product_count": 100,
      "product_price_usd": 50.00,
      "product_price_uzs": 500000,
      "unit_of_measure": "string",
      "warehouse_product_category_id": "string"
    }
  ],
  "total": 150
}
```

---

### 4.6 Get Products by Category ID

Retrieves products filtered by category.

**Endpoint:** `GET /product/{categoryId}`

**Headers:** Requires authentication token

**Path Parameters:**
- `{categoryId}` - ID of the category

**Query Parameters:**
```
limit={limit}&offset={offset}&search={searchTerm}
```

**Parameters:**
- `limit` - Number of products per page (required)
- `offset` - Page offset (required)
- `categoryId` - Category ID (required)
- `search` - Search term for filtering (optional)

**Used In:**
- Products in Storage screen (when selecting products for supply)

---

### 4.7 Update Product Item

Updates existing product details.

**Endpoint:** `PUT /product/update`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "id": "string",
  "product_name": "string",
  "warehouse_product_category_id": "string",
  "product_code": "string",
  "product_count_warning_limit": 10,
  "product_image": "string"
}
```

**Request Fields:**
- `id` - Product ID (required)
- `product_name` - Updated product name (required)
- `warehouse_product_category_id` - Category ID (required)
- `product_code` - Product code/SKU (required)
- `product_count_warning_limit` - Minimum quantity alert (required)
- `product_image` - Product image URL (optional)

---

### 4.8 Delete Product

Deletes a product from inventory.

**Endpoint:** `DELETE /product/one`

**Headers:** Requires authentication token

**Query Parameters:**
```
id={productId}
```

**Parameters:**
- `id` - Product ID to delete

---

### 4.9 Product Use

Records product usage/consumption from warehouse.

**Endpoint:** `PUT /product/use`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "id": "string",
  "productCount": 50
}
```

**Request Fields:**
- `id` - Product ID
- `productCount` - Quantity being used/consumed

---

### 4.10 Add Product Inventory

Adds new quantity to existing product inventory.

**Endpoint:** `POST /product/add`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "id": "string",
  "product_count": 100,
  "product_price": 50000,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Request Fields:**
- `id` - Product ID (required)
- `product_count` - Quantity to add (required)
- `product_price` - Price of the added inventory (required)
- `created_at` - Timestamp (optional)

---

## 5. Expense Management APIs

---

### 5.1 Create Expense

Creates an expense record in warehouse operations.

**Endpoint:** `POST /expense/create`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "expense_name": "string",
  "expense_usd": 100,
  "expense_uzs": 1000000,
  "added_by": "WAREHOUSE"
}
```

**Request Fields:**
- `expense_name` - Name/description of the expense
- `expense_usd` - Expense amount in USD
- `expense_uzs` - Expense amount in UZS
- `added_by` - Role adding the expense (should be user's role)

**Used In:**
- Create Expense Screen (accessible from warehouse main menu)

---

## 6. Warehouse Reports APIs

---

### 6.1 Get Warehouse Report Details

Retrieves detailed warehouse report for specific user.

**Endpoint:** `GET /report/warehouse-details`

**Headers:** Requires authentication token

**Query Parameters:**
```
user_id={userId}
```

**Parameters:**
- `user_id` - ID of the user

---

### 6.2 Get Warehouse Report General

Retrieves general warehouse report for date range.

**Endpoint:** `GET /report/warehouse-general`

**Headers:** Requires authentication token

**Query Parameters:**
```
from={fromDate}&to={toDate}
```

**Parameters:**
- `from` - Start date (format: YYYY-MM-DD)
- `to` - End date (format: YYYY-MM-DD)

---

### 6.3 Get Warehouse Report General by User

Retrieves warehouse report filtered by user and date range.

**Endpoint:** `GET /report/warehouse-general`

**Headers:** Requires authentication token

**Query Parameters:**
```
from={fromDate}&to={toDate}&user_id={userId}
```

**Parameters:**
- `from` - Start date (format: YYYY-MM-DD)
- `to` - End date (format: YYYY-MM-DD)
- `user_id` - User ID to filter by

---

### 6.4 Get Outgoing Products Report

Retrieves report of products going out of warehouse.

**Endpoint:** `GET /report/outgoing-products`

**Headers:** Requires authentication token

**Query Parameters:**
```
user_id={userId}&from={fromDate}&to={toDate}
```

**Parameters (all optional):**
- `user_id` - Filter by user ID
- `from` - Start date (format: YYYY-MM-DD)
- `to` - End date (format: YYYY-MM-DD)

**Response:**
```json
[
  {
    "product_id": "string",
    "product_name": "string",
    "quantity": 100,
    "date": "2024-01-15T10:30:00Z"
  }
]
```

---

## 7. Employee Management APIs

---

### 7.1 Get All Employees

Retrieves list of employees, optionally filtered by role.

**Endpoint:** `GET /employee/all`

**Headers:** Requires authentication token

**Query Parameters:**
```
role={roleEnum}
```

**Parameters:**
- `role` - Filter by role (optional). Values: "DESIGNER", "HR_MANAGER", "SEWING_MANAGER", etc.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "phone": "998901234567",
    "role_id": "string",
    "role": "DESIGNER",
    "roleStatus": 1
  }
]
```

**Response Fields:**
- `id` - Employee ID
- `name` - Employee name
- `phone` - Employee phone number
- `role_id` - Role ID
- `role` - Role enum value
- `roleStatus` - Role status (0 = pending, 1+ = active)

**Used In:**
- Warehouse Product Supply Form Screen (selecting employees by role to supply products)

---

## 8. User Profile APIs

These APIs manage user profile information.

---

### 8.1 Get Profile Data

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
  "role": "WAREHOUSE",
  "language": "uz"
}
```

---

### 8.2 Get User Information

Gets user information including account status.

**Endpoint:** `GET /login/user/{userId}`

**Headers:** Requires authentication token

**Path Parameters:**
- `{userId}` - User ID

---

### 8.3 Edit Profile

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
- `id` - User ID
- `name` - User's first name
- `surname` - User's last name
- `language` - Preferred language code

---

### 8.4 Get Phone Change Code

Requests verification code for phone number change.

**Endpoint:** `GET /user/code-change-phone`

**Headers:** Requires authentication token

**Query Parameters:**
```
phone={newPhoneNumber}
```

**Parameters:**
- `phone` - New phone number (without + prefix)

---

### 8.5 Verification Code

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

## 9. WAREHOUSE Role Workflow

### Main Menu Options:
1. **"Yangi mahsulot kiritish"** - Add New Product
2. **"Ombordagi mahsulotlar"** - Products in Storage
3. **"Ta'minot"** - Supply Management
4. **"Xarajat kiritish"** - Add Expense

### Supply Workflow:
1. Select employee type (DESIGNER/HR_MANAGER/SEWING_MANAGER)
2. Select specific employee
3. Select employee's project
4. Browse products by category
5. Select products and specify quantity
6. Create supply
7. Track supply history
8. Manage received products (accept/cancel/return)

---

## 10. API Summary

### Total Endpoints: 27

| Category | Count | Endpoints |
|----------|-------|-----------|
| Authentication | 2 | Phone login, OTP verification |
| Supply Management | 7 | Create, get projects, return, accept, cancel, list projects, get products |
| Product Management | 10 | Categories, create, read, update, delete, add inventory, use |
| Warehouse Reports | 4 | Details, general, by user, outgoing products |
| Employee Management | 1 | Get all employees |
| User Profile | 5 | Get profile, user info, edit, phone change, verify code |
| Expense Management | 1 | Create expense |

---

## 11. Important Notes

### Authentication Flow:
1. User enters phone number
2. App requests OTP via `/login/phone`
3. User receives SMS with OTP code
4. User enters OTP
5. App verifies OTP via `/login/code`
6. App receives auth token
7. Token stored in UserDefaults with key `.token`
8. All subsequent requests use `Authorization: mme:{token}` header

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

---

## File References

### API Managers:
- `WarehouseSupplyAPIManager.swift` - Supply management
- `StorageAPI.swift` - Product and inventory management
- `ProfileSideAPI.swift` - Employee and profile management
- `RegisterAPI.swift` - Authentication endpoints
- `Net.swift` - Network layer

### Warehouse Screens:
- `WarehouseMainScreen.swift` - Main menu
- `WarehouseProductSupplyScreen.swift` - Supply management
- `WarehouseProductSupplyFormScreen.swift` - Supply form
- `WarehouseProductSupplyHistoryScreen.swift` - Supply history
- `WarehouseSupplyReceivedProductScreen.swift` - Received products
- `WarehouseProductsTypeListScreen.swift` - Product categories
- `WarehouseProductUseSheetVM.swift` - Product usage sheet

### Tab Bar:
- `WarehouseTabBar.swift` - Navigation structure
