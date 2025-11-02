"use client";

import Link from "next/link";
import "./Footer.scss";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <div className="footer-brand">
            <div className="brand-line-1">DAFFODIL & CO</div>
            <div className="brand-line-2">DAFFODIL</div>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h4>Shop</h4>
            <ul>
              <li>
                <Link href="/shop">All Products</Link>
              </li>
              <li>
                <Link href="/shop?category=bouquets">Bouquets</Link>
              </li>
              <li>
                <Link href="/shop?category=wedding">Wedding Flowers</Link>
              </li>
              <li>
                <Link href="/shop?category=gifts">Gift Collections</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/customize">Custom Orders</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Account</h4>
            <ul>
              <li>
                <Link href="/profile">My Profile</Link>
              </li>
              <li>
                <Link href="/profile/orders">Order History</Link>
              </li>
              <li>
                <Link href="/wishlist">Wishlist</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          <p>&copy; 2024 Daffodil. All rights reserved.</p>
          <p>Crafting floral poetry since 2024</p>
        </div>
      </div>
    </footer>
  );
}
