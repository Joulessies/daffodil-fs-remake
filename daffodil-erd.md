# Daffodil Flower Shop - Entity Relationship Diagram

## Visual ERD Representation

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           DAFFODIL FLOWER SHOP DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐    1:1     ┌─────────────────────────┐
│   SUPABASE_AUTH_USERS   │◄──────────►│         USERS           │
├─────────────────────────┤            ├─────────────────────────┤
│ 🔑 id (UUID) PK         │            │ 🔑 id (UUID) PK         │
│ 🔒 email (String) UK    │            │ 🔒 email (String) UK    │
│    encrypted_password   │            │    is_admin (Boolean)   │
│    email_confirmed_at   │            │    suspended (Boolean)  │
│    last_sign_in_at      │            │    created_at           │
│    raw_app_meta_data    │            │    updated_at           │
│    raw_user_meta_data   │            │                         │
│    banned (Boolean)     │            │                         │
│    created_at           │            │                         │
│    updated_at           │            │                         │
└─────────────────────────┘            └─────────────────────────┘
                                                    │
                                                    │ 1:M
                                                    ▼
┌─────────────────────────┐                    ┌─────────────────────────┐
│       PRODUCTS          │                    │        ORDERS           │
├─────────────────────────┤                    ├─────────────────────────┤
│ 🔑 id (String) PK       │                    │ 🔑 id (UUID) PK         │
│    title (String)       │                    │ 🔒 order_number (String)│
│    description (Text)   │                    │ 🔗 user_id (UUID) FK    │
│    price (Decimal)      │                    │    customer_email       │
│    category (String)    │                    │    total (Decimal)      │
│    status (String)      │                    │    status (String)      │
│    stock (Integer)      │                    │    tracking_url         │
│    images (JSON)        │                    │    items (JSON)         │
│    specifications (JSON)│                    │    shipping_address     │
│    features (JSON)      │                    │    billing_address      │
│    benefits (JSON)      │                    │    payment_method       │
│    created_at           │                    │    payment_status       │
│    updated_at           │                    │    created_at           │
└─────────────────────────┘                    │    updated_at           │
                                               └─────────────────────────┘
                                                           │
                                                           │ 1:M (JSON)
                                                           ▼
                                               ┌─────────────────────────┐
                                               │     ORDER_ITEMS         │
                                               │    (JSON Embedded)      │
                                               ├─────────────────────────┤
                                               │    title (String)       │
                                               │    quantity (Integer)   │
                                               │    price (Decimal)      │
                                               │    image (String)       │
                                               │    description (String) │
                                               │    flowerType (String)  │
                                               │    id (String)          │
                                               └─────────────────────────┘

┌─────────────────────────┐
│     ADMIN_AUDIT         │
├─────────────────────────┤
│ 🔑 id (UUID) PK         │
│ 🔗 actor_id (UUID) FK   │◄──────── 1:M ──────────┐
│    action (String)      │                        │
│    entity (String)      │                        │
│    entity_id (String)   │                        │
│    data (JSON)          │                        │
│    created_at           │                        │
└─────────────────────────┘                        │
                                                   │
                            ┌─────────────────────────┐
                            │         USERS           │
                            │    (Admin Users Only)   │
                            └─────────────────────────┘

LEGEND:
🔑 = Primary Key
🔒 = Unique Key
🔗 = Foreign Key
1:1 = One-to-One Relationship
1:M = One-to-Many Relationship
```

## Entity Details with Relationships

### **USERS Entity**

```
Table: users
┌──────────────┬──────────┬─────────────┬─────────────────────────┐
│ Column       │ Type     │ Constraint  │ Description             │
├──────────────┼──────────┼─────────────┼─────────────────────────┤
│ id           │ UUID     │ PRIMARY KEY │ User identifier         │
│ email        │ String   │ UNIQUE      │ User email address      │
│ is_admin     │ Boolean  │ DEFAULT(f)  │ Admin role flag         │
│ suspended    │ Boolean  │ DEFAULT(f)  │ Account suspension      │
│ created_at   │ Timestamp│ NOT NULL    │ Account creation time   │
│ updated_at   │ Timestamp│ NOT NULL    │ Last modification time  │
└──────────────┴──────────┴─────────────┴─────────────────────────┘

Relationships:
• 1:1 with SUPABASE_AUTH_USERS (authentication)
• 1:M with ORDERS (user can place multiple orders)
• 1:M with ADMIN_AUDIT (admin users create audit logs)
```

### **PRODUCTS Entity**

```
Table: products
┌──────────────┬──────────┬─────────────┬─────────────────────────┐
│ Column       │ Type     │ Constraint  │ Description             │
├──────────────┼──────────┼─────────────┼─────────────────────────┤
│ id           │ String   │ PRIMARY KEY │ Product slug identifier │
│ title        │ String   │ NOT NULL    │ Product name            │
│ description  │ Text     │             │ Product description     │
│ price        │ Decimal  │ DEFAULT(0)  │ Price in PHP            │
│ category     │ String   │             │ Product category        │
│ status       │ String   │ DEFAULT(act)│ active/inactive/disc.   │
│ stock        │ Integer  │ DEFAULT(0)  │ Available quantity      │
│ images       │ JSON     │             │ Array of image URLs     │
│ created_at   │ Timestamp│ NOT NULL    │ Product creation time   │
│ updated_at   │ Timestamp│ NOT NULL    │ Last modification time  │
└──────────────┴──────────┴─────────────┴─────────────────────────┘

Categories: seasonal, bouquets, wedding, sympathy, gifts
Status Values: active, inactive, discontinued
```

### **ORDERS Entity**

```
Table: orders
┌──────────────────┬──────────┬─────────────┬─────────────────────────┐
│ Column           │ Type     │ Constraint  │ Description             │
├──────────────────┼──────────┼─────────────┼─────────────────────────┤
│ id               │ UUID     │ PRIMARY KEY │ Order identifier        │
│ order_number     │ String   │ UNIQUE      │ Human-readable order #  │
│ user_id          │ UUID     │ FOREIGN KEY │ → users.id (nullable)   │
│ customer_email   │ String   │ NOT NULL    │ Customer email          │
│ total            │ Decimal  │ NOT NULL    │ Total amount in PHP     │
│ status           │ String   │ DEFAULT(pen)│ Order status            │
│ tracking_url     │ String   │ NULLABLE    │ Shipping tracking URL   │
│ items            │ JSON     │ NOT NULL    │ Array of order items    │
│ created_at       │ Timestamp│ NOT NULL    │ Order creation time     │
│ updated_at       │ Timestamp│ NOT NULL    │ Last modification time  │
└──────────────────┴──────────┴─────────────┴─────────────────────────┘

Status Values: Pending, Paid, Processing, Shipped, Delivered, Cancelled
Foreign Key: user_id → users.id (NULL for guest orders)

Items JSON Structure:
[
  {
    "title": "Product Name",
    "quantity": 2,
    "price": 1299.00,
    "image": "/images/product.jpg",
    "description": "Product description",
    "id": "product-slug"
  }
]
```

### **ADMIN_AUDIT Entity**

```
Table: admin_audit
┌──────────────┬──────────┬─────────────┬─────────────────────────┐
│ Column       │ Type     │ Constraint  │ Description             │
├──────────────┼──────────┼─────────────┼─────────────────────────┤
│ id           │ UUID     │ PRIMARY KEY │ Audit log identifier    │
│ actor_id     │ UUID     │ FOREIGN KEY │ → users.id (nullable)   │
│ action       │ String   │ NOT NULL    │ Action performed        │
│ entity       │ String   │ NOT NULL    │ Entity type affected    │
│ entity_id    │ String   │             │ ID of affected entity   │
│ data         │ JSON     │             │ Action metadata         │
│ created_at   │ Timestamp│ NOT NULL    │ Action timestamp        │
└──────────────┴──────────┴─────────────┴─────────────────────────┘

Action Values: create, update, delete, import
Entity Values: user, product, order
Foreign Key: actor_id → users.id (NULL for system actions)
```

## Relationship Cardinalities

### **1:1 Relationships**

- **SUPABASE_AUTH_USERS ↔ USERS**
  - Each authentication user has exactly one application profile
  - Bidirectional relationship for authentication bridge

### **1:M Relationships**

- **USERS → ORDERS** (Optional)

  - One user can place zero to many orders
  - user_id is nullable to support guest checkout
  - Cardinality: 0..∞

- **USERS → ADMIN_AUDIT** (Optional)
  - One admin user can perform zero to many audited actions
  - Only admin users generate audit logs
  - Cardinality: 0..∞

### **Composition Relationships**

- **ORDERS ⊃ ORDER_ITEMS** (JSON Embedded)
  - Each order contains one to many line items
  - Items stored as JSON array within orders table
  - Cardinality: 1..∞

## Business Rules

1. **Authentication**: All users must authenticate through Supabase Auth
2. **Guest Checkout**: Orders can be placed without user registration (user_id = NULL)
3. **Admin Actions**: Only users with is_admin = true can perform administrative actions
4. **Product Visibility**: Only products with status = 'active' are publicly visible
5. **Order Integrity**: Orders must contain at least one item in the items JSON array
6. **Audit Trail**: All administrative actions are automatically logged
7. **Stock Management**: Product stock is decremented when orders are confirmed
