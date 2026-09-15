# TECHNOLOGICAL INSTITUTE OF THE PHILIPPINES
### QUEZON CITY
**IT 010 – Systems Integration and Architecture 2**  
**Progress Report**

---

* **Group No.:** 76
* **Date:** August 20, 2026
* **Member 1:** De Belen, Kian Sherwin R.
* **Member 2:** San Jose, Julius C.
* **Course/Section:** IT41S2
* **Instructor:** Ms. Jasmin Caliwag
* **Project Title:** “Daffodil & Co: A Web-Based E-Commerce Platform for Enhancing Online Flower Retail and Improving Customer Experience”

---

### Objectives:
1. To develop a modern, responsive, and user-friendly web-based e-commerce platform for Daffodil & Co. flower retail.
2. To implement a complete and interactive **Product Catalog Module** allowing customers to browse floral arrangements, filter by flower types/occasions, and view detailed descriptions and prices.
3. To build an **Interactive Bouquet Customizer & Ordering System** with real-time visual preview, add-to-cart, occasion date selection, and secure checkout.
4. To create a secure **Admin Management Module** for monitoring real-time inventory, handling floral order fulfillment, updating store CMS content, and protecting customer data.

---

### Current Progress per Module/Transaction: (Functions)

| Module / Transaction | Description | Status (Not Started / In Progress / Completed) | Remarks |
| :--- | :--- | :--- | :--- |
| **1. User Authentication & Role-Based Access (RBAC)** | Customer signup/login, session handling, user profiles, guest authentication gates, and secure admin route protection via Supabase Auth. | **Completed** | Customer and Admin role separation is fully functional. Guest protection ensures unauthenticated visitors cannot add to cart or buy without logging in or registering first. |
| **2. Floral Product Catalog & Showcase** | Categorized flower listings (Roses, Tulips, Sunflowers, Dried Flowers, etc.), search bar, category filters, and product details modal. | **Completed** | Dynamic catalog fetching from database with product image carousels, quick-view modal, and stock badges. |
| **3. Interactive Bouquet Customizer** | 2D/3D visual preview builder allowing customers to customize flower combinations, wrapper colors, ribbons, and greeting cards. | **Completed** | Powered by Zustand `useCustomizerStore` with real-time price calculations, live mobile preview, and auth-protected instant add-to-cart integration. |
| **4. Customer Wishlist System** | Allows customers to save their favorite floral arrangements for later purchase. | **Completed** | Centralized Zustand `useWishlistStore` with persistent `localStorage` synchronization across desktop and mobile, protected by guest sign-in prompts. |
| **5. Shopping Cart & State Management (Zustand)** | Interactive cart modal, persistent state across sessions, selective reactive subscriptions, and subtotal/delivery calculation. | **Completed** | High-performance Zustand store (`useCartStore`) powers entire site and mobile app with zero re-render overhead; checkout button enforces authentication. |
| **6. Mobile-First Experience & App Dock** | Native-feeling mobile navigation dock (`Home`, `Shop`, `Customize`, `Wishlist`, `Cart`), mobile category pills, accordion checkout summary, and swipe-friendly floral cards. | **Completed** | Integrated frosted-glass bottom dock with live item badge counters and mobile-tailored layouts. |
| **7. Checkout & Payment Gateway Integration** | Multi-channel checkout with delivery date/time picker, recipient details, Cash on Delivery, and Stripe/PayPal integration. | **Completed** | Guest checkout prevention with dedicated auth gate card, mobile accordion order summary, delivery date scheduler, and payment checkout pipelines functional. |
| **8. Customer Order Tracking & History** | Real-time tracking interface for order status (*Order Placed*, *Arranging Flowers*, *Out for Delivery*, *Delivered*). | **Completed** | Dedicated public tracking portal (`/order/track`) with interactive delivery stepper, profile order history (`/profile/orders`), and individual order tracking view (`/profile/orders/[id]`) with resilient RLS bypass. |
| **9. Admin Floral Inventory & Product Management** | Admin CRUD system to add new floral arrangements, update stems/supplies inventory, adjust prices, and toggle availability. | **Completed** | Fully functional admin tables with image upload and stock replenishment alerts. |
| **10. Admin Order Fulfillment & Status Manager** | Dashboard for flower shop staff to view incoming orders, delivery addresses, card messages, and update order stages. | **In Progress** | Order listing table with filter by status is functional; adding delivery receipt printing. |
| **11. Admin Content Management System (CMS)** | Management interface for updating homepage hero banners, promotional announcements, and shop policies dynamically. | **In Progress** | API endpoints for CMS pages and banner sliders are set up; linking live UI rendering. |
| **12. Customer Reviews & Ratings Module** | Allows verified buyers to submit feedback, star ratings, and photo reviews for bouquets. | **In Progress** | Database schema created; review submission modal is currently integrated into product details modal and product pages. |
| **13. Admin Analytics & Sales Reporting** | Visual dashboard (using Recharts) for revenue analytics, best-selling bouquets, and peak occasion sales (e.g., Valentine’s/Mother's Day). | **In Progress** | UI charts drafted; writing SQL aggregation queries for revenue reporting. |
| **14. Notification System (Email Invoices)** | Automated email dispatch (via Nodemailer) sending order confirmation receipts and delivery notifications to customers. | **In Progress** | HTML email templates designed; integrating checkout completion trigger. |

---

### Ongoing and Upcoming Tasks: (Scope & Progress)

#### Ongoing:
* Finalizing the **Stripe & PayPal payment gateway sandbox integration** in the checkout pipeline.
* Polishing the **Interactive Bouquet Customizer** to ensure smooth live updates of wrapper and flower choices before adding to cart.
* Connecting the **Admin CMS module** to the live homepage banner and announcement section.
* Testing automated email notifications (Nodemailer) for order confirmations and status changes.

#### Upcoming:
* Complete end-to-end integration testing (from custom bouquet creation $\rightarrow$ checkout $\rightarrow$ admin fulfillment).
* Complete the **Admin Analytics & Sales Report module** with exportable CSV/PDF reports for inventory and sales.
* Conduct **User Acceptance Testing (UAT)** and test cross-device responsiveness (mobile, tablet, desktop).
* Final cloud deployment, domain setup, database indexing, and oral presentation preparation.

---

### Challenges Encountered: (Limitations)

1. **Custom Bouquet Calculation & State Complexity:** Handling multi-variable custom bouquet selections (flower counts, wrapping paper, ribbon styles, and greeting cards) and accurately calculating dynamic pricing into the cart payload.
2. **Delivery Date & Perishable Inventory Scheduling:** Managing specific delivery date/time slot selection during checkout to ensure floral arrangements are scheduled according to fresh flower availability.
3. **Payment Gateway Webhook Handling:** Debugging asynchronous payment confirmation callbacks in local and sandbox environments to guarantee orders are only confirmed upon successful payment capture.
4. **Time & Scope Constraints:** Balancing backend security (Row Level Security, role verification) and complex e-commerce features within the tight academic schedule.

---

### Next Steps and Timeline: (Project Checklist)

| TASK COMPLETE | PRIORITY | STATUS | TASK / DELIVERABLE | ASSIGNED TO | DUE DATE |
| :---: | :---: | :---: | :--- | :--- | :---: |
| **PHASE 1: Core Architecture & Product Modules** | | | | | |
| **Yes** | High | Complete | Database Schema Architecture & Supabase Setup | Julius San Jose | Aug 05, 2026 |
| **Yes** | High | Complete | User Authentication & Role-Based Access Control (RBAC) | Kian Sherwin De Belen | Aug 10, 2026 |
| **Yes** | High | Complete | Floral Product Catalog & Dynamic Category Filtering | Julius San Jose | Aug 14, 2026 |
| **Yes** | High | Complete | Global Zustand State Management (Cart, Wishlist, UI, Customizer) | Kian Sherwin De Belen | Aug 18, 2026 |
| **Yes** | High | Complete | Admin Inventory & Product CRUD Module | Julius San Jose | Aug 20, 2026 |
| **PHASE 2: Ordering, Customizer, Mobile App & Deployment** | | | | | |
| **Yes** | High | Complete | Mobile-First App Navigation Dock, Chips, & Mobile Drawer | Julius San Jose | Aug 22, 2026 |
| **Yes** | High | Complete | Interactive Bouquet Customizer Finalization (Zustand) | Kian Sherwin De Belen | Aug 24, 2026 |
| **Yes** | High | Complete | Customer Order Tracking Portal & Profile History Tracker | Julius San Jose | Aug 26, 2026 |
| **No** | High | In Progress | Checkout Flow & Payment Gateway Integration (Stripe/PayPal) | Julius San Jose | Aug 27, 2026 |
| **No** | High | In Progress | Admin Order Fulfillment & Status Tracker | Kian Sherwin De Belen | Aug 28, 2026 |
| **No** | Medium | In Progress | Admin CMS & Homepage Banner Synchronization | Julius San Jose | Aug 30, 2026 |
| **No** | Medium | In Progress | Automated Email Invoice Dispatch (Nodemailer) | Kian Sherwin De Belen | Sep 01, 2026 |
| **No** | Medium | Not Started | Admin Analytics Dashboard & Sales Reports (Recharts) | Julius San Jose | Sep 03, 2026 |
| **No** | High | Not Started | Comprehensive End-to-End System Testing & UAT | Both Members | Sep 06, 2026 |
| **No** | High | Not Started | Final Production Deployment & Documentation | Both Members | Sep 08, 2026 |

---

### Remarks / Comments:
* Both members are actively collaborating in daily development sprints. With the project deadline closing in, priority is placed on finalizing the checkout flow, bouquet customizer, and admin order fulfillment pipeline to ensure a complete, seamless, and presentation-ready system.
