"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, Search, ShoppingBag, Heart } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function NavigationBar() {
  const { data: session, status } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px 40px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          fontWeight: "500",
        }}
      >
        <div style={{ width: "100px" }}>
          <a href="/menu" style={{ textDecoration: "none", color: "#333" }}>
            <LayoutGrid size={24} />
          </a>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            src="/images/logo.svg"
            alt="Daffodil"
            width={160}
            height={100}
            priority
          />
        </div>

        <div
          style={{
            width: "100px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "20px",
          }}
        >
          <a href="/search" style={{ textDecoration: "none", color: "#333" }}>
            <Search size={24} />
          </a>
          <a href="/wishlist" style={{ textDecoration: "none", color: "#333" }}>
            <Heart size={24} />
          </a>
          <a href="/cart" style={{ textDecoration: "none", color: "#333" }}>
            <ShoppingBag size={24} />
          </a>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1px 0",
          gap: "50px",
        }}
      >
        <a
          href="/"
          style={{
            textDecoration: "none",
            color: "#333",
            fontSize: "14px",
            fontFamily: "var(--font-rothek)",
            fontWeight: "bold",
          }}
        >
          Home
        </a>
        <a
          href="/shop"
          style={{
            textDecoration: "none",
            color: "#333",
            fontSize: "14px",
            fontFamily: "var(--font-rothek)",
            fontWeight: "bold",
          }}
        >
          Shop
        </a>
        <a
          href="/about"
          style={{
            textDecoration: "none",
            color: "#333",
            fontSize: "14px",
            fontFamily: "var(--font-rothek)",
            fontWeight: "bold",
          }}
        >
          About
        </a>
        <a
          href="/contact"
          style={{
            textDecoration: "none",
            color: "#333",
            fontSize: "14px",
            fontFamily: "var(--font-rothek)",
            fontWeight: "bold",
          }}
        >
          Contact
        </a>
        {session ? (
          <>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#333",
                fontSize: "14px",
                fontFamily: "var(--font-rothek)",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a
              href="/login"
              style={{
                textDecoration: "none",
                color: "#333",
                fontSize: "14px",
                fontFamily: "var(--font-rothek)",
                fontWeight: "bold",
              }}
            >
              Login
            </a>
            <a
              href="/signup"
              style={{
                textDecoration: "none",
                color: "#333",
                fontSize: "14px",
                fontFamily: "var(--font-rothek)",
                fontWeight: "bold",
              }}
            >
              Signup
            </a>
          </>
        )}
      </div>
    </div>
  );
}
