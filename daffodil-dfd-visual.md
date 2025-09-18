# Daffodil Flower Shop - Visual Data Flow Diagrams

## LEVEL 0: CONTEXT DIAGRAM

```
                    DAFFODIL FLOWER SHOP - CONTEXT DIAGRAM

┌─────────────┐                                           ┌─────────────┐
│             │                                           │             │
│  CUSTOMER   │                                           │    ADMIN    │
│             │                                           │             │
│ External    │                                           │ External    │
│ Entity      │                                           │ Entity      │
│             │                                           │             │
└─────────────┘                                           └─────────────┘
       │                                                         │
       │ Login Request                                           │ Admin Login
       │ Product Search                               Admin      │ Request
       │ Order Request                                Commands   │
       ▼                                                         ▼

    ┌─────────────────────────────────────────────────────────────────┐
    │                                                                 │
    │                        ◯  0.0                                   │
    │                 DAFFODIL FLOWER                                 │
    │                   SHOP SYSTEM                                   │
    │                                                                 │
    │                     Process                                     │
    │                                                                 │
    └─────────────────────────────────────────────────────────────────┘
       ▲                                                         ▲
       │                                                         │
       │ Auth Status                                   Management │
       │ Product Catalog                               Reports    │
       │ Order Confirmation                                      │
       │                                                         │
       │                              │                          │
       │                              │ Payment Request          │
       │                              ▼                          │
       │                      ┌─────────────┐                   │
       │                      │             │                   │
       │ Payment              │   STRIPE    │                   │
       │ Confirmation         │  PAYMENT    │                   │
       └─────────────────────◄│  GATEWAY    │                   │
                              │             │                   │
                              │ External    │                   │
                              │ Entity      │                   │
                              └─────────────┘                   │
                                      ▲                         │
                                      │                         │
                                      │ Payment Status          │
                                      └─────────────────────────┘
```

## LEVEL 1: DETAILED PROCESS DIAGRAM

```
                    DAFFODIL FLOWER SHOP - LEVEL 1 DFD

CUSTOMER                                                              ADMIN
   │                                                                    │
   │ Login Request                                          Admin Login │
   │                                                           Request  │
   ▼                                                                    ▼

┌─────────────┐                                              ┌─────────────┐
│             │          User Data          ┌═════════════┐  │             │
│    ◯ 1.0    │◄────────────────────────────║             ║──┤    ◯ 2.0    │
│ AUTHENTICATE│                             ║ D1: USERS   ║  │   MANAGE    │
│    USER     │────────────────────────────►║             ║  │   ADMIN     │
│             │          Auth Data          ║ Data Store  ║  │ OPERATIONS  │
│  Process    │                             ║             ║  │             │
└─────────────┘                             └═════════════┘  │  Process    │
   │ ▲                                                        └─────────────┘
   │ │ Auth Status                                                   │ ▲
   │ │                                                               │ │
   ▼ │                                                               ▼ │
┌─────────────┐                                              ┌─────────────┐
│             │          Product Data       ┌═════════════┐  │             │
│    ◯ 3.0    │◄────────────────────────────║             ║◄─┤    ◯ 4.0    │
│   BROWSE    │                             ║ D2:PRODUCTS ║  │   MANAGE    │
│  PRODUCTS   │                             ║             ║  │  PRODUCTS   │
│             │                             ║ Data Store  ║  │             │
│  Process    │                             ║             ║  │  Process    │
└─────────────┘                             └═════════════┘  └─────────────┘
   │                                                                 │
   │ Selected Products                                Product Updates│
   │                                                                 │
   ▼                                                                 │
┌─────────────┐                                                     │
│             │          Order Data         ┌═════════════┐         │
│    ◯ 5.0    │◄────────────────────────────║             ║◄────────┘
│  PROCESS    │                             ║ D3: ORDERS  ║
│   ORDERS    │────────────────────────────►║             ║
│             │          Order Updates      ║ Data Store  ║
│  Process    │                             ║             ║
└─────────────┘                             └═════════════┘
   │ ▲
   │ │ Order Status
   │ │
   ▼ │ Payment Confirmation
┌─────────────┐
│             │        Payment Request
│    ◯ 6.0    │─────────────────────────────────────────┐
│  PROCESS    │                                         │
│  PAYMENTS   │                                         ▼
│             │◄─────────────────────────────────┌─────────────┐
│  Process    │        Payment Status           │             │
└─────────────┘                                 │   STRIPE    │
   │                                            │  PAYMENT    │
   │ Audit Data                                 │  GATEWAY    │
   ▼                                            │             │
┌═════════════┐                                │ External    │
║             ║                                │ Entity      │
║D4:ADMIN     ║                                └─────────────┘
║AUDIT        ║                                        ▲
║             ║                                        │
║Data Store   ║                                        │ Payment
║             ║                                        │ Confirmation
└═════════════┘                                        │
                                                       │
                                                       │
                                        CUSTOMER ◄─────┘
                                           ▲
                                           │
                                           │ Order
                                           │ Confirmation
                                           │
                                    ┌─────────────┐
                                    │             │
                                    │    ◯ 5.0    │
                                    │  PROCESS    │
                                    │   ORDERS    │
                                    │             │
                                    │  Process    │
                                    └─────────────┘
```

## PROCESS DETAIL BREAKDOWN

### **SYMBOLS USED:**

```
    ◯           ┌─────────────┐         ┌═════════════┐
 PROCESS        │ EXTERNAL    │         ║ DATA STORE  ║
(Circle)        │ ENTITY      │         ║ (Database)  ║
                │ (Rectangle) │         ║ Double Line ║
                └─────────────┘         └═════════════┘

        ──────────────►
         DATA FLOW
         (Arrow with label)
```

### **PROCESS DESCRIPTIONS:**

**◯ 1.0 AUTHENTICATE USER**

- **Input**: Login Request (from Customer/Admin)
- **Output**: Auth Status, User Data
- **Function**: Validates credentials, manages sessions

**◯ 2.0 MANAGE ADMIN OPERATIONS**

- **Input**: Admin Login Request, Management Commands
- **Output**: Admin Reports, System Updates
- **Function**: Administrative dashboard and user management

**◯ 3.0 BROWSE PRODUCTS**

- **Input**: Product Search, Filter Requests
- **Output**: Product Catalog, Selected Products
- **Function**: Product browsing, searching, cart management

**◯ 4.0 MANAGE PRODUCTS**

- **Input**: Product Management Commands (from Admin)
- **Output**: Product Updates, Inventory Changes
- **Function**: Add/edit products, manage inventory

**◯ 5.0 PROCESS ORDERS**

- **Input**: Selected Products, Order Requests
- **Output**: Order Confirmation, Payment Requests
- **Function**: Create orders, validate inventory, calculate totals

**◯ 6.0 PROCESS PAYMENTS**

- **Input**: Payment Requests, Stripe Responses
- **Output**: Payment Confirmations, Order Updates
- **Function**: Handle Stripe integration, confirm payments

### **DATA STORES:**

**║D1: USERS║** - User accounts, authentication data, roles
**║D2: PRODUCTS║** - Product catalog, inventory, pricing
**║D3: ORDERS║** - Order history, customer details, items
**║D4: ADMIN AUDIT║** - Administrative action logs, audit trail

### **EXTERNAL ENTITIES:**

**CUSTOMER** - End users browsing and purchasing flowers
**ADMIN** - Administrative users managing the system  
**STRIPE PAYMENT GATEWAY** - Third-party payment processor

## DATA FLOW RULES:

✅ **Data flows FROM and TO processes** (circles)
✅ **External entities** (rectangles) **interact only with processes**
✅ **Data stores** (double-line boxes) **connect only to processes**
✅ **All arrows are labeled** with the data being transferred
✅ **Processes are numbered** for reference (1.0, 2.0, etc.)
✅ **Data stores are numbered** with "D" prefix (D1, D2, etc.)
