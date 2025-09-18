# Data Flow Diagram (DFD) Notation Guide

## DFD Symbol Legend

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           DFD SYMBOLS AND MEANINGS                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

    ◯                    ┌─────────────┐              ┌═════════════┐
   CIRCLE               │    BOX      │              ║  OPEN BOX   ║
  (Process)             │ (External    │              ║ (Data Store)║
                        │  Entity)     │              ║             ║
                        └─────────────┘              └═════════════┘
      │                        │                           │
      │                        │                           │
      ▼                        ▼                           ▼

• Represents a         • Represents sources      • Represents data
  transformation         and destinations          storage (files,
  or processing          outside your system       databases, etc.)
  of data
                       • Things that send        • Data at rest
• Always labeled         data to or receive
  with a VERB           data from your          • Should match your
                        system                    ERD entities
• Examples:
  - Process Order      • Examples:               • Examples:
  - Verify Login        - Customer                - D1: Users
  - Calculate Total     - Admin                   - D2: Products
  - Update Inventory    - Payment Gateway         - D3: Orders

                              ───────────────►
                                 ARROW
                              (Data Flow)
                                   │
                                   ▼
                           • Shows direction of
                             data movement
                           • Always labeled with
                             the data being moved
                           • Examples:
                             - User Login
                             - Product List
                             - Order Details
```

## Visual DFD Example with Clear Symbols

```
                    DAFFODIL FLOWER SHOP - VISUAL DFD EXAMPLE

┌─────────────┐                                                    ┌─────────────┐
│             │                                                    │             │
│  CUSTOMER   │                                                    │    ADMIN    │
│             │                                                    │             │
│ (External   │                                                    │ (External   │
│  Entity)    │                                                    │  Entity)    │
└─────────────┘                                                    └─────────────┘
      │                                                                    │
      │ Login Request                                         Admin Login  │
      │                                                                    │
      ▼                                                                    ▼

    ┌─────────────────────────────────────────────────────────────────────────┐
    │                                                                         │
    │                          ◯  1.0                                        │
    │                    AUTHENTICATE                                         │
    │                        USER                                             │
    │                     (Process)                                           │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘
                                    │ ▲
                                    │ │
                         User Data  │ │ Auth Status
                                    ▼ │
                            ┌═════════════┐
                            ║             ║
                            ║ D1: USERS   ║
                            ║             ║
                            ║ (Data Store)║
                            ║             ║
                            └═════════════┘

      │                                                                    │
      │ Product Request                                       Product Data │
      │                                                                    │
      ▼                                                                    ▼

    ┌─────────────────────────────────────────────────────────────────────────┐
    │                                                                         │
    │                          ◯  3.0                                        │
    │                    BROWSE PRODUCTS                                      │
    │                      (Process)                                          │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘
                                    │ ▲
                                    │ │
                        Product     │ │ Product Updates
                        Data        ▼ │
                            ┌═════════════┐
                            ║             ║
                            ║ D2: PRODUCTS║
                            ║             ║
                            ║ (Data Store)║
                            ║             ║
                            └═════════════┘
                                    ▲
                                    │
                                    │ Product Updates
                                    │
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                                                                         │
    │                          ◯  4.0                                        │
    │                   MANAGE PRODUCTS                                       │
    │                      (Process)                                          │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘
```

## Step-by-Step DFD Reading Guide

### **1. Start with External Entities (Boxes)**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  CUSTOMER   │     │    ADMIN    │     │   STRIPE    │
│             │     │             │     │  GATEWAY    │
└─────────────┘     └─────────────┘     └─────────────┘

These are the "actors" - things OUTSIDE your system that:
• Send data TO your system
• Receive data FROM your system
• Are sources or destinations of information
```

### **2. Follow the Data Flows (Arrows)**

```
CUSTOMER ──Login Request──► ◯ AUTHENTICATE ──User Data──► ║D1: USERS║
                           USER
         ◄─Auth Status────
```

### **3. Understand Processes (Circles)**

```
           ◯  1.0
     AUTHENTICATE
         USER
      (Process)

• This TRANSFORMS data
• Takes "Login Request" and produces "Auth Status"
• Always has a VERB (action word)
• Numbered for reference (1.0, 2.0, etc.)
```

### **4. Identify Data Stores (Open Boxes)**

```
    ┌═════════════┐
    ║             ║
    ║ D1: USERS   ║
    ║             ║
    ║ (Data Store)║
    └═════════════┘

• This STORES data
• Data "at rest" (in database, files, etc.)
• Should match your ERD tables
• Numbered with "D" prefix (D1, D2, etc.)
```

## Complete Visual Example - Level 0 Context Diagram

```
                    LEVEL 0: CONTEXT DIAGRAM
                 (The "Big Picture" - One Process)

┌─────────────┐                                           ┌─────────────┐
│             │         Order Request                     │             │
│  CUSTOMER   │──────────────────────────────────────────►│    ADMIN    │
│             │                                           │             │
│ • Browse    │◄──────────────────────────────────────────│ • Manage    │
│ • Shop      │         Product Catalog                   │ • Monitor   │
│ • Order     │                                           │ • Reports   │
│             │                                           │             │
└─────────────┘                                           └─────────────┘
       │ ▲                                                       │ ▲
       │ │                                                       │ │
       │ │ Order                                   Admin         │ │
       │ │ Confirmation                           Commands       │ │
       │ │                                                       │ │
       ▼ │              ┌─────────────────────────────┐         │ ▼
    Order               │                             │    Management
   Request              │     ◯  DAFFODIL            │    Reports
       │                │   FLOWER SHOP               │         │
       │                │     SYSTEM                  │         │
       │                │                             │         │
       │                │ • Process Orders            │         │
       │                │ • Manage Inventory          │         │
       │                │ • Handle Payments           │         │
       │                │ • Track Users               │         │
       │                └─────────────────────────────┘         │
       │                              │ ▲                       │
       │                              │ │                       │
       │ Payment                      │ │ Payment               │
       │ Request                      │ │ Confirmation          │
       └─────────────────────────────►│ │◄──────────────────────┘
                                      │ │
                                      ▼ │
                              ┌─────────────┐
                              │             │
                              │   STRIPE    │
                              │  PAYMENT    │
                              │  GATEWAY    │
                              │             │
                              └─────────────┘
```

## How to Read This Diagram:

1. **CUSTOMER** (box) sends **Order Request** (arrow) to **DAFFODIL SYSTEM** (circle)
2. **DAFFODIL SYSTEM** (circle) sends **Product Catalog** (arrow) back to **CUSTOMER** (box)
3. **ADMIN** (box) sends **Admin Commands** (arrow) to **DAFFODIL SYSTEM** (circle)
4. **DAFFODIL SYSTEM** (circle) sends **Payment Request** (arrow) to **STRIPE** (box)
5. **STRIPE** (box) sends **Payment Confirmation** (arrow) back to **DAFFODIL SYSTEM** (circle)

## Key Rules to Remember:

✅ **Circles = Processes** (DO something - always a verb)
✅ **Boxes = External Entities** (sources/destinations outside your system)
✅ **Open Boxes = Data Stores** (where data is stored)
✅ **Arrows = Data Flows** (always labeled with what data is moving)
✅ **Data flows between**: Process ↔ External Entity, Process ↔ Data Store
✅ **Data NEVER flows directly**: External Entity ↔ Data Store (must go through a Process)
