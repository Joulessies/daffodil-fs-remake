# Daffodil Flower Shop - Data Flow Diagram (DFD)

## Level 0: Context Diagram

```
                    DAFFODIL FLOWER SHOP SYSTEM - CONTEXT DIAGRAM

┌─────────────────┐                                           ┌─────────────────┐
│                 │           Order Details                   │                 │
│    CUSTOMER     │──────────────────────────────────────────►│      ADMIN      │
│                 │                                           │                 │
│  - Browse       │◄──────────────────────────────────────────│  - Manage       │
│  - Shop         │           Product Catalog                 │  - Monitor      │
│  - Order        │                                           │  - Track        │
│                 │                                           │                 │
└─────────────────┘                                           └─────────────────┘
        │ ▲                                                           │ ▲
        │ │                                                           │ │
        │ │ Order Confirmation                          Audit Reports │ │ Admin Actions
        │ │ Product Info                                              │ │
        │ │                                                           │ │
        ▼ │                   ┌─────────────────────────────────────┐ │ ▼
   Order │                   │                                     │ │ Management
 Request │                   │        DAFFODIL FLOWER SHOP        │ │ Commands
        │                    │           SYSTEM                   │ │
        │                    │                                     │ │
        │                    │  • Authentication & Authorization   │ │
        │                    │  • Product Catalog Management      │ │
        │                    │  • Order Processing                 │ │
        │                    │  • Payment Processing               │ │
        │                    │  • Inventory Management             │ │
        │                    │  • Admin Dashboard                  │ │
        │                    │  • Audit Logging                    │ │
        │                    └─────────────────────────────────────┘ │
        │                                     │ ▲                     │
        │                                     │ │                     │
        │ Payment Request                     │ │ Payment Status      │
        └────────────────────────────────────►│ │◄────────────────────┘
                                             │ │
                                             ▼ │
                                    ┌─────────────────┐
                                    │                 │
                                    │  STRIPE PAYMENT │
                                    │    GATEWAY      │
                                    │                 │
                                    │  - Process      │
                                    │  - Validate     │
                                    │  - Confirm      │
                                    └─────────────────┘
```

## Level 1: Main Process Decomposition

```
                    DAFFODIL FLOWER SHOP SYSTEM - LEVEL 1 DFD

CUSTOMER                                                                    ADMIN
   │                                                                         │
   │ Registration/Login                                                      │ Admin Login
   │ Request                                                                 │ Request
   ▼                                                                         ▼
┌─────────────────┐    User Data     ┌─────────────────┐    Admin Data    ┌─────────────────┐
│                 │◄────────────────►│                 │◄────────────────►│                 │
│  1.0 MANAGE     │                  │   D1: USERS     │                  │  2.0 MANAGE     │
│  AUTHENTICATION │                  │                 │                  │  ADMIN          │
│                 │                  │  - id           │                  │  OPERATIONS     │
│  - Verify Login │                  │  - email        │                  │                 │
│  - Register     │                  │  - is_admin     │                  │  - View Users   │
│  - Manage       │                  │  - suspended    │                  │  - Manage Roles │
│    Session      │                  │                 │                  │  - View Reports │
└─────────────────┘                  └─────────────────┘                  └─────────────────┘
   │ ▲                                                                         │ ▲
   │ │ Auth Status                                                             │ │ Admin Reports
   │ │                                                                         │ │
   ▼ │                                                                         ▼ │
┌─────────────────┐                                                    ┌─────────────────┐
│                 │                                                    │                 │
│  3.0 BROWSE     │    Product Data  ┌─────────────────┐    Product    │  4.0 MANAGE     │
│  PRODUCTS       │◄────────────────►│                 │    Updates    │  PRODUCTS       │
│                 │                  │  D2: PRODUCTS   │◄──────────────│                 │
│  - Search       │                  │                 │               │  - Add Products │
│  - Filter       │                  │  - id           │               │  - Edit Details │
│  - View Details │                  │  - title        │               │  - Update Stock │
│  - Add to Cart  │                  │  - price        │               │  - Set Status   │
└─────────────────┘                  │  - category     │               └─────────────────┘
   │                                 │  - stock        │                         │
   │ Selected Products               │  - images       │                         │
   │                                 └─────────────────┘                         │
   ▼                                                                             │
┌─────────────────┐                                                             │
│                 │                                                             │
│  5.0 PROCESS    │    Order Data    ┌─────────────────┐    Order Updates      │
│  ORDERS         │◄────────────────►│                 │◄──────────────────────┘
│                 │                  │   D3: ORDERS    │
│  - Create Order │                  │                 │
│  - Calculate    │                  │  - id           │
│    Total        │                  │  - user_id      │
│  - Validate     │                  │  - total        │
│    Items        │                  │  - status       │
└─────────────────┘                  │  - items        │
   │ ▲                               └─────────────────┘
   │ │ Order Status
   │ │
   ▼ │ Payment Confirmation
┌─────────────────┐
│                 │    Payment       ┌─────────────────┐
│  6.0 PROCESS    │    Request       │                 │
│  PAYMENTS       │─────────────────►│ STRIPE GATEWAY  │
│                 │                  │                 │
│  - Create       │◄─────────────────│  - Validate     │
│    Session      │  Payment Status  │  - Process      │
│  - Confirm      │                  │  - Confirm      │
│    Payment      │                  └─────────────────┘
│  - Update Order │
└─────────────────┘
   │
   │ Audit Data
   ▼
┌─────────────────┐
│                 │
│  D4: ADMIN      │
│     AUDIT       │
│                 │
│  - actor_id     │
│  - action       │
│  - entity       │
│  - data         │
└─────────────────┘
```

## Process Specifications

### **Process 1.0: MANAGE AUTHENTICATION**

```
Process: 1.0 MANAGE AUTHENTICATION
Input Flows:
  - Registration/Login Request (from Customer)
  - Admin Login Request (from Admin)

Output Flows:
  - Auth Status (to Customer)
  - Admin Reports (to Admin)

Data Stores:
  - D1: USERS (Read/Write)

Description:
  Handles user authentication, registration, and session management.
  Validates credentials against Supabase Auth and manages user roles.

Sub-processes:
  1.1 Verify Login Credentials
  1.2 Register New User
  1.3 Manage User Session
  1.4 Validate Admin Permissions
```

### **Process 2.0: MANAGE ADMIN OPERATIONS**

```
Process: 2.0 MANAGE ADMIN OPERATIONS
Input Flows:
  - Admin Login Request (from Admin)
  - Management Commands (from Admin)

Output Flows:
  - Admin Reports (to Admin)
  - Order Updates (to D3: ORDERS)
  - Product Updates (to D2: PRODUCTS)

Data Stores:
  - D1: USERS (Read/Write)
  - D4: ADMIN_AUDIT (Write)

Description:
  Provides administrative functions for managing users, viewing reports,
  and performing system administration tasks.

Sub-processes:
  2.1 View User Management
  2.2 Manage User Roles
  2.3 Generate System Reports
  2.4 Log Admin Actions
```

### **Process 3.0: BROWSE PRODUCTS**

```
Process: 3.0 BROWSE PRODUCTS
Input Flows:
  - Product Search/Filter Request (from Customer)

Output Flows:
  - Product Catalog (to Customer)
  - Selected Products (to Process 5.0)

Data Stores:
  - D2: PRODUCTS (Read)

Description:
  Handles product browsing, searching, filtering, and cart management.
  Provides product catalog with availability and pricing information.

Sub-processes:
  3.1 Search Products
  3.2 Filter by Category/Price
  3.3 Display Product Details
  3.4 Manage Shopping Cart
```

### **Process 4.0: MANAGE PRODUCTS**

```
Process: 4.0 MANAGE PRODUCTS
Input Flows:
  - Product Management Commands (from Admin)

Output Flows:
  - Product Updates (to D2: PRODUCTS)
  - Audit Data (to D4: ADMIN_AUDIT)

Data Stores:
  - D2: PRODUCTS (Read/Write)

Description:
  Administrative product management including creation, updates,
  inventory management, and status changes.

Sub-processes:
  4.1 Add New Products
  4.2 Edit Product Details
  4.3 Update Inventory Stock
  4.4 Set Product Status
  4.5 Manage Product Images
```

### **Process 5.0: PROCESS ORDERS**

```
Process: 5.0 PROCESS ORDERS
Input Flows:
  - Selected Products (from Process 3.0)
  - Order Request (from Customer)
  - Payment Confirmation (from Process 6.0)

Output Flows:
  - Order Confirmation (to Customer)
  - Payment Request (to Process 6.0)
  - Order Status (to Customer)

Data Stores:
  - D3: ORDERS (Read/Write)
  - D2: PRODUCTS (Read for stock validation)

Description:
  Handles complete order lifecycle from creation to fulfillment.
  Validates inventory, calculates totals, and manages order status.

Sub-processes:
  5.1 Create Order Record
  5.2 Validate Item Availability
  5.3 Calculate Order Total
  5.4 Update Order Status
  5.5 Manage Order Fulfillment
```

### **Process 6.0: PROCESS PAYMENTS**

```
Process: 6.0 PROCESS PAYMENTS
Input Flows:
  - Payment Request (from Process 5.0)
  - Payment Status (from Stripe Gateway)

Output Flows:
  - Payment Request (to Stripe Gateway)
  - Payment Confirmation (to Process 5.0)
  - Order Status Update (to Customer)

Data Stores:
  - D3: ORDERS (Write for payment status)

Description:
  Integrates with Stripe for secure payment processing.
  Creates payment sessions and confirms successful transactions.

Sub-processes:
  6.1 Create Stripe Session
  6.2 Validate Payment Details
  6.3 Confirm Payment Status
  6.4 Update Order Payment Status
```

## Data Store Specifications

### **D1: USERS**

```
Data Store: D1: USERS
Contents: User account information and roles
Access:
  - Process 1.0: Read/Write (authentication, registration)
  - Process 2.0: Read/Write (admin user management)

Key Data Elements:
  - User ID (Primary Key)
  - Email Address
  - Admin Status
  - Suspension Status
  - Creation/Update Timestamps
```

### **D2: PRODUCTS**

```
Data Store: D2: PRODUCTS
Contents: Complete product catalog with inventory
Access:
  - Process 3.0: Read (browsing, searching)
  - Process 4.0: Read/Write (product management)
  - Process 5.0: Read (stock validation)

Key Data Elements:
  - Product ID (Primary Key)
  - Title, Description
  - Price, Category
  - Stock Quantity
  - Status, Images
```

### **D3: ORDERS**

```
Data Store: D3: ORDERS
Contents: Customer orders and transaction history
Access:
  - Process 2.0: Read/Write (admin order management)
  - Process 5.0: Read/Write (order processing)
  - Process 6.0: Write (payment status updates)

Key Data Elements:
  - Order ID (Primary Key)
  - Customer Information
  - Order Items (JSON)
  - Total Amount
  - Order Status
  - Payment Status
```

### **D4: ADMIN_AUDIT**

```
Data Store: D4: ADMIN_AUDIT
Contents: Administrative action audit trail
Access:
  - Process 2.0: Write (admin actions)
  - Process 4.0: Write (product changes)
  - Process 6.0: Write (payment processing)

Key Data Elements:
  - Audit ID (Primary Key)
  - Actor ID (Admin User)
  - Action Type
  - Entity Affected
  - Action Data (JSON)
  - Timestamp
```

## External Entity Specifications

### **CUSTOMER**

```
External Entity: CUSTOMER
Description: End users who browse and purchase flowers
Interactions:
  - Sends: Registration/Login requests, product searches, orders
  - Receives: Product catalog, order confirmations, status updates

Types:
  - Guest customers (no account required)
  - Registered customers (with user accounts)
```

### **ADMIN**

```
External Entity: ADMIN
Description: Administrative users managing the system
Interactions:
  - Sends: Admin login, management commands, configuration changes
  - Receives: System reports, user data, audit logs

Permissions:
  - Product management
  - Order management
  - User administration
  - System monitoring
```

### **STRIPE PAYMENT GATEWAY**

```
External Entity: STRIPE PAYMENT GATEWAY
Description: Third-party payment processing service
Interactions:
  - Receives: Payment requests, transaction data
  - Sends: Payment confirmations, transaction status

Integration:
  - Secure payment processing
  - PCI compliance
  - Multiple payment methods
  - Webhook notifications
```

## Data Flow Summary

### **Major Data Flows:**

1. **Authentication Flow**: Customer/Admin → System → User validation
2. **Product Browsing**: Customer → System → Product catalog display
3. **Order Processing**: Customer → System → Payment → Order confirmation
4. **Admin Management**: Admin → System → Data updates → Audit logs
5. **Payment Processing**: System → Stripe → Payment confirmation → Order update

### **Critical Data Paths:**

- User authentication through Supabase Auth
- Product inventory validation during ordering
- Payment confirmation before order completion
- Comprehensive audit logging for all admin actions
- Real-time stock updates during order processing
