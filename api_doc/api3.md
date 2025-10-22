# MME Holding API Documentation

## SALON Role APIs

This document covers:
- Login/Authentication APIs
- All APIs used by SALON role users

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
  "userRole": "3",
  "userRoleStatus": 1,
  "token": "authentication-token",
  "selected_language": "uz"
}
```

**Response Fields:**
- `expired` - Boolean indicating if account is expired
- `userID` - Unique user identifier
- `userRole` - User's role code (SALON = "3")
- `userRoleStatus` - Role status (0 = pending, 1+ = active)
- `token` - Authentication token for subsequent requests
- `selected_language` - User's preferred language code

**Role Codes:**
- `"3"` = SALON

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

## 2. SALON Role APIs

### Role Information
- **Role Code:** `"3"`
- **Enum:** `SALON` (also referred to as `SELLER` in some parts of code)
- **User Check:** `User.shared.isSalon`

---

## 3. Dress Management APIs

These APIs manage the dress catalog/inventory.

---

### 3.1 Create Dress

Creates a new dress in the catalog.

**Endpoint:** `POST /dress/create`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "dress_image": ["image_url1", "image_url2"],
  "dress_name": "Wedding Dress Classic",
  "dress_price": 10000000,
  "created_by_user": "user-id",
  "dress_color": "White",
  "dress_shleft_size": 42,
  "dress_author": "Designer Name",
  "dress_author_id": "author-id",
  "description": "Beautiful wedding dress"
}
```

**Request Fields:**
- `dress_image` - Array of dress image URLs (required)
- `dress_name` - Name of the dress (required)
- `dress_price` - Price in UZS (required)
- `created_by_user` - User ID creating the dress (required)
- `dress_color` - Dress color (required)
- `dress_shleft_size` - Dress size (required)
- `dress_author` - Author/designer name (required)
- `dress_author_id` - Author/designer ID (required)
- `description` - Dress description (optional)

**Used In:**
- `FillDressVC` - Create new dress screen

---

### 3.2 Update Dress

Updates existing dress information.

**Endpoint:** `PUT /dress/update`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "id": "dress-id",
  "dress_image": ["image_url1"],
  "dress_name": "Updated Dress Name",
  "dress_price": 12000000,
  "dress_color": "Ivory",
  "dress_shleft_size": 44,
  "dress_author": "Designer Name",
  "dress_author_id": "author-id",
  "description": "Updated description"
}
```

**Request Fields:**
- `id` - Dress ID (required)
- Other fields same as create dress

---

### 3.3 Get All Dresses

Retrieves list of all dresses.

**Endpoint:** `GET /dress/all`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "dress_image": ["url1", "url2"],
    "dress_name": "Wedding Dress",
    "dress_price": 10000000,
    "dress_color": "White",
    "dress_shleft_size": 42,
    "dress_author": "Designer Name",
    "dress_author_id": "author-id",
    "in_stock": true,
    "description": "Description"
  }
]
```

**Response Fields:**
- `id` - Dress ID
- `dress_image` - Array of image URLs
- `dress_name` - Dress name
- `dress_price` - Price in UZS
- `dress_color` - Dress color
- `dress_shleft_size` - Dress size
- `dress_author` - Designer/author name
- `dress_author_id` - Designer/author ID
- `in_stock` - Stock availability
- `description` - Dress description

**Used In:**
- `AllDressListVC` - Dress list screen

---

### 3.4 Get Dresses Ordered by Date

Retrieves dresses sorted by creation date.

**Endpoint:** `GET /dress/ordered-by-date`

**Headers:** Requires authentication token

**Request Body:** None

**Response:** Same format as Get All Dresses

---

### 3.5 Get Dress Detail by ID

Retrieves complete details for a specific dress.

**Endpoint:** `GET /dress/{id}`

**Headers:** Requires authentication token

**Path Parameters:**
- `{id}` - Dress ID

**Request Body:** None

**Response:**
```json
{
  "id": "string",
  "dress_image": ["url1", "url2"],
  "dress_name": "Wedding Dress",
  "dress_price": 10000000,
  "dress_color": "White",
  "dress_shleft_size": 42,
  "dress_author": "Designer Name",
  "dress_author_id": "author-id",
  "in_stock": true,
  "description": "Description",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 3.6 Delete Dress

Deletes a dress from the catalog.

**Endpoint:** `DELETE /dress/delete`

**Headers:** Requires authentication token

**Query Parameters:**
```
id={dressId}
```

**Parameters:**
- `id` - Dress ID to delete

**Response:**
Returns success status

---

### 3.7 Delete Dress Image

Deletes a specific image from a dress.

**Endpoint:** `DELETE /dress/delete-image`

**Headers:** Requires authentication token

**Query Parameters:**
```
id={dressId}&imageURL={imageUrl}
```

**Parameters:**
- `id` - Dress ID
- `imageURL` - Image URL to delete

---

### 3.8 Get Dress Colors

Retrieves list of available dress colors.

**Endpoint:** `GET /dress/colors`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "color": "White"
  },
  {
    "color": "Ivory"
  }
]
```

**Used In:**
- Color selection dropdowns in dress forms

---

### 3.9 Get Dress Authors

Retrieves list of all dress authors/designers.

**Endpoint:** `GET /dress/authors`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "name": "Designer Name"
  }
]
```

**Used In:**
- Author selection in dress creation/editing

---

### 3.10 Create Dress Author

Creates a new dress author/designer.

**Endpoint:** `POST /dress/author`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "name": "Designer Name"
}
```

**Request Fields:**
- `name` - Author/designer name

---

### 3.11 Update Dress Stock Status

Updates whether a dress is in stock or not.

**Endpoint:** `PUT /dress/in-stock`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "id": "dress-id",
  "in_stock": true
}
```

**Request Fields:**
- `id` - Dress ID
- `in_stock` - Boolean stock status

---

### 3.12 Get Ready Dresses for Orders

Retrieves all dresses that are ready to be ordered.

**Endpoint:** `GET /dress-order/ready/all`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "dress_name": "Wedding Dress",
    "dress_image": ["url1"],
    "dress_color": "White",
    "dress_shleft_size": 42,
    "base_price": 10000000
  }
]
```

**Used In:**
- Dress selection in order creation forms

---

## 4. Salon Management APIs

These APIs manage salon (customer) information.

---

### 4.1 Create Salon

Creates a new salon customer.

**Endpoint:** `POST /salon/create`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "image": "salon_image_url",
  "salon_name": "Luxury Bridal Salon",
  "customer_name": "Owner Name",
  "customer_phone": "998901234567",
  "salon_address": "123 Main Street, Tashkent",
  "salon_lat": 41.2995,
  "salon_lng": 69.2401,
  "created_by_user": "user-id",
  "description": "Premium bridal salon"
}
```

**Request Fields:**
- `image` - Salon image URL (required)
- `salon_name` - Name of the salon (required)
- `customer_name` - Owner/contact person name (required)
- `customer_phone` - Contact phone number (required)
- `salon_address` - Physical address (required)
- `salon_lat` - Latitude coordinate (required)
- `salon_lng` - Longitude coordinate (required)
- `created_by_user` - User ID creating the salon (required)
- `description` - Additional notes (optional)

**Response:**
```json
{
  "id": "salon-id",
  "salon_name": "Luxury Bridal Salon"
}
```

**Used In:**
- `SalonDetailScreen` (SwiftUI) - Create salon screen

---

### 4.2 Get All Salons

Retrieves list of all salons.

**Endpoint:** `GET /salon/all`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "salon_name": "Luxury Bridal Salon",
    "salon_image": "image_url"
  }
]
```

**Response Fields:**
- `id` - Salon ID
- `salon_name` - Salon name
- `salon_image` - Salon image URL

**Used In:**
- `SalonListsVC` - Salon selection screens
- Dropdown/picker components for salon selection

---

### 4.3 Get Salon Details by ID

Retrieves complete details and statistics for a specific salon.

**Endpoint:** `GET /salon/all/{salonID}/`

**Headers:** Requires authentication token

**Path Parameters:**
- `{salonID}` - Salon ID

**Request Body:** None

**Response:**
```json
{
  "id": "string",
  "salon_name": "Luxury Bridal Salon",
  "customer_name": "Owner Name",
  "customer_phone": "998901234567",
  "salon_address": "123 Main Street",
  "salon_image": "image_url",
  "description": "Premium salon",
  "created_at": "2024-01-15T10:30:00Z",
  "orders": {
    "dress_count": 25,
    "payment": 150000000,
    "debt": 50000000,
    "total_sale": 200000000
  },
  "simple_sale": {
    "dress_count": 15,
    "payment": 80000000,
    "debt": 20000000,
    "total_sale": 100000000
  },
  "sale_5050": {
    "dress_count": 10,
    "payment": 60000000,
    "debt": 40000000,
    "total_sale": 100000000
  },
  "accessory": {
    "payment": 5000000
  },
  "salon_debt": 110000000,
  "product_count": 50,
  "salon_total_sale": 405000000
}
```

**Response Fields:**
- `id` - Salon ID
- `salon_name` - Salon name
- `customer_name` - Contact person name
- `customer_phone` - Contact phone
- `salon_address` - Physical address
- `salon_image` - Image URL
- `description` - Notes
- `created_at` - Creation timestamp
- `orders` - Dress order statistics
  - `dress_count` - Number of dress orders
  - `payment` - Total paid
  - `debt` - Outstanding debt
  - `total_sale` - Total sale amount
- `simple_sale` - Simple sale statistics (same structure)
- `sale_5050` - 50/50 sale statistics (same structure)
- `accessory` - Accessory sale statistics
  - `payment` - Total accessory payments
- `salon_debt` - Total outstanding debt
- `product_count` - Total products sold
- `salon_total_sale` - Total sales amount

**Used In:**
- `SalonDetailScreen` - Salon detail view
- `DebtorDetailsVC` - Debtor detail screen

---

## 5. Simple Sale APIs

These APIs manage simple (ordinary) dress sales.

---

### 5.1 Create Simple Sale

Creates a new simple sale transaction.

**Endpoint:** `POST /simple-sale/create`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "dresses": [
    {
      "dress_id": "dress-id-1",
      "dress_name": "Wedding Dress",
      "dress_color": "White",
      "shleft_size": 42,
      "base_price": 10000000,
      "price": 12000000
    }
  ],
  "total_order_summ": 12000000,
  "must_be_delivered": true,
  "created_by_user": "user-id",
  "customer_salon_id": "salon-id",
  "money_salon_usd": 1000,
  "money_salon_uzs": 11000000,
  "central_bank_usd_course": 11000,
  "description": "Special order notes",
  "delivery_date": "2024-06-15",
  "date_gives_debt": "2024-07-01"
}
```

**Request Fields:**
- `dresses` - Array of dresses in the sale (required)
  - `dress_id` - Dress ID
  - `dress_name` - Dress name
  - `dress_color` - Dress color
  - `shleft_size` - Dress size
  - `base_price` - Base price
  - `price` - Final sale price
- `total_order_summ` - Total sale amount (required)
- `must_be_delivered` - Delivery required flag (required)
- `created_by_user` - User ID (required)
- `customer_salon_id` - Salon ID (required)
- `money_salon_usd` - Payment in USD (required)
- `money_salon_uzs` - Payment in UZS (required)
- `central_bank_usd_course` - USD exchange rate (required)
- `description` - Additional notes (optional)
- `delivery_date` - Delivery date (optional, format: "yyyy-MM-dd")
- `date_gives_debt` - Debt payment deadline (optional, format: "yyyy-MM-dd")

**Response:**
```json
{
  "id": "simple-sale-id"
}
```

**Used In:**
- `SimpleSaleVC` - Simple sale creation screen

---

### 5.2 Get All Simple Sales

Retrieves paginated list of all simple sales.

**Endpoint:** `GET /simple-sale/all`

**Headers:** Requires authentication token

**Query Parameters:**
```
limit={limit}&offset={offset}
```

**Parameters:**
- `limit` - Number of records per page (required)
- `offset` - Page offset (required)

**Response:**
```json
[
  {
    "id": "string",
    "salon_name": "Salon Name",
    "total_price": 12000000,
    "debt": 2000000,
    "created_at": "2024-01-15T10:30:00Z",
    "dresses": [
      {
        "dress_name": "Wedding Dress",
        "dress_color": "White",
        "shleft_size": 42,
        "price": 12000000
      }
    ]
  }
]
```

**Used In:**
- Simple sale list screens

---

### 5.3 Get Simple Sale Details by ID

Retrieves complete details for a specific simple sale.

**Endpoint:** `GET /simple-sale/{id}`

**Headers:** Requires authentication token

**Path Parameters:**
- `{id}` - Simple sale ID

**Request Body:** None

**Response:**
```json
{
  "id": "string",
  "salon_id": "string",
  "salon_name": "Salon Name",
  "total_order_summ": 12000000,
  "money_salon": 10000000,
  "debt": 2000000,
  "delivery_date": "2024-06-15",
  "must_be_delivered": true,
  "description": "Notes",
  "created_at": "2024-01-15T10:30:00Z",
  "dresses": [
    {
      "dress_id": "string",
      "dress_name": "Wedding Dress",
      "dress_color": "White",
      "shleft_size": 42,
      "base_price": 10000000,
      "price": 12000000
    }
  ]
}
```

---

### 5.4 Get All Simple Sale Debts

Retrieves list of all simple sales with outstanding debts.

**Endpoint:** `GET /simple-sale/debt/all`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "salon_id": "string",
    "salon_name": "Salon Name",
    "debt": 2000000,
    "date_gives_debt": "2024-07-01",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Response Fields:**
- `id` - Simple sale ID
- `salon_id` - Salon ID
- `salon_name` - Salon name
- `debt` - Outstanding debt amount
- `date_gives_debt` - Debt payment deadline
- `created_at` - Creation timestamp

**Used In:**
- `ListOfDebtorsVC` - Debtors list
- Debt management screens

---

### 5.5 Pay Simple Sale Debt

Records a payment for simple sale debt.

**Endpoint:** `POST /simple-sale/debt/payment`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "money_salon_usd": 100,
  "money_salon_uzs": 1100000,
  "central_bank_usd_course": 11000,
  "simple_sale_id": "sale-id",
  "debt": 2000000
}
```

**Request Fields:**
- `money_salon_usd` - Payment in USD (required)
- `money_salon_uzs` - Payment in UZS (required)
- `central_bank_usd_course` - USD exchange rate (required)
- `simple_sale_id` - Simple sale ID (required)
- `debt` - Current debt amount (required)

**Response:**
```json
{
  "success": true
}
```

**Used In:**
- `SimpleSaleDebtPaymentVC` - Payment screen

---

### 5.6 Get Simple Sale Payment History

Retrieves payment history for a simple sale.

**Endpoint:** `GET /simple-sale/debt-history/{orderId}`

**Headers:** Requires authentication token

**Path Parameters:**
- `{orderId}` - Simple sale ID

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "money_salon_usd": 100,
    "money_salon_uzs": 1100000,
    "debt_before": 3000000,
    "debt_after": 2000000,
    "payment_date": "2024-01-20T10:30:00Z"
  }
]
```

**Response Fields:**
- `id` - Payment record ID
- `money_salon_usd` - Payment in USD
- `money_salon_uzs` - Payment in UZS
- `debt_before` - Debt before payment
- `debt_after` - Debt after payment
- `payment_date` - Payment timestamp

**Used In:**
- `SimpleSalePaymentHistoryVC` - Payment history screen

---

## 6. 50/50 Sale APIs

These APIs manage 50/50 sales where payment is split between salon and bride.

---

### 6.1 Create 50/50 Sale

Creates a new 50/50 sale transaction.

**Endpoint:** `POST /sale5050/create`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "dress_id": "dress-id",
  "dress_name": "Wedding Dress",
  "dress_color": "White",
  "shleft_size": 42,
  "base_price": 10000000,
  "price": 12000000,
  "bride_name": "Bride Name",
  "bride_passport_taken": true,
  "bride_must_be_delivered": true,
  "delivery_date": "2024-06-15",
  "created_by_user": "user-id",
  "customer_salon_id": "salon-id",
  "date_gives_debt_salon": "2024-07-01",
  "date_gives_debt_bride": "2024-07-15",
  "description": "Special notes",
  "money_salon_usd": 500,
  "money_salon_uzs": 5500000,
  "money_bride_usd": 500,
  "money_bride_uzs": 5500000,
  "central_bank_usd_course": 11000,
  "salon_must_pay": 6000000,
  "bride_must_pay": 6000000
}
```

**Request Fields:**
- `dress_id` - Dress ID (required)
- `dress_name` - Dress name (required)
- `dress_color` - Dress color (required)
- `shleft_size` - Dress size (required)
- `base_price` - Base price (required)
- `price` - Final sale price (required)
- `bride_name` - Bride's name (required)
- `bride_passport_taken` - Passport status (required)
- `bride_must_be_delivered` - Bride delivery flag (required)
- `delivery_date` - Delivery date (optional)
- `created_by_user` - User ID (required)
- `customer_salon_id` - Salon ID (optional, can be added later)
- `date_gives_debt_salon` - Salon debt deadline (optional)
- `date_gives_debt_bride` - Bride debt deadline (optional)
- `description` - Additional notes (optional)
- `money_salon_usd` - Salon payment in USD (required)
- `money_salon_uzs` - Salon payment in UZS (required)
- `money_bride_usd` - Bride payment in USD (required)
- `money_bride_uzs` - Bride payment in UZS (required)
- `central_bank_usd_course` - USD exchange rate (required)
- `salon_must_pay` - Total salon portion (required)
- `bride_must_pay` - Total bride portion (required)

**Response:**
```json
{
  "id": "sale-5050-id"
}
```

**Used In:**
- `Sale5050VC` - 50/50 sale creation screen

---

### 6.2 Get All 50/50 Sales

Retrieves list of all 50/50 sales.

**Endpoint:** `GET /sale5050/all`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "salon_name": "Salon Name",
    "bride_name": "Bride Name",
    "dress_name": "Wedding Dress",
    "dress_color": "White",
    "total_price": 12000000,
    "salon_debt": 1000000,
    "bride_debt": 1000000,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Used In:**
- 50/50 sale list screens

---

### 6.3 Get 50/50 Sale Details by ID

Retrieves complete details for a specific 50/50 sale.

**Endpoint:** `GET /sale5050/{id}`

**Headers:** Requires authentication token

**Path Parameters:**
- `{id}` - 50/50 sale ID

**Request Body:** None

**Response:**
```json
{
  "id": "string",
  "salon_id": "string",
  "salon_name": "Salon Name",
  "bride_name": "Bride Name",
  "bride_passport_taken": true,
  "dress_id": "string",
  "dress_name": "Wedding Dress",
  "dress_color": "White",
  "shleft_size": 42,
  "price": 12000000,
  "money_salon": 6000000,
  "money_bride": 6000000,
  "salon_debt": 1000000,
  "bride_debt": 1000000,
  "delivery_date": "2024-06-15",
  "bride_must_be_delivered": true,
  "description": "Notes",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 6.4 Get All 50/50 Debts

Retrieves list of all 50/50 sales with outstanding debts.

**Endpoint:** `GET /sale5050/debt/all`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "salon_id": "string",
    "salon_name": "Salon Name",
    "bride_name": "Bride Name",
    "salon_debt": 1000000,
    "bride_debt": 1000000,
    "date_gives_debt_salon": "2024-07-01",
    "date_gives_debt_bride": "2024-07-15",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Used In:**
- `ListOfDebtorsVC` - Debtors list
- Debt management screens

---

### 6.5 Pay 50/50 Debt

Records a payment for 50/50 sale debt (salon and/or bride).

**Endpoint:** `POST /sale5050/debt/payment`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "money_salon_usd": 50,
  "money_salon_uzs": 550000,
  "money_bride_usd": 50,
  "money_bride_uzs": 550000,
  "bride_passport_given": false,
  "central_bank_usd_course": 11000,
  "sale_50_50_id": "sale-id",
  "debt_bride": 1000000,
  "debt_salon": 1000000
}
```

**Request Fields:**
- `money_salon_usd` - Salon payment in USD (required)
- `money_salon_uzs` - Salon payment in UZS (required)
- `money_bride_usd` - Bride payment in USD (required)
- `money_bride_uzs` - Bride payment in UZS (required)
- `bride_passport_given` - Passport return status (required)
- `central_bank_usd_course` - USD exchange rate (required)
- `sale_50_50_id` - 50/50 sale ID (required)
- `debt_bride` - Current bride debt (required)
- `debt_salon` - Current salon debt (required)

**Response:**
```json
{
  "success": true
}
```

**Used In:**
- `BrideDebtPaymentVC` - Payment screen for 50/50 sales

---

### 6.6 Get 50/50 Payment History

Retrieves payment history for a 50/50 sale.

**Endpoint:** `GET /sale5050/debt-history`

**Headers:** Requires authentication token

**Query Parameters:**
```
search_by={saleId}
```

**Parameters:**
- `search_by` - 50/50 sale ID

**Response:**
```json
[
  {
    "id": "string",
    "money_salon_usd": 50,
    "money_salon_uzs": 550000,
    "money_bride_usd": 50,
    "money_bride_uzs": 550000,
    "salon_debt_before": 1500000,
    "salon_debt_after": 1000000,
    "bride_debt_before": 1500000,
    "bride_debt_after": 1000000,
    "bride_passport_given": false,
    "payment_date": "2024-01-20T10:30:00Z"
  }
]
```

**Response Fields:**
- `id` - Payment record ID
- `money_salon_usd` - Salon payment in USD
- `money_salon_uzs` - Salon payment in UZS
- `money_bride_usd` - Bride payment in USD
- `money_bride_uzs` - Bride payment in UZS
- `salon_debt_before` - Salon debt before payment
- `salon_debt_after` - Salon debt after payment
- `bride_debt_before` - Bride debt before payment
- `bride_debt_after` - Bride debt after payment
- `bride_passport_given` - Passport return status
- `payment_date` - Payment timestamp

**Used In:**
- `FiftyFiftySaleDebtPaymentHistoryVC` - Payment history screen

---

### 6.7 Get 50/50 Sales Without Salon

Retrieves 50/50 sales that don't have an associated salon yet.

**Endpoint:** `GET /sale5050/not-salon`

**Headers:** Requires authentication token

**Query Parameters:**
```
limit={limit}&offset={offset}
```

**Parameters:**
- `limit` - Number of records per page (required)
- `offset` - Page offset (required)

**Response:**
```json
[
  {
    "id": "string",
    "bride_name": "Bride Name",
    "dress_name": "Wedding Dress",
    "dress_color": "White",
    "total_price": 12000000,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Used In:**
- `AttachmentSale5050VC` - Attachment screen to add salons to 50/50 sales

---

### 6.8 Connect Salon to 50/50 Sale

Attaches a salon to an existing 50/50 sale.

**Endpoint:** `PUT /sale5050/connect-salon`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "id": "sale-5050-id",
  "customer_salon_id": "salon-id"
}
```

**Request Fields:**
- `id` - 50/50 sale ID (required)
- `customer_salon_id` - Salon ID to attach (required)

**Response:**
```json
{
  "success": true
}
```

**Used In:**
- `AttachmentSale5050VC` - Attaching salon to 50/50 sale

---

## 7. Dress Order APIs

These APIs manage custom dress orders.

---

### 7.1 Create Dress Order (Old Version)

Creates a new dress order using the old format.

**Endpoint:** `POST /dress-order/create`

**Headers:** Requires authentication token

**Request Body:** Similar to new version but with older structure

**Note:** This endpoint is deprecated. Use Create Dress Order (New Version) instead.

---

### 7.2 Create Dress Order (New Version)

Creates a new custom dress order with bride details.

**Endpoint:** `POST /dress-order/create-new`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "dress_id": "dress-id",
  "dress_name": "Custom Wedding Dress",
  "shleft_size": 42,
  "dress_color": "White",
  "base_price": 10000000,
  "images": ["reference_image_url1", "reference_image_url2"],
  "description": "Custom design notes",
  "central_bank_usd_course": 11000,
  "customer_salon_id": "salon-id",
  "date_gives_debt_salon": "2024-07-01",
  "date_gives_debt_bride": "2024-07-15",
  "money_salon_usd": 500,
  "money_salon_uzs": 5500000,
  "money_bride_usd": 500,
  "money_bride_uzs": 5500000,
  "salon_must_pay": 6000000,
  "bride_must_pay": 6000000,
  "wedding_date_bride": "2024-08-15",
  "phone_bride": "998901234567",
  "name_bride": "Bride Name",
  "bride_passport_taken": true,
  "created_by_user": "user-id",
  "order_complate_date": "2024-07-20",
  "must_be_delivered_bride": true,
  "must_be_delivered": true
}
```

**Request Fields:**
- `dress_id` - Base dress template ID (required)
- `dress_name` - Dress name (required)
- `shleft_size` - Dress size (required)
- `dress_color` - Dress color (required)
- `base_price` - Base price (required)
- `images` - Array of reference image URLs (optional)
- `description` - Custom design notes (optional)
- `central_bank_usd_course` - USD exchange rate (required)
- `customer_salon_id` - Salon ID (optional)
- `date_gives_debt_salon` - Salon debt deadline (optional)
- `date_gives_debt_bride` - Bride debt deadline (optional)
- `money_salon_usd` - Salon payment in USD (required)
- `money_salon_uzs` - Salon payment in UZS (required)
- `money_bride_usd` - Bride payment in USD (required)
- `money_bride_uzs` - Bride payment in UZS (required)
- `salon_must_pay` - Total salon portion (required)
- `bride_must_pay` - Total bride portion (required)
- `wedding_date_bride` - Wedding date (optional)
- `phone_bride` - Bride's phone number (optional)
- `name_bride` - Bride's name (optional)
- `bride_passport_taken` - Passport status (required)
- `created_by_user` - User ID (required)
- `order_complate_date` - Order completion date (required)
- `must_be_delivered_bride` - Bride delivery flag (required)
- `must_be_delivered` - General delivery flag (required)

**Response:**
```json
{
  "id": "dress-order-id"
}
```

**Used In:**
- `SlNewOrderVC` - New dress order creation screen

---

### 7.3 Get All Dress Order Debts

Retrieves list of all dress orders with outstanding debts.

**Endpoint:** `GET /dress-order/debt/all`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "order_number": 12345,
    "salon_id": "string",
    "salon_name": "Salon Name",
    "bride_name": "Bride Name",
    "dress_name": "Wedding Dress",
    "salon_debt": 1000000,
    "bride_debt": 1000000,
    "date_gives_debt_salon": "2024-07-01",
    "date_gives_debt_bride": "2024-07-15",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Used In:**
- `ListOfDebtorsVC` - Debtors list
- Debt management screens

---

### 7.4 Get Dress Order Payment History

Retrieves payment history for a dress order.

**Endpoint:** `GET /dress-order/payment/history/{orderID}`

**Headers:** Requires authentication token

**Path Parameters:**
- `{orderID}` - Dress order ID

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "payment_from": "SALON",
    "money_usd": 100,
    "money_uzs": 1100000,
    "salon_debt_before": 2000000,
    "salon_debt_after": 1000000,
    "bride_debt_before": 2000000,
    "bride_debt_after": 2000000,
    "bride_passport_given": false,
    "payment_date": "2024-01-20T10:30:00Z"
  }
]
```

**Response Fields:**
- `id` - Payment record ID
- `payment_from` - Payment source: "SALON" or "BRIDE"
- `money_usd` - Payment in USD
- `money_uzs` - Payment in UZS
- `salon_debt_before` - Salon debt before payment
- `salon_debt_after` - Salon debt after payment
- `bride_debt_before` - Bride debt before payment
- `bride_debt_after` - Bride debt after payment
- `bride_passport_given` - Passport return status
- `payment_date` - Payment timestamp

**Used In:**
- `SalonPaymentHistoryVM` - Payment history view model

---

### 7.5 Pay Dress Order Debt

Records a payment for dress order debt.

**Endpoint:** `POST /dress-order/payment`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "id": "order-id",
  "payment_from": "SALON",
  "money_usd": 100,
  "money_uzs": 1100000,
  "central_bank_usd_course": 11000,
  "bride_passport_given": false
}
```

**Request Fields:**
- `id` - Dress order ID (required)
- `payment_from` - Payment source: "SALON" or "BRIDE" (required)
- `money_usd` - Payment in USD (required)
- `money_uzs` - Payment in UZS (required)
- `central_bank_usd_course` - USD exchange rate (required)
- `bride_passport_given` - Passport return status (optional, for bride payments)

**Response:**
```json
{
  "success": true
}
```

**Used In:**
- Dress order payment screens

---

## 8. Accessory Sale APIs

These APIs manage accessory sales.

---

### 8.1 Create Accessory Sale

Creates a new accessory sale.

**Endpoint:** `POST /accessory/create`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "accessory_name": "Veil",
  "accessory_price": 500000,
  "money_usd": 45,
  "money_uzs": 500000,
  "central_bank_usd_course": 11000,
  "created_by_user": "user-id",
  "customer_salon_id": "salon-id",
  "description": "Notes"
}
```

**Request Fields:**
- `accessory_name` - Name of the accessory (required)
- `accessory_price` - Price (required)
- `money_usd` - Payment in USD (required)
- `money_uzs` - Payment in UZS (required)
- `central_bank_usd_course` - USD exchange rate (required)
- `created_by_user` - User ID (required)
- `customer_salon_id` - Salon ID (optional)
- `description` - Additional notes (optional)

**Response:**
```json
{
  "id": "accessory-sale-id"
}
```

**Used In:**
- `SaleAccessoryVC` - Accessory sale creation screen

---

### 8.2 Get All Sold Accessories

Retrieves paginated list of all sold accessories.

**Endpoint:** `GET /accessory/sold`

**Headers:** Requires authentication token

**Query Parameters:**
```
limit={limit}&offset={offset}
```

**Parameters:**
- `limit` - Number of records per page (required)
- `offset` - Page offset (required)

**Response:**
```json
[
  {
    "id": "string",
    "accessory_name": "Veil",
    "accessory_price": 500000,
    "salon_name": "Salon Name",
    "money_paid": 500000,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Used In:**
- Accessory sales list screens

---

## 9. Report APIs

These APIs provide sales reports and statistics.

---

### 9.1 Get Salon Detail Report

Retrieves detailed report for salon's user.

**Endpoint:** `GET /report/salon-details`

**Headers:** Requires authentication token

**Query Parameters:**
```
user_id={userId}
```

**Parameters:**
- `user_id` - User ID

**Response:**
```json
{
  "reports": [
    {
      "date": "2024-01-15",
      "orders_count": 5,
      "simple_sale_count": 3,
      "sale_5050_count": 2,
      "accessory_count": 4,
      "total_usd": 5000,
      "total_uzs": 55000000
    }
  ],
  "total_sales": 100
}
```

**Used In:**
- Detailed report screens

---

### 9.2 Get Salon General Report

Retrieves general salon report for date range.

**Endpoint:** `GET /report/salon-general`

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
  "debts": "5000000",
  "cash": {
    "usd": "4500",
    "uzs": "50000000"
  },
  "orders": {
    "usd": "3000",
    "uzs": "33000000"
  },
  "simple": {
    "usd": "800",
    "uzs": "8800000"
  },
  "simple50": {
    "usd": "600",
    "uzs": "6600000"
  },
  "accessory": {
    "usd": "100",
    "uzs": "1100000"
  },
  "total_in_usd": "4500",
  "usd_rate": 11000
}
```

**Response Fields:**
- `debts` - Total outstanding debts
- `cash` - Total cash received
  - `usd` - Cash in USD
  - `uzs` - Cash in UZS
- `orders` - Dress orders statistics
  - `usd` - Orders total in USD
  - `uzs` - Orders total in UZS
- `simple` - Simple sales statistics (same structure)
- `simple50` - 50/50 sales statistics (same structure)
- `accessory` - Accessory sales statistics (same structure)
- `total_in_usd` - Grand total in USD
- `usd_rate` - Current USD exchange rate

**Used In:**
- `ReportVC` - Main report screen
- `SlViewReportVM` - Report view model
- `SellerHomeVC` - Dashboard statistics

---

## 10. Partner Management APIs

These APIs manage partner debts and payments.

---

### 10.1 Get All Partner Debts

Retrieves list of all partner debts.

**Endpoint:** `GET /partner/debts/all`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
[
  {
    "id": "string",
    "partner_name": "Partner Name",
    "debt_amount": 5000000,
    "description": "Notes",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Used In:**
- Partner debt list screens

---

### 10.2 Create Partner Debt

Adds a new debt record for a partner.

**Endpoint:** `POST /partner/create-debt`

**Headers:** Requires authentication token

**Request Body:**
```json
{
  "partner_name": "Partner Name",
  "debt_amount": 5000000,
  "description": "Debt description",
  "created_by_user": "user-id"
}
```

**Request Fields:**
- `partner_name` - Partner's name (required)
- `debt_amount` - Debt amount (required)
- `description` - Additional notes (optional)
- `created_by_user` - User ID (required)

**Response:**
```json
{
  "id": "partner-debt-id"
}
```

---

### 10.3 Get Partner Debt History

Retrieves partner debt payment history with pagination.

**Endpoint:** `GET /partner/reports`

**Headers:** Requires authentication token

**Query Parameters:**
```
limit={limit}&offset={offset}
```

**Parameters:**
- `limit` - Number of records per page (required)
- `offset` - Page offset (required)

**Response:**
```json
[
  {
    "id": "string",
    "partner_name": "Partner Name",
    "payment_amount": 1000000,
    "debt_before": 6000000,
    "debt_after": 5000000,
    "payment_date": "2024-01-20T10:30:00Z"
  }
]
```

**Used In:**
- Partner payment history screens

---

## 11. Utility APIs

---

### 11.1 Get USD Exchange Rate

Retrieves current USD exchange rate from Central Bank.

**Endpoint:** `GET /other/central-bank-usd-rate`

**Headers:** Requires authentication token

**Request Body:** None

**Response:**
```json
{
  "rate": 11000
}
```

**Response Fields:**
- `rate` - Current USD to UZS exchange rate

**Used In:**
- All payment and sale screens for automatic currency conversion
- Dashboard for displaying current exchange rate

---

## 12. SALON Role Workflow

### Tab Bar Navigation:
1. **Sotuv (Sales)** - Manage all sales types
2. **Statistika (Home)** - Dashboard with statistics
3. **Hisobot (Reports)** - Reports and analytics
4. **Profil (Profile)** - User profile management

### Main Features:

#### 1. Dress Management Workflow:
1. Create new dresses with images and details
2. Set dress author/designer
3. Specify dress color, size, and price
4. Update dress information
5. Delete dresses or dress images
6. Manage dress stock status

#### 2. Salon (Customer) Management Workflow:
1. Create new salon with customer information
2. Add salon location (address and coordinates)
3. View all salons
4. View salon details with complete sales statistics
5. Track salon debts and payments

#### 3. Sales Workflows:

**Simple Sale:**
1. Select salon
2. Choose multiple dresses
3. Set delivery date (optional)
4. Enter payment (USD/UZS)
5. Set debt payment deadline (optional)
6. Create sale

**50/50 Sale:**
1. Select dress
2. Enter bride information
3. Select salon (optional, can be added later)
4. Split payment between salon and bride
5. Set bride passport status
6. Set delivery dates
7. Create sale

**Dress Order:**
1. Select base dress template
2. Upload reference images
3. Enter custom design notes
4. Enter bride details (name, phone, wedding date)
5. Select salon
6. Split payment between salon and bride
7. Set order completion date
8. Create order

**Accessory Sale:**
1. Enter accessory details
2. Select salon (optional)
3. Enter payment
4. Create sale

#### 4. Debt Management Workflow:
1. View all debtors (salons with outstanding debts)
2. Filter by sale type (orders, simple sales, 50/50 sales)
3. View debtor details with full sales history
4. Record payments in USD/UZS
5. Track bride passport status
6. View payment history

#### 5. Reports Workflow:
1. View dashboard statistics:
   - Today's sales
   - Today's cash received
   - Total outstanding debts
   - Sale breakdown by type
2. Generate date range reports
3. View detailed sales by date
4. Analyze cash flow in USD/UZS

#### 6. Partner Management Workflow:
1. Create partner debt records
2. Track partner payments
3. View partner payment history

---

## 13. API Summary

### Total Endpoints: 42

| Category | Count | Endpoints |
|----------|-------|-----------|
| Authentication | 2 | Phone login, OTP verification |
| Dress Management | 12 | Create, update, delete, get all, get by ID, colors, authors, stock status, ready dresses |
| Salon Management | 3 | Create, get all, get by ID |
| Simple Sale | 6 | Create, get all, get by ID, get debts, pay debt, payment history |
| 50/50 Sale | 8 | Create, get all, get by ID, get debts, pay debt, payment history, get without salon, connect salon |
| Dress Orders | 5 | Create (old), create (new), get debts, payment history, pay debt |
| Accessory Sale | 2 | Create, get all sold |
| Reports | 2 | Salon details, salon general |
| Partner Management | 3 | Get all debts, create debt, get history |
| Utility | 1 | Get USD exchange rate |

---

## 14. Important Notes

### Authentication Flow:
1. User enters phone number
2. App requests OTP via `/login/phone`
3. User receives SMS with OTP code
4. User enters OTP
5. App verifies OTP via `/login/code`
6. App receives auth token and role code "3"
7. Token stored in UserDefaults with key `.token`
8. All subsequent requests use `Authorization: mme:{token}` header

### Payment Structure:
All sales support dual currency payment:
- **USD**: Used for calculations and reporting
- **UZS**: Local currency
- Exchange rate fetched from `/other/central-bank-usd-rate`
- Payments can be made in both currencies simultaneously

### Debt Management:
- All sales types track debts separately
- Salon and bride debts tracked independently in 50/50 sales and orders
- Payment deadlines can be set for each party
- Bride passport tracking integrated with debt payments

### Sale Types Comparison:

| Feature | Simple Sale | 50/50 Sale | Dress Order |
|---------|------------|------------|-------------|
| Multiple dresses | ✅ Yes | ❌ No (single) | ❌ No (single) |
| Bride info | ❌ No | ✅ Yes | ✅ Yes |
| Custom design | ❌ No | ❌ No | ✅ Yes |
| Split payment | ❌ No | ✅ Yes | ✅ Yes |
| Passport tracking | ❌ No | ✅ Yes | ✅ Yes |
| Wedding date | ❌ No | ❌ No | ✅ Yes |
| Reference images | ❌ No | ❌ No | ✅ Yes |

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

## 15. SALON Role Permissions

### What SALON Can Do:
✅ Create and manage dresses in catalog
✅ Create and manage salons (customers)
✅ Create all types of sales (simple, 50/50, orders, accessories)
✅ Record payments for all sale types
✅ View payment histories
✅ Generate reports by date range
✅ View salon statistics and details
✅ Manage partner debts
✅ Attach salons to 50/50 sales
✅ Track bride passport status
✅ Manage own profile

### What SALON Cannot Do:
❌ Accept or reject dress orders (Factory Manager only)
❌ Manage warehouse inventory (Warehouse role only)
❌ Approve designer ideas (Factory Manager only)
❌ Modify other users' data
❌ Access warehouse reports

---

## File References

### API Manager:
- `SlSellerAPI.swift` - Primary API manager for Salon role

### Tab Bar:
- `SellerTabBar.swift` - Salon tab bar navigation

### Sale Management Screens (UIKit):
- `AllDressListVC.swift` - Dress catalog
- `FillDressVC.swift` - Create/edit dress
- `SalonListsVC.swift` - Salon list
- `SimpleSaleVC.swift` - Simple sale creation
- `Sale5050VC.swift` - 50/50 sale creation
- `SlNewOrderVC.swift` - Dress order creation
- `SaleAccessoryVC.swift` - Accessory sale
- `AttachmentSale5050VC.swift` - Attach salon to 50/50

### Home/Dashboard Screens (UIKit):
- `SellerHomeVC.swift` - Dashboard
- `ListOfDebtorsVC.swift` - Debtors list
- `DebtorDetailsVC.swift` - Debtor details

### Payment Screens (UIKit):
- `SimpleSaleDebtPaymentVC.swift` - Simple sale payments
- `BrideDebtPaymentVC.swift` - 50/50 and order payments
- `SimpleSalePaymentHistoryVC.swift` - Simple sale history
- `FiftyFiftySaleDebtPaymentHistoryVC.swift` - 50/50 history

### Report Screens (UIKit):
- `ReportVC.swift` - Main reports screen

### SwiftUI Screens:
- `SalonDetailScreen/` - Salon detail and creation

### View Models:
- `SlViewReportVM.swift` - Reports view model
- `SalonPaymentHistoryVM.swift` - Payment history view model

### Data Models:
- `SimpleSaleDM.swift` - Simple sale models
- `Debts.swift` - 50/50 and order debt models
- `SlOrderDM.swift` - Dress order models
- `SlSalonDM.swift` - Salon models
- `salonDetailDM.swift` - Salon detail model
- `AccessoryDM.swift` - Accessory models
- `AttachmentSale5050DM.swift` - 50/50 attachment models
- `ReportDM.swift` - Report models
- `SlPartnerDebtDM.swift` - Partner debt models
- `PartnersDebtHistoryDM.swift` - Partner history models
- `StHomeDM.swift` - Payment models

---

## 16. Sample Use Cases

### Use Case 1: Create Simple Sale
```
1. Salon user opens Sales tab
2. Selects "Simple Sale" option
3. Selects salon from list
4. Chooses multiple dresses
5. Sets total price and delivery date
6. Enters payment in USD/UZS
7. Sets debt payment deadline (optional)
8. API call: POST /simple-sale/create
9. Sale is created
10. If debt exists, appears in debtors list
```

### Use Case 2: Create 50/50 Sale
```
1. Salon user opens Sales tab
2. Selects "50/50 Sale" option
3. Selects dress
4. Enters bride name and passport status
5. Selects salon (optional)
6. Enters salon payment amount
7. Enters bride payment amount
8. Sets delivery dates for both parties
9. API call: POST /sale5050/create
10. Sale is created
11. If no salon selected, appears in "50/50 Without Salon" list
```

### Use Case 3: Pay Debt
```
1. Salon user opens Home tab
2. Views debtors list
3. Taps on debtor (salon) with outstanding debt
4. Views debt details
5. Taps "Pay Debt" button
6. Enters payment amount in USD/UZS
7. For bride payments, updates passport status
8. API call: POST /simple-sale/debt/payment (or corresponding endpoint)
9. Payment is recorded
10. Debt amount is updated
11. Payment appears in history
```

### Use Case 4: Create Dress Order
```
1. Salon user opens Sales tab
2. Selects "Dress Order" option
3. Selects base dress template
4. Uploads reference images
5. Enters custom design notes
6. Enters bride details (name, phone, wedding date)
7. Selects salon
8. Enters salon and bride payment amounts
9. Sets order completion date
10. Sets bride passport status
11. API call: POST /dress-order/create-new
12. Order is created and sent to Factory Manager for approval
```

### Use Case 5: Generate Report
```
1. Salon user opens Reports tab
2. Selects date range (from/to dates)
3. API call: GET /report/salon-general with date parameters
4. Views dashboard showing:
   - Total debts: 5,000,000 UZS
   - Cash received: 4,500 USD / 50,000,000 UZS
   - Breakdown by sale type:
     - Orders: 3,000 USD
     - Simple sales: 800 USD
     - 50/50 sales: 600 USD
     - Accessories: 100 USD
   - Total: 4,500 USD
5. Views detailed report by date
```

---

End of Salon API Documentation
