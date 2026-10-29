# 🌼 Web and Mobile - Data Flow Diagram (DFD) 🌼

> **Complete system architecture documentation presented through localhost:3000 (Production domain expired)**  
> _Web: Company & Admin Only | Mobile App (APK): Customer Only_

---

## 📋 Table of Contents

1. [Context Diagram](#level-0-context-diagram)
2. [Main Processes](#level-1-main-processes)
3. [Detailed Process Flows](#level-2-detailed-process-flows)
4. [Data Stores](#data-stores-d-files)
5. [External Entities](#external-entities)
6. [Key User Journeys](#key-user-journeys)
7. [System Architecture](#system-architecture)

---

## ✅ Quick DFD Overview by Requested Categories

This section maps the system to the exact elements you requested.

### 1) Customer/Buyer Site and Admin Site

- Customer/Buyer Site (Frontend)
  - Pages: Home, Catalog, Product Details, Cart, Checkout, Account, Contact
  - Key Flows: Browse (2.0), Cart (3.0), Customization (4.0), Checkout (5.0), Order Tracking (6.0), Contact (8.0)
- Admin Site (Frontend)
  - Pages: Login, Dashboard, Products, Orders, Users, CMS, Reports, Audit
  - Key Flows: Admin Dashboard (7.0) including Products, Orders, Users, CMS, Analytics, Audit

### 2) Major Backend Services / Modules (API)

- API Gateway (Next.js API Routes)
  - Auth API: login, signup, session, OAuth (1.0)
  - Products API: list, details, search, stock (2.0)
  - Cart API: totals, pricing, validation (3.0)
  - Customization API: AI preview request handler (4.0)
  - Checkout API: payment intent/session, webhook handling (5.0)
  - Orders API: create, read, status updates (5.0/6.0)
  - Admin API: CRUD for products/users/orders/CMS, audit logging (7.0)

### 3) The Database

- Primary DB: Supabase (PostgreSQL)
  - D1 Users, D2 Products, D4 CMS Content, D5 Orders, D6 Audit Log
- Client Storage: D3 Cart and drafts (browser LocalStorage)

### 4) External APIs

- Payment Gateways: Stripe, PayPal, PayMongo (E3)
- Email Transport: SMTP/Gmail OAuth via Nodemailer (E4)
- AI Generation: HuggingFace Inference API for previews (E5)

High-level DFD (requested grouping):

```
 [Customer/Buyer Site]            [Admin Site]
        │                              │
        │  HTTPS                       │  HTTPS
        ▼                              ▼
                  ┌───────────────────────────────────┐
                  │           API Layer               │
                  │  Auth • Products • Cart • Orders │
                  │  Customization • Checkout • Admin│
                  └───────────────┬───────────────────┘
                                  │
                        ┌─────────┴─────────┐
                        │   Database (DB)   │
                        │ D1..D6 (Supabase) │
                        └─────────┬─────────┘
                                  │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
   [Payment Gateway]         [Email Service]            [AI Service]
        (E3)                      (E4)                      (E5)
```

Note: Detailed diagrams and flows below remain valid; this overview clarifies the boundary between the two sites, backend API, database, and external integrations per your request.

---

## 🧩 Structured DFD (Start/Input/Process/Data/Decision/End)

The following concise flows use only Start/End, Input, Process, Data, and Decision.

### Customer/Buyer Site — End-to-End Flow

```
┌──────────────┐
│   START      │ Visit Site
└──────┬───────┘
       │
       ▼
┌───────────────────────────────┐
│ INPUT:                        │
│ Login (optional) / Browse     │
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ PROCESS:                      │
│ Display catalog & product info│
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ DATA:                         │
│ D2 Products (read)            │
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ INPUT:                        │
│ Add to cart / Customize       │
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ PROCESS:                      │
│ Update cart & calculate total │
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ DATA:                         │
│ D3 Cart (localStorage)        │
└──────┬────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ DECISION:                                    │
│ Proceed to checkout?                         │
└───┬───────────────────────────┬──────────────┘
    │                           │
    │ Yes                       │ No → Return to catalog
    ▼                           │
┌───────────────────────────────┐
│ INPUT:                        │
│ Enter shipping & select payment│
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ PROCESS:                      │
│ Create payment session        │
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ DATA:                         │
│ E3 Payment Gateway            │
└──────┬────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ DECISION:                                    │
│ Payment successful?                          │
└───┬───────────────────────────┬──────────────┘
    │                           │
    │ Yes                       │ No → Return to payment screen
    ▼                           │
┌───────────────────────────────┐
│ PROCESS:                      │
│ Save order, update stock,     │
│ send confirmation email       │
└──────┬────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ DATA:                                        │
│ D5 Orders (write), D2 Products (update),     │
│ E4 Email Service (send)                      │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│    END       │ Show order confirmation
└──────────────┘
```

### Admin Site — Management Flow

```
┌──────────────┐
│   START      │ Admin access
└──────┬───────┘
       │
       ▼
┌───────────────────────────────┐
│ INPUT:                        │
│ Enter admin credentials       │
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ PROCESS:                      │
│ Validate credentials & session│
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ DATA:                         │
│ D1 Users (auth/roles)         │
└──────┬────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ DECISION:                                    │
│ Auth successful?                             │
└───┬───────────────────────────┬──────────────┘
    │                           │
    │ Yes                       │ No → Show error (End)
    ▼                           │
┌───────────────────────────────┐
│ PROCESS:                      │
│ Select operation (Products/   │
│ Orders/Users/CMS/Reports)     │
└──────┬────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ PROCESS:                      │
│ Perform CRUD / updates        │
│ (with audit logging)          │
└──────┬────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│ DATA:                                                       │
│ D2 Products, D5 Orders, D1 Users, D4 CMS, D6 Audit Log      │
└──────┬─────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ DECISION:                                    │
│ Perform another operation?                   │
└───┬───────────────────────────┬──────────────┘
    │                           │
    │ Yes — Loop to selection   │ No
    ▼                           ▼
┌───────────────────────────────┐
│    END                        │ Close admin session
└───────────────────────────────┘
```

---

## Level 0: Context Diagram (DFD-0)

**Purpose:** Shows the entire system as a single process with all external entities and their data flows.

This is the highest-level view where the Daffodil E-Commerce System is represented as one process interacting with external entities.

### Standard DFD-0 Notation

```
                    ┌─────────────────────────┐
                    │      Customer           │
                    │        (E1)             │
                    └───────────┬─────────────┘
                                │
              User requests     │
              Product browse    │
              Cart operations   │
              Orders            │
              Contact           │
                                │
                                ▼
    ┌──────────────────────────────────────────┐
    │                                          │
    │   🌼 DAFFODIL E-COMMERCE SYSTEM 🌼       │
    │        (Process 0.0)                     │
    │                                          │
    └──────────────────────────────────────────┘
           ▲            ▲            ▲            ▲
           │            │            │            │
           │            │            │            │
    ┌──────┴──────┐ ┌──┴───┐  ┌────┴────┐  ┌───┴────┐
    │  Payment    │ │  AI  │  │  Email  │  │ Admin  │
    │  Gateway    │ │Service│  │ Service │  │ Staff  │
    │   (E3)      │ │ (E5) │  │  (E4)   │  │  (E2)  │
    └─────────────┘ └──────┘  └─────────┘  └────────┘
    ▲                    ▲            ▲            ▲
    │                    │            │            │
    Payment     AI image  Email       Analytics
    confirm     gen       notify      reports
```

### 📋 Data Flow Summary

**E1: Customer ↔ System**

- **To System:** User requests, product browse, cart ops, wishlist, contact, customization, checkout, order tracking
- **From System:** Auth responses, product data, cart state, order confirmations, order updates

**E2: Admin Staff ↔ System**

- **To System:** Admin credentials, CRUD operations, management commands, analytics requests
- **From System:** Analytics reports, order updates, system alerts

**E3: Payment Gateway ↔ System**

- **To System:** Payment confirmations, webhooks
- **From System:** Payment requests, order details

**E4: Email Service ↔ System**

- **To System:** Delivery confirmations, bounces
- **From System:** Email requests, notifications

**E5: AI Service ↔ System**

- **To System:** Generated images, API responses
- **From System:** Generation requests, specifications

---

## 📊 Standard Flowchart Notation

**Purpose:** Visual representation using standard DFD symbols

### Symbol Legend

```
┌─────────┐   ┌─────────┐   ┬────────┬   ─┬──   ╞════════╤════════╡
│ START   │   │  END    │   │ DECIDE │   │   │   │  DATA   │
│         │   │         │   │  YES/  │   │   │   │  STORE  │
│  (Oval) │   │  (Oval) │   │   NO   │   │   │   │         │
└─────────┘   └─────────┘   └────────┘   └───┘   └─────────┘
 PROCESS      PROCESS       DIAMOND     FLOW     (DATABASE)
(Rectangle)   (RECTANGLE)                LINE
```

### Customer Purchase Flowchart

```
                    ╔═══════════════════╗
                    ║   START SESSION   ║
                    ║     (Visitor)     ║
                    ╚═══════════════┬═══╝
                                    │
                                    ▼
                    ┌────────────────────────────────────┐
                    │   Browse Products / Search         │
                    │   (Display Catalog)                │
                    └────────────────┬───────────────────┘
                                    │
                                    ▼
                            ┬───────────────┬
                            │ Product       │
                            │ Selected?     │
                            └───┬───────┬───┘
                                │       │
                            Yes │       │ No
                                │       │
                    ┌───────────┘       └───────────────┐
                    │                                    │
                    ▼                                    ▼
        ┌───────────────────────┐         ┌───────────────────────┐
        │   Add to Cart?        │         │   Continue Browsing   │
        │   Customize?          │         └───────────┬───────────┘
        └────────────────┬──────┘                     │
                         │                            │
                         ▼                            ▼
        ┬──────────────────────────┬
        │   Customization          │
        │   Selected?              │
        └──────┬──────────┬────────┘
               │          │
           Yes │          │ No
               │          │
    ┌──────────┘          └───────────────┐
    │                                     │
    ▼                                     ▼
┌───────────────────────┐      ┌───────────────────────┐
│  Build Custom         │      │  Add Standard         │
│  Bouquet              │      │  Product to Cart      │
│  ──────────────────  │      └───────────┬───────────┘
│  Select:             │                  │
│  • Flower type       │                  ▼
│  • Color             │    ┌─────────────────────────────┐
│  • Number of stems   │    │  View Cart                  │
│  • Wrap style        │    │  (Display Items)            │
│  • Add-ons           │    └────────────┬────────────────┘
└────────────────┬─────┘                 │
                 │                       │
                 ▼                       ▼
┌───────────────────────────────────────────────┐
│  Generate AI Preview (Optional)               │
│  ──────────────────────────────────          │
│  • Call HuggingFace API                      │
│  • Generate bouquet image                    │
│  • Display preview to user                   │
│  • Calculate total price                     │
└───────────────────┬───────────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────────┐
    │  Add Custom Item to Cart                 │
    └───────────────────┬──────────────────────┘
                        │
                        ▼
        ┬──────────────────────────┬
        │   Ready to Checkout?     │
        └────────┬───────────┬─────┘
                 │           │
             Yes │           │ No ────┐
                 │           │        │
                 ▼           ▼        │
┌───────────────────────────┐        │
│  Proceed to Checkout      │        │
│  ─────────────────────    │        │
│  • Review cart            │        │
│  • Enter shipping info    │        │
│  • Select payment method  │        │
└────────────┬──────────────┘        │
             │                       │
             │   ────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  Process Payment                        │
│  ─────────────────────────────────────  │
│  • Create payment session               │
│  • Redirect to payment gateway          │
│  • Wait for payment confirmation        │
└────────────┬───────────────────────────┘
             │
             ▼
     ┬────────────────────────┬
     │  Payment               │
     │  Successful?           │
     └───┬────────────┬───────┘
         │            │
     Yes │            │ No
         │            │
         ▼            ▼
┌───────────────┐  ┌──────────────────────┐
│  Create Order │  │  Display Error       │
│  ────────────│  │  Return to Checkout  │
│  • Save order │  │                      │
│  • Update DB  │  └──────────┬───────────┘
│  • Deduct     │             │
│    inventory  │             ▼
└───────┬───────┘    ┌──────────────────────┐
        │            │  Return to Cart      │
        ▼            └──────────┬───────────┘
┌─────────────────────────────┐    │
│  Send Confirmation Email    │    │
│  ────────────────────────── │    │
│  • Order confirmation       │    │
│  • Tracking information     │    │
└─────────────┬───────────────┘    │
              │                    │
              ▼                    │
┌─────────────────────────────────┐│
│  Display Order Confirmation     ││
│  ─────────────────────────      ││
│  • Order number                 ││
│  • Order details                ││
│  • Thank you message            ││
└─────────────┬───────────────────┘│
              │                    │
              ▼                    │
        ┌──────────┐              │
        │   END    │◀─────────────┘
        │ SESSION  │
        └──────────┘

         ╞══════════════════════════════════════╤══════════════════════════════════════╡
         │         DATA STORES                  │                                      │
         │                                      │                                      │
         │  D1: Users          D2: Products    │  D5: Orders      LocalStorage        │
         │  ────────────      ─────────────   │  ────────────    ────────────        │
         │  • User accounts   • Catalog        │  • Order history • Cart items        │
         │  • Auth info       • Inventory      │  • Status       • Wishlist           │
         │  • Permissions     • Pricing        │  • Items        • Preferences        │
         └───────────────────────────────────────────────────────────────────────────┘
```

### Admin Operations Flowchart

```
                    ╔═══════════════════╗
                    ║  START ADMIN      ║
                    ║    SESSION        ║
                    ╚═══════════════┬═══╝
                                    │
                                    ▼
                    ┌────────────────────────────────────┐
                    │  Admin Login                       │
                    │  ─────────────────                │
                    │  • Verify credentials              │
                    │  • Check admin role                │
                    └─────────────────┬──────────────────┘
                                      │
                                      ▼
                              ┬───────────────┬
                              │  Authenticated│
                              │  Successfully?│
                              └───┬───────┬───┘
                                  │       │
                              Yes │       │ No ────┐
                                  │       │        │
                                  ▼       ▼        │
                    ┌─────────────────────┐      │
                    │  Load Dashboard     │      │
                    │  ──────────────     │      │
                    │  • Overview stats   │      │
                    │  • Recent orders    │      │
                    │  • Low stock alerts │      │
                    └───────────┬─────────┘      │
                                │                │
                                ▼                │
                    ┬────────────────────────┬   │
                    │  Select Action         │   │
                    └───┬────────────┬───────┘   │
                        │            │           │
                        ▼            ▼           │
            ┌───────────────┐ ┌───────────────┐ │
            │ Manage        │ │ View          │ │
            │ Products      │ │ Analytics     │ │
            │               │ │               │ │
            │ • Add/Edit    │ │ • Sales       │ │
            │ • Delete      │ │ • Products    │ │
            │ • Import      │ │ • Customers   │ │
            └───────┬───────┘ └───────┬───────┘ │
                    │                 │         │
                    ▼                 ▼         │
        ┌───────────────────┐ ┌────────────────┐
        │  Manage Orders    │ │  Manage Users  │
        │  ──────────────   │ │  ───────────   │
        │  • Update status  │ │  • Suspend     │
        │  • Fulfill        │ │  • Promote     │
        │  • Track          │ │  • Roles       │
        └───────┬───────────┘ └────────┬───────┘
                │                      │
                ▼                      │
    ┌───────────────────────────────┐ │
    │  Manage CMS Content           │ │
    │  ───────────────────────      │ │
    │  • Homepage sections          │ │
    │  • Promotions                 │ │
    │  • Pages                      │ │
    └─────────────┬─────────────────┘ │
                  │                   │
                  ▼                   │
    ┌───────────────────────────┐    │
    │  Log Actions to Audit     │    │
    │  ─────────────────────    │    │
    │  • Track changes          │    │
    │  • Record admin actions   │    │
    └─────────────┬─────────────┘    │
                  │                   │
                  ▼                   │
        ┬───────────────────────┬    │
        │  Perform Another      │    │
        │  Operation?           │    │
        └──────┬────────┬───────┘    │
               │        │            │
           Yes │        │ No         │
               │        │            │
               ▼        ▼            │
        ┌──────────┐ ┌──────────┐   │
        │  LOOP    │ │   END    │   │
        │  BACK TO │ │  SESSION │ ◀─┘
        │  DASHBOARD││          │
        └──────────┘ └──────────┘

         ╞══════════════════════════════════════╤══════════════════════════════════════╡
         │         DATA STORES                  │                                      │
         │                                      │                                      │
         │  D1: Users          D2: Products    │  D4: CMS        D5: Orders           │
         │  ────────────      ─────────────   │  ────────────   ────────────         │
         │  • Admin accounts  • Inventory     │  • Homepage     • All orders         │
         │  • Roles           • Categories    │  • Promotions   • Status             │
         │  • Permissions     • Status        │  • Pages        • Analytics data     │
         │                    • Images        │                                      │
         │                                 D6: Audit Log                             │
         │                                 ────────────                              │
         │                                 • All admin actions                       │
         │                                 • Change tracking                         │
         └───────────────────────────────────────────────────────────────────────────┘
```

### Contact Form Flowchart

```
                    ╔═══════════════════╗
                    ║   START CONTACT   ║
                    ║     FORM          ║
                    ╚═══════════════┬═══╝
                                    │
                                    ▼
                    ┌────────────────────────────────────┐
                    │  Customer Fills Contact Form       │
                    │  ─────────────────────────         │
                    │  • Name                            │
                    │  • Email                           │
                    │  • Subject                         │
                    │  • Message                         │
                    └─────────────────┬──────────────────┘
                                      │
                                      ▼
                    ┌────────────────────────────────────┐
                    │  Submit Form                       │
                    └─────────────────┬──────────────────┘
                                      │
                                      ▼
                              ┬───────────────┬
                              │  Rate Limit   │
                              │  Check (< 5   │
                              │   /min per IP)│
                              └───┬───────┬───┘
                                  │       │
                              OK  │       │ Rate
                                  │       │ Limited ───┐
                                  ▼       ▼            │
                    ┌──────────────────────┐ ┌────────────────┐
                    │  Validate Input      │ │  Return Error  │
                    │  ─────────────────  │ │  "Too many     │
                    │  • Email format      │ │   requests"    │
                    │  • Required fields   │ └──────┬─────────┘
                    │  • Message length    │        │
                    └─────────┬────────────┘        │
                              │                     │
                              ▼                     │
                    ┬───────────────────────────┬   │
                    │  Validation               │   │
                    │  Success?                 │   │
                    └───┬────────────┬──────────┘   │
                        │            │              │
                    Yes │            │ No           │
                        │            │              │
                        ▼            ▼              │
        ┌───────────────────────────┐ ┌────────────┐
        │  Sanitize Input           │ │  Display   │
        │  ─────────────────       │ │  Validation│
        │  • Remove XSS             │ │  Errors    │
        │  • Escape HTML            │ │            │
        └─────────┬─────────────────┘ └─────┬──────┘
                  │                        │
                  ▼                        │
┌──────────────────────────────────────────┐│
│  Determine Email Transport                ││
│  ─────────────────────                   ││
│  • Check SMTP config                     ││
│  • Check Gmail OAuth                     ││
│  • Fallback to test account              ││
└─────────────────┬────────────────────────┘│
                  │                        │
                  ▼                        │
    ┌──────────────────────────────────────┐
    │  Send Business Notification          │
    │  ────────────────────────            │
    │  • To business email                 │
    │  • Include customer details          │
    │  • HTML template                     │
    └──────────────┬───────────────────────┘
                   │
                   ▼
       ┬────────────────────────┬
       │  Email                 │
       │  Sent?                 │
       └───┬────────────┬───────┘
           │            │
       Yes │            │ No
           │            │
           ▼            ▼
┌───────────────────┐ ┌───────────────────┐
│  Send Auto-Reply  │ │  Log Error        │
│  to Customer      │ │  Continue         │
│  ─────────────   │ │                   │
│  • Thank you msg  │ │                   │
│  • Confirmation   │ │                   │
│  • Company info   │ │                   │
└─────────┬─────────┘ └──────────┬────────┘
          │                      │
          ▼                      ▼
  ┌──────────────┐       ┌──────────────┐
  │  Display     │       │  Display     │
  │  Success     │       │  Error (w/   │
  │  Message     │       │  partial     │
  │              │       │  success)    │
  └──────┬───────┘       └──────┬───────┘
         │                      │
         ▼                      ▼
    ┌──────────┐          ┌──────────┐
    │   END    │          │   END    │
    │ PROCESS  │          │ PROCESS  │
    └──────────┘          └──────────┘

         ╞══════════════════════════════════════╤══════════════════════════════════════╡
         │         PROCESS STORES               │                                      │
         │                                      │                                      │
         │  Email Transport (E4)                │  Rate Limit Tracking (Memory)        │
         │  ────────────────────                │  ─────────────────────────           │
         │  • SMTP Server                       │  • IP tracking                       │
         │  • Gmail OAuth                       │  • Request count                     │
         │  • Test Account                      │  • Time window                       │
         └───────────────────────────────────────────────────────────────────────────┘
```

---

## Level 1: DFD-1 (Decomposition)

**Purpose:** Breakdown of Process 0.0 into major subprocesses, showing data stores and flows

### Complete Level 1 DFD

```
┌─────────────┐                                      ┌─────────────┐
│  Customer   │                                      │Admin Staff  │
│    (E1)     │                                      │    (E2)     │
└──────┬──────┘                                      └──────┬──────┘
       │                                                  │
       │User requests, browse, cart, checkout, track     │Admin login, CRUD, management
       │                                                  │
       ▼                                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DAFFODIL E-COMMERCE SYSTEM                           │
│                                                                         │
│  ┌───────────┐        ┌───────────┐        ┌───────────┐              │
│  │  1.0 User │        │  2.0      │        │  3.0      │              │
│  │   Mngmnt  │        │ Product   │        │Cart       │              │
│  │           │        │ Browsing  │        │ Mngmnt    │              │
│  └─────┬─────┘        └─────┬─────┘        └─────┬─────┘              │
│        │                     │                     │                   │
│        │                     │                     │                   │
│        ▼                     ▼                     ▼                   │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐           │
│  │               │   │               │   │               │           │
│  │   D1: Users   │   │D2: Products   │   │  D3: Cart     │           │
│  │               │   │               │   │ (localStorage)│           │
│  └───────────────┘   └───────────────┘   └───────────────┘           │
│                                                                         │
│        │                     │                     │                   │
│        │                     │                     │                   │
│  ┌───────────┐        ┌───────────┐        ┌───────────┐              │
│  │  4.0      │        │  5.0      │        │  6.0      │              │
│  │Customize  │        │ Checkout  │        │ Order     │              │
│  │           │        │ & Payment │        │ Mngmnt    │              │
│  └─────┬─────┘        └─────┬─────┘        └─────┬─────┘              │
│        │                     │                     │                   │
│        │                     │                     │                   │
│        ▼                     ▼                     ▼                   │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐           │
│  │               │   │               │   │               │           │
│  │D4: CMS        │   │D5: Orders     │   │D6: Audit Log  │           │
│  │Content        │   │               │   │               │           │
│  └───────────────┘   └───────────────┘   └───────────────┘           │
│                                                                         │
│        │                     │                     │                   │
│        │                     │                     │                   │
│  ┌───────────┐        ┌───────────┐                                   │
│  │  7.0      │        │  8.0      │                                   │
│  │ Admin     │        │ Contact   │                                   │
│  │ Dashboard │        │ & Comm    │                                   │
│  └───────────┘        └───────────┘                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
       │                                        │             │
       │                                        │             │
       │                                        ▼             ▼
       │                                  ┌──────────┐  ┌──────────┐
       │                                  │Payment   │  │ Email    │
       │                                  │Gateway   │  │ Service  │
       │                                  │  (E3)    │  │   (E4)   │
       └──────────────────────────────────▶          │  │          │
              Product data, responses      │          │  │          │
              confirmations, updates       │          │  │          │
       ┌───────────────────────────────────┼─────────▶  │          │
       │                                   │          │  │          │
       │                                   └──────────┘  └──────────┘
       │
       │
       │
       ▼
┌─────────────┐
│AI Service   │
│  (E5)       │
│             │
│ (Generation │
│  requests)  │
│             │
└─────────────┘
```

### Process Descriptions

| Process                         | Description                              | Inputs                 | Outputs                   |
| ------------------------------- | ---------------------------------------- | ---------------------- | ------------------------- |
| **1.0 User Management**         | Handle authentication, sessions, profile | Login credentials      | Session tokens, user data |
| **2.0 Product Browsing**        | Display catalog, search, filter          | Browse/search queries  | Product listings, details |
| **3.0 Cart Management**         | Add/remove items, wishlist               | Product selections     | Cart state, totals        |
| **4.0 Customization**           | Build custom bouquets, AI preview        | Specs, choices         | Preview images, prices    |
| **5.0 Checkout & Payment**      | Process payments, create orders          | Cart, shipping info    | Order confirmations       |
| **6.0 Order Management**        | Track, update, fulfill orders            | Order queries, updates | Status, history           |
| **7.0 Admin Dashboard**         | Manage products, orders, users, CMS      | Admin commands         | Analytics, confirmations  |
| **8.0 Contact & Communication** | Handle contact forms, send emails        | Form submissions       | Email notifications       |

### Data Stores

| Store  | Name        | Stores                                     |
| ------ | ----------- | ------------------------------------------ |
| **D1** | Users       | User accounts, authentication, permissions |
| **D2** | Products    | Product catalog, inventory, pricing        |
| **D3** | Cart        | Shopping cart, wishlist (localStorage)     |
| **D4** | CMS Content | Homepage sections, promotions, pages       |
| **D5** | Orders      | Order history, status, fulfillment         |
| **D6** | Audit Log   | Admin actions, change tracking             |

### External Entities

| Entity | Name            | Role                                           |
| ------ | --------------- | ---------------------------------------------- |
| **E1** | Customer        | Browse, purchase, manage account               |
| **E2** | Admin Staff     | Manage products, orders, users, view analytics |
| **E3** | Payment Gateway | Process payments (Stripe, PayPal, PayMongo)    |
| **E4** | Email Service   | Send notifications, confirmations              |
| **E5** | AI Service      | Generate product preview images                |

---

## 📋 Structured Purchase Flowchart (DFD Notation)

**Purpose:** Complete customer purchase flow following structured flowchart rules (Start → Input → Process → Data → Decision → End)

```
                    ╔═══════════════════╗
                    ║      START        ║
                    ║  Visit Daffodil   ║
                    ╚═══════════════┬═══╝
                                    │
                                    ▼
                    ┌────────────────────────────────────┐
                    │   INPUT: User enters login details │
                    │   (If logged in, skip to browse)   │
                    └─────────────────┬──────────────────┘
                                      │
                                      ▼
                    ┌────────────────────────────────────┐
                    │  PROCESS: Validate credentials     │
                    └─────────────────┬──────────────────┘
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │   D1: Users Database   │
                         └─────────┬──────────────┘
                                   │
                                   ▼
                         ┬────────────────────────┬
                         │ DECISION:              │
                         │ Login details correct? │
                         └───┬──────────────┬─────┘
                             │              │
                         Yes │              │ No
                             │              │
                 ┌───────────┘              └───────────┐
                 │                                      │
                 ▼                                      ▼
    ┌───────────────────────────┐      ┌───────────────────────────┐
    │ PROCESS: Grant access     │      │ PROCESS: Display error    │
    │ to account                │      │ message                   │
    └───────────┬───────────────┘      └───────────┬───────────────┘
                │                                  │
                │   ◄──────────────────────────────┘
                │
                ▼
    ┌─────────────────────────────────────────────┐
    │   INPUT: User selects product               │
    │   (Browse catalog, search, view details)    │
    └─────────────────┬───────────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────────┐
    │   PROCESS: Display product details          │
    └─────────────────┬───────────────────────────┘
                      │
                      ▼
           ┌────────────────────────┐
           │   D2: Products         │
           │   Database             │
           └─────────┬──────────────┘
                     │
                     ▼
    ┌─────────────────────────────────────────────┐
    │   INPUT: User adds item to cart             │
    │   (Or customizes bouquet)                   │
    └─────────────────┬───────────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────────┐
    │   PROCESS: Update cart                      │
    │   Calculate total                           │
    └─────────────────┬───────────────────────────┘
                      │
                      ▼
           ┌────────────────────────┐
           │   D3: Cart             │
           │   (localStorage)       │
           └─────────┬──────────────┘
                     │
                     ▼
         ┬────────────────────────┬
         │ DECISION:              │
         │ Add more items?        │
         └───┬──────────────┬─────┘
             │              │
         Yes │              │ No
             │              │
             │◄─────────────┘
             │
             ▼
    ┌─────────────────────────────────────────────┐
    │   INPUT: User proceeds to checkout          │
    │   • Enter shipping details                  │
    │   • Review order                            │
    │   • Select payment method                   │
    └─────────────────┬───────────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────────┐
    │   PROCESS: Process payment                  │
    │   • Send details to payment gateway         │
    │   • Initialize transaction                  │
    └─────────────────┬───────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Payment Gateway      │
         │   (External E3)        │
         └─────────┬──────────────┘
                   │
                   ▼
         ┬────────────────────────┬
         │ DECISION:              │
         │ Payment successful?    │
         └───┬──────────────┬─────┘
             │              │
         Yes │              │ No
             │              │
             ▼              ▼
    ┌────────────────┐ ┌────────────────────────────────┐
    │ PROCESS: Save  │ │ PROCESS: Return to payment     │
    │ order + send   │ │ screen + show error            │
    │ email          │ └───────────┬────────────────────┘
    └────────┬───────┘             │
             │                     │
             ▼                     │
    ┌────────────────────────┐    │
    │   D5: Orders Database  │    │
    └─────────┬──────────────┘    │
              │                   │
              ▼                   │
    ┌────────────────────────┐    │
    │   Email Service (E4)   │    │
    └─────────┬──────────────┘    │
              │                   │
              ▼                   │◄─────────────┐
    ┌─────────────────────────────────────────────┐│
    │   PROCESS: Update inventory                 ││
    │   Deduct stock                              ││
    └─────────────────┬───────────────────────────┘│
                      │                            │
                      ▼                            │
         ┌────────────────────────┐                │
         │   D2: Products DB      │                │
         │   Update stock         │                │
         └─────────┬──────────────┘                │
                   │                               │
                   ▼                               │
    ┌─────────────────────────────────────────────┐
    │   PROCESS: Display order confirmation       │
    │   Show order number & details               │
    └─────────────────┬───────────────────────────┘
                      │
                      ▼
                ┌──────────┐
                │   END    │
                └──────────┘

═══════════════════════════════════════════════════════════════════════════

                    DATA STORES LEGEND

╞════════════════╤════════════════════════════════════╡
│   D1: Users    │ User accounts, authentication      │
│                │ Session tokens, permissions        │
├────────────────┼────────────────────────────────────┤
│ D2: Products   │ Product catalog, inventory         │
│                │ Stock levels, pricing, images      │
├────────────────┼────────────────────────────────────┤
│  D3: Cart      │ Shopping cart (localStorage)       │
│                │ Wishlist, user preferences         │
├────────────────┼────────────────────────────────────┤
│ D5: Orders     │ Order history, status              │
│                │ Fulfillment tracking               │
└────────────────┴────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════

              EXTERNAL ENTITIES

╞═══════════════════════════════════════════════════════════╡
│  E3: Payment Gateway                                      │
│  • Stripe / PayPal / PayMongo                             │
│  • Processes card and digital wallet payments             │
├───────────────────────────────────────────────────────────┤
│  E4: Email Service                                        │
│  • SMTP / Gmail OAuth                                     │
│  • Sends order confirmations, notifications               │
└───────────────────────────────────────────────────────────┘
```

### Flow Description

**Sequence of Operations:**

1. **Start** → User visits Daffodil Flower Shop
2. **Input** → User enters login credentials (if not logged in)
3. **Process** → System validates credentials against D1 (Users)
4. **Decision** → Valid credentials? YES: grant access; NO: show error
5. **Input** → User selects product from catalog
6. **Process** → System displays details from D2 (Products)
7. **Input** → User adds to cart
8. **Process** → System updates D3 (Cart)
9. **Decision** → More items? Loop back; otherwise continue
10. **Input** → User proceeds to checkout
11. **Process** → System sends payment details to E3 (Payment Gateway)
12. **Decision** → Payment successful?
    - YES → Save to D5, send email via E4, update D2 stock → End
    - NO → Return to payment screen
13. **End** → Show order confirmation

---

## Level 2: Detailed Process Flows

### 🔐 Process 1.0: User Management

```
╔═══════════════════════════════════════════════════════════╗
║             1.0 USER MANAGEMENT SYSTEM                    ║
╚═══════════════════════════════════════════════════════════╝

┌────────────┐         ┌────────────┐         ┌────────────┐
│  1.1 Auth │────────▶│ 1.2 Session│────────▶│ 1.3 Profile│
│           │         │  Management│         │            │
│ • Login   │         │            │         │ • View     │
│ • Signup  │         │ • Supabase │         │   Orders   │
│ • Logout  │         │ • Realtime │         │ • Update   │
│ • OAuth   │         │ • LocalStorage│      │   Info     │
└────────────┘         └────────────┘         └────────────┘

📡 DATA FLOWS:
   👤 Customer ──────[credentials]────→ 1.1 Auth
   1.1 Auth ──────[user_data]────────→ D1 Users
   1.2 Session ────[session_tokens]──→ LocalStorage
   1.3 Profile ─────[order_queries]───→ D5 Orders
   ✉️ Email ←─────[verification]────── 1.1 Auth
```

**Key Features:**

- Supabase Auth with email verification
- OAuth callbacks (Google, GitHub, Microsoft)
- Per-user session isolation
- Real-time auth state subscriptions
- Admin role detection (email whitelist + DB flag)

### 🌹 Process 2.0: Product Browsing & Search

```
╔═══════════════════════════════════════════════════════════╗
║       2.0 PRODUCT BROWSING & SEARCH SYSTEM                ║
╚═══════════════════════════════════════════════════════════╝

┌────────────┐         ┌────────────┐         ┌────────────┐
│ 2.1 Catalog│────────▶│ 2.2 Details│────────▶│ 2.3 Search │
│            │         │            │         │            │
│ • Categories│        │ • Full Info│        │ • Text     │
│ • Seasonal │        │ • Images   │        │ • Filters  │
│ • Featured │        │ • Specs    │        │ • Price    │
└────────────┘         └────────────┘         └────────────┘

📡 DATA FLOWS:
   👤 Customer ──[category]────→ 2.1 Catalog
   2.1 Catalog ──[list_query]──→ D2 Products
   2.2 Details ──[product_id]───→ D2 Products
   2.3 Search ───[filters]──────→ D2 Products
   📦 D2 Products ──[data]────────→ 👤 Customer
```

**Key Features:**

- Dynamic product catalog from Supabase
- Categories: Floral Arrangements, Seasonal, Gift Collections
- Real-time stock status
- Product search with filters
- Image galleries

### 🛒 Process 3.0: Shopping Cart Management

```
╔═══════════════════════════════════════════════════════════╗
║         3.0 SHOPPING CART MANAGEMENT SYSTEM               ║
╚═══════════════════════════════════════════════════════════╝

┌────────────┐         ┌────────────┐         ┌────────────┐
│ 3.1 Cart   │────────▶│ 3.2 Save   │         │ 3.3 Wish   │
│ Operations │         │            │         │            │
│            │         │ • localStorage│      │ • Add/     │
│ • Add/Remove│        │ • per-user │        │   Remove   │
│ • Update   │        │ • auto-sync│        │ • Favorites│
└────────────┘         └────────────┘         └────────────┘

📡 DATA FLOWS:
   👤 Customer ──[cart_modify]─→ 3.1 Cart Ops
   3.2 Save ─────[cart_data]───→ LocalStorage
   3.3 Wish ─────[wish_data]───→ LocalStorage
   📦 Products ───[pricing]─────→ 3.1 Cart Ops
```

**Key Features:**

- Guest & authenticated user isolation
- Persistent cart via LocalStorage
- Real-time quantity updates
- Wishlist integration

### 🎨 Process 4.0: Customization Engine

```
╔═══════════════════════════════════════════════════════════╗
║           4.0 AI CUSTOMIZATION ENGINE                     ║
╚═══════════════════════════════════════════════════════════╝

┌────────────┐         ┌────────────┐         ┌────────────┐
│ 4.1 Builder│────────▶│ 4.2 AI Gen │────────▶│ 4.3 Price  │
│            │         │            │         │            │
│ • Flower   │         │ • Stable   │         │ • Base     │
│ • Color    │         │   Diffusion│         │ • Add-ons  │
│ • Stems    │         │ • HuggingFace│       │ • Wrap     │
│ • Add-ons  │         │ • Preview  │         │            │
└────────────┘         └────────────┘         └────────────┘

📡 DATA FLOWS:
   👤 Customer ──[specs]──────→ 4.1 Builder
   4.2 AI Gen ───[prompt]─────→ 🤖 HuggingFace
   🤖 HuggingFace─[image]─────→ 4.2 AI Gen
   4.3 Price ─────[total]──────→ 👤 Customer
   4.1 Builder ───[draft]──────→ LocalStorage
```

**Key Features:**

- AI-powered bouquet preview generation
- Flower type, color, stems, wrap, add-ons
- Real-time price calculation
- Draft saving
- Professional product photography prompts

### 💳 Process 5.0: Checkout & Payment

```
╔═══════════════════════════════════════════════════════════╗
║        5.0 CHECKOUT & PAYMENT PROCESSING                  ║
╚═══════════════════════════════════════════════════════════╝

┌────────────┐         ┌────────────┐         ┌────────────┐
│ 5.1 Checkout│────────▶│ 5.2 Payment│────────▶│ 5.3 Create │
│            │         │            │         │            │
│ • Shipping │         │ • Stripe   │         │ • Order #  │
│ • Contact  │         │ • PayPal   │         │ • Save     │
│ • Gift note│         │ • PayMongo │         │ • Email    │
└────────────┘         └────────────┘         └────────────┘

📡 DATA FLOWS:
   👤 Customer ──[info]───────→ 5.1 Checkout
   5.1 Checkout ─[cart]───────→ LocalStorage
   5.2 Payment ──[session]────→ 💳 Gateway
   💳 Gateway ───[confirm]────→ 5.3 Create
   5.3 Create ───[order]──────→ D5 Orders
   5.3 Create ───[email]──────→ ✉️  Email Service
```

**Key Features:**

- Multiple payment gateways (Stripe/PayPal/PayMongo)
- Secure session handling
- Automatic order creation
- Email confirmations
- Order number generation

### 📦 Process 6.0: Order Management

```
╔═══════════════════════════════════════════════════════════╗
║             6.0 ORDER MANAGEMENT SYSTEM                   ║
╚═══════════════════════════════════════════════════════════╝

┌────────────┐         ┌────────────┐         ┌────────────┐
│ 6.1 Track  │────────▶│ 6.2 Stock  │────────▶│ 6.3 Fulfill│
│            │         │            │         │            │
│ • View     │         │ • Check    │         │ • Update   │
│ • Status   │         │ • Deduct   │         │   Status   │
│ • History  │         │ • Restock  │         │ • Email    │
└────────────┘         └────────────┘         └────────────┘

📡 DATA FLOWS:
   👤 Customer ──[order_inquiry]→ 6.1 Track
   6.1 Track ─────[status]──────→ D5 Orders
   6.2 Stock ─────[update]──────→ D2 Products
   6.3 Fulfill ───[status]──────→ D5 Orders
   6.3 Fulfill ───[notification]→ ✉️  Email Service
```

**Key Features:**

- Real-time order tracking
- Automatic stock deduction
- Status workflow management
- Customer notifications
- Order history

### 👔 Process 7.0: Admin Dashboard

```
╔═══════════════════════════════════════════════════════════╗
║             7.0 ADMIN DASHBOARD SYSTEM                    ║
╚═══════════════════════════════════════════════════════════╝

   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ 7.1 Prod │    │ 7.2 Order│    │ 7.3 User │
   │          │    │          │    │          │
   │ • CRUD   │    │ • Manage │    │ • Suspend│
   │ • Import │    │ • Update │    │ • Promote│
   └──────────┘    └──────────┘    └──────────┘

   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ 7.4 CMS  │    │ 7.5 Anal │    │ 7.6 Audit│
   │          │    │          │    │          │
   │ • Pages  │    │ • Sales  │    │ • Track  │
   │ • Promos │    │ • Reports│    │   Actions│
   └──────────┘    └──────────┘    └──────────┘

📡 DATA FLOWS:
   👔 Admin ─────[CRUD]───────→ 7.1-7.4
   7.1 Products ──[data]───────→ D2 Products
   7.2 Orders ─────[status]────→ D5 Orders
   7.3 Users ──────[roles]─────→ D1 Users
   7.4 CMS ────────[content]───→ D4 CMS
   7.5 Analytics ──[reports]───→ D2, D5
   7.6 Audit ──────[log]───────→ D6 Audit
```

**Key Features:**

- Complete product CRUD
- Order management
- User administration
- CMS content editing
- Analytics dashboard
- Audit trail logging

### ✉️ Process 8.0: Contact & Communication

```
╔═══════════════════════════════════════════════════════════╗
║        8.0 CONTACT & COMMUNICATION SYSTEM                 ║
╚═══════════════════════════════════════════════════════════╝

┌────────────┐         ┌────────────┐         ┌────────────┐
│ 8.1 Form   │────────▶│ 8.2 Email  │         │ 8.3 Rate   │
│            │         │            │         │   Limit    │
│ • Name     │         │ • SMTP     │         │            │
│ • Email    │         │ • Gmail    │         │ • 5/min    │
│ • Message  │         │ • Auto-reply│        │ • IP Track │
└────────────┘         └────────────┘         └────────────┘

📡 DATA FLOWS:
   👤 Customer ──[form]────────→ 8.1 Form
   8.3 Limit ────[check]───────→ In-Memory
   8.2 Email ─────[business]───→ ✉️  Email Service
   8.2 Email ─────[reply]──────→ ✉️  Customer
```

**Key Features:**

- Rate limiting (5 req/min per IP)
- Auto-reply system
- Business notifications
- Multi-transport (SMTP/Gmail OAuth)
- Input sanitization

---

## Data Stores (D-Files)

**Purpose:** All data repositories in the system

| Store                | Location     | Purpose                     | Key Fields                                  |
| -------------------- | ------------ | --------------------------- | ------------------------------------------- |
| **D1: Users**        | Supabase DB  | User accounts & permissions | `id`, `email`, `is_admin`, `suspended`      |
| **D2: Products**     | Supabase DB  | Product catalog             | `id`, `title`, `price`, `stock`, `category` |
| **D3: Cart**         | LocalStorage | Shopping cart state         | `cart:{user_id}` → `{items: []}`            |
| **D4: CMS Content**  | Supabase DB  | Dynamic content             | `homepage_sections`, `promotions`, `pages`  |
| **D5: Orders**       | Supabase DB  | Order history               | `order_number`, `status`, `items`, `total`  |
| **D6: Audit Log**    | Supabase DB  | Admin actions               | `actor_id`, `action`, `entity`, `data`      |
| **D7: LocalStorage** | Browser      | Client state                | `cart`, `wishlist`, preferences             |

### Database Schema Overview

```sql
-- D1: Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  is_admin BOOLEAN DEFAULT false,
  suspended BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- D2: Products
CREATE TABLE products (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category VARCHAR,
  status VARCHAR DEFAULT 'active',
  stock INTEGER DEFAULT 0,
  images JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- D5: Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR UNIQUE,
  customer_email VARCHAR NOT NULL,
  customer_name VARCHAR,
  total DECIMAL(10,2),
  status VARCHAR,
  items JSONB,
  payment_status VARCHAR,
  payment_method VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- D4: CMS Content
CREATE TABLE cms_homepage_sections (...);
CREATE TABLE cms_promotions (...);
CREATE TABLE cms_pages (...);

-- D6: Audit Log
CREATE TABLE admin_audit (...);
```

---

## External Entities

**Purpose:** Systems and users outside the Daffodil boundary

| Entity                      | Role               | Key Interactions                                 |
| --------------------------- | ------------------ | ------------------------------------------------ |
| **E1: Customer** 👤         | End users          | Browse, purchase, contact, track orders          |
| **E2: Admin Staff** 👔      | Administrators     | Manage products/orders/users, view analytics     |
| **E3: Payment Gateways** 💳 | Payment processors | Stripe, PayPal, PayMongo (multi-gateway support) |
| **E4: Email Service** ✉️    | Messaging          | SMTP, Gmail OAuth, order confirmations           |
| **E5: AI Service** 🤖       | Image generation   | HuggingFace Stable Diffusion for previews        |

---

## Key User Journeys

### 🌸 Customer Purchase Journey

```
1. BROWSE → [Land on Homepage]
   ↓
2. DISCOVER → [View Products / Search / Filter]
   ↓
3. SELECT → [Add to Cart / Customize]
   ↓
4. CUSTOMIZE → [AI Preview / Adjust Specs] [Optional]
   ↓
5. CHECKOUT → [Enter Details / Choose Payment]
   ↓
6. PAY → [Stripe/PayPal/PayMongo]
   ↓
7. CONFIRM → [Order Created / Email Sent]
   ↓
8. TRACK → [View Status / Get Updates]
```

**Supporting Flows:**

- 👤 **Authentication**: Login/Signup at any point
- 💝 **Wishlist**: Save for later
- ✉️ **Contact**: Get support
- 📜 **History**: View past orders

### 👔 Admin Management Journey

```
1. ACCESS → [Admin Login / Auth Check]
   ↓
2. OVERVIEW → [Dashboard Analytics]
   ↓
3. MANAGE → Choose Area:
   ├─ Products: CRUD, Import, Inventory
   ├─ Orders: Update Status, Fulfillment
   ├─ Users: Roles, Suspension
   ├─ CMS: Pages, Promotions, Homepage
   └─ Reports: Sales, Products, Customers
   ↓
4. AUDIT → [All Changes Logged]
```

**Security:** All admin actions require authentication and are logged.

---

## System Architecture

### 🏗️ Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                            │
├─────────────────────────────────────────────────────────────┤
│ • Next.js 15         • React 19                             │
│ • Chakra UI          • Framer Motion                        │
│ • Swiper (Carousels) • Emotion (Styling)                    │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                │
├─────────────────────────────────────────────────────────────┤
│ • Next.js API Routes • Server Components                    │
│ • Runtime: Node.js   • Serverless Functions                │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                  SERVICES LAYER                             │
├─────────────────────────────────────────────────────────────┤
│ • Supabase Auth     • Database (PostgreSQL)                 │
│ • Storage (Client)  • Email (Nodemailer)                    │
│ • Payments          • AI (HuggingFace)                      │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────┤
│ • Stripe API        • PayPal API                            │
│ • PayMongo API      • HuggingFace API                       │
│ • SMTP/Email        • Vercel Hosting                        │
└─────────────────────────────────────────────────────────────┘
```

### 🔐 Security Architecture

```
Protection Layer 1: Authentication
├── Supabase Auth with JWT tokens
├── OAuth2 for third-party login
└── Session management with refresh tokens

Protection Layer 2: Authorization
├── Role-based access control (Admin vs Customer)
├── Email whitelist for admin access
└── Suspension system for user management

Protection Layer 3: Input Validation
├── XSS prevention via input sanitization
├── SQL injection prevention via parameterized queries
└── Rate limiting (5 req/min on contact form)

Protection Layer 4: Data Security
├── HTTPS only (TLS 1.3)
├── Environment variables for secrets
├── Admin audit logging
└── Secure payment processing (PCI compliance)

Protection Layer 5: Deployment
├── Vercel edge network
├── DDoS protection
├── CSRF protection via Next.js
└── Content Security Policy headers
```

---

## 📊 Integration Points

```
User Interactions → API Routes → External Services
                                   ↓
                               Responses
                                   ↓
                         UI Updates + Emails
                                   ↓
                           Database Updates
```

**Key Integrations:**

- 💳 **Payments**: Stripe, PayPal, PayMongo webhooks
- ✉️ **Email**: SMTP/Gmail OAuth with Nodemailer
- 🤖 **AI**: HuggingFace Inference API
- 💾 **Database**: Supabase real-time subscriptions
- 🔐 **Auth**: Supabase Auth with OAuth providers

---

## 🎯 Key Metrics & Monitoring

**Business Metrics:**

- Product views, add-to-cart rate, conversion rate
- Average order value, revenue trends
- Customer lifetime value, repeat purchase rate

**Technical Metrics:**

- API response times, error rates
- Payment success rate, email delivery rate
- AI generation latency, cache hit rates

**Security Metrics:**

- Failed login attempts, suspicious activity
- Rate limit violations, admin action frequency
- Audit log coverage, sensitive data access

---

## 📝 Additional Resources

- **API Documentation**: `/api` routes in codebase
- **Admin Dashboard**: `/admin` accessible to admins only
- **Database Schema**: See Supabase dashboard
- **Environment Variables**: Check `.env.example`
- **Deployment**: Configured in Vercel
- **Email Templates**: HTML templates in contact route

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained by:** Daffodil Development Team

> This comprehensive DFD represents the complete data flow architecture of the Daffodil Flower Shop e-commerce platform, documenting all major processes, data stores, external integrations, and security considerations.

---

## 📚 Academic-Style Flowcharts

**Purpose:** Simple, clear flowcharts for academic documentation using standard symbols

### Login Flowchart

```
┌──────────────┐
│   START      │
│  Visit Site  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ INPUT:               │
│ Enter email          │
│ Enter password       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ PROCESS:             │
│ Validate credentials │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ DATA:                │
│ Users Database       │
│ Check username       │
│ Check password       │
└──────┬───────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ DECISION:                          │
│ Are credentials valid?             │
└───┬────────────────────┬───────────┘
    │                    │
Yes │                    │ No
    │                    │
    ▼                    ▼
┌──────────────┐    ┌────────────────────┐
│ PROCESS:     │    │ PROCESS:           │
│ Grant access │    │ Display error      │
│ Create       │    │ Try again          │
│ session      │    └─────┬──────────────┘
└──────┬───────┘          │
       │                   │
       │◄──────────────────┘
       │
       ▼
┌──────────────┐
│   END        │
│ Access       │
│ Account      │
└──────────────┘
```

---

### Product Browsing Flowchart

```
┌──────────────┐
│   START      │
│ Browse Shop  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ PROCESS:             │
│ Load product         │
│ catalog              │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ DATA:                │
│ Products Database    │
│ Read product list    │
│ Read images          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ PROCESS:             │
│ Display products     │
│ Show categories      │
│ Show prices          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ INPUT:               │
│ Select product       │
│ Choose quantity      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ PROCESS:             │
│ Add item to cart     │
│ Update cart total    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ DATA:                │
│ Cart Storage         │
│ Save cart items      │
└──────┬───────────────┘
       │
       ▼
┌───────────────────────────────────┐
│ DECISION:                         │
│ Continue shopping or check out?   │
└───┬───────────────────┬───────────┘
    │                   │
More│                   │ Check
items│                   │ out
    │                   │
    ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ PROCESS:     │    │ PROCESS:     │
│ Return to    │    │ Proceed to   │
│ catalog      │    │ checkout     │
└──────┬───────┘    └──────┬───────┘
       │                   │
       │◄──────────────────┘
       │
       ▼
┌──────────────┐
│   END        │
│ Cart Ready   │
│ for Purchase │
└──────────────┘
```

---

### Checkout Flowchart

```
┌──────────────┐
│   START      │
│ Go to        │
│ Checkout     │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ PROCESS:             │
│ Review cart items    │
│ Check quantities     │
│ Verify total         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ INPUT:               │
│ Enter shipping       │
│ address              │
│ Enter contact        │
│ information          │
│ Select payment       │
│ method               │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ INPUT:               │
│ Enter payment        │
│ details              │
│ Review order         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ PROCESS:             │
│ Confirm payment      │
│ Process transaction  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ DATA:                │
│ Payment Gateway      │
│ External processor   │
└──────┬───────────────┘
       │
       ▼
┌───────────────────────────────────┐
│ DECISION:                         │
│ Was payment successful?           │
└───┬────────────────────┬──────────┘
    │                    │
Yes │                    │ No
    │                    │
    ▼                    ▼
┌──────────────┐    ┌────────────────────┐
│ PROCESS:     │    │ PROCESS:           │
│ Save order   │    │ Display error      │
│ Update       │    │ Return to payment  │
│ inventory    │    └─────┬──────────────┘
└──────┬───────┘          │
       │                   │
       ▼                   │
┌──────────────────────┐   │
│ DATA:                │   │
│ Orders Database      │   │
│ Save order details   │   │
└──────┬───────────────┘   │
       │                   │
       ▼                   │
┌──────────────────────┐   │
│ PROCESS:             │   │
│ Send confirmation    │   │
│ email                │   │
└──────┬───────────────┘   │
       │                    │
       │                    │◄────┐
       │                    │     │
       ▼                    │     │
┌──────────────┐            │     │
│ PROCESS:     │            │     │
│ Display      │            │     │
│ confirmation │            │     │
│ Show order   │            │     │
│ number       │            │     │
└──────┬───────┘            │     │
       │                    │     │
       ▼                    ▼     │
┌──────────────┐    ┌──────────────┐
│   END        │    │ PROCESS:     │
│ Order        │    │ Try payment  │
│ Complete     │    │ again        │
└──────────────┘    └──────┬───────┘
                           │
                           │
                           ▼
                    ┌──────────────┐
                    │   END        │
                    │ Transaction  │
                    │ Cancelled    │
                    └──────────────┘
```

---

**Flowchart Summary:**

| Flowchart            | Steps    | Key Decisions              | Data Stores             |
| -------------------- | -------- | -------------------------- | ----------------------- |
| **Login**            | 7 steps  | Valid/invalid credentials  | Users Database          |
| **Product Browsing** | 9 steps  | Continue shopping/checkout | Products, Cart          |
| **Checkout**         | 11 steps | Payment success/failure    | Orders, Payment Gateway |

_These flowcharts follow standard academic notation and represent simplified business processes._
