# Daffodil Flower Shop — Expo Mobile App 🌸

A cross-platform mobile application built with **React Native**, **Expo Router**, and **TypeScript**, enabling users to browse, customize, and purchase handcrafted flower arrangements.

---

## 📱 Features

- **🌸 Explore & Shop**:
  - Live seasonal flowers, bestsellers, and occasion bouquets.
  - Search and filter by flower name, category, or color.
  - Same-day delivery banner and florist trust guarantees.
- **💐 Flower Catalog**:
  - Full product browsing with sorting (popularity, price low-to-high, price high-to-low).
  - Quick filter chips for Seasonal, Bouquets, Roses, Luxury, Plants, and Sympathy flowers.
- **✨ Product Details Screen**:
  - High-definition floral image showcase and gallery thumbnails.
  - Live stock indicators & flower care longevity guide.
  - Complimentary handwritten card message input.
  - Quantity counter with instant "Add to Cart" and "Buy Now".
- **🛒 Shopping Cart & Discounts**:
  - Item quantities, subtotal calculations, and free delivery progress tracker.
  - Coupon voucher engine (supports `DAFFODIL10`, `BLOOM15`, `SPRINGFREESHIP`).
- **💳 Multi-Method Checkout**:
  - Recipient information and complete delivery address.
  - Delivery time slot selection (Same-day Express, Tomorrow Morning, or specific dates).
  - Payment methods: **Cash on Delivery (COD)**, **GCash / Maya**, **Credit/Debit Card**, and **PayPal**.
- **📦 Real-Time Order Tracking**:
  - Visual 4-step progress stepper: *Placed → Crafting Bouquet → Out for Delivery → Arrived*.
  - View order receipts and items.
- **👤 Customer Account & Wishlist**:
  - Supabase authentication (Sign in / Sign up) and Guest Mode.
  - Saved flower arrangements in Wishlist.
  - Store studio contact details (Hotline, email, address).

---

## 🚀 Running the App

Navigate to the `mobile` folder:

```bash
cd mobile
npm start
```

Or from the project root:

```bash
npm run mobile
```

### Options:
- **Scan QR code** using the **Expo Go** app on your iOS (Camera app) or Android device.
- Press `a` in the terminal to launch the **Android Emulator**.
- Press `i` in the terminal to launch the **iOS Simulator** (macOS required).
- Press `w` in the terminal (or run `npm run mobile:web`) to test in your web browser.

---

## 🗄️ Backend Integration

- Connected to **Supabase** database tables (`products`, `orders`, and auth).
- Fully equipped with an offline fallback floral catalog and persistent `AsyncStorage` cache so users never encounter broken states.
