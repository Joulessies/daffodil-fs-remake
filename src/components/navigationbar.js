"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, Search, ShoppingBag, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

export default function NavigationBar() {
  const { user } = useAuth();

  const handleLogout = async () => {
    const { supabase } = await import("../lib/supabase");
    await supabase.auth.signOut();
    window.location.href = "/";
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "8px 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#fffcf2",
        borderBottom: "1px solid #e8e2d6",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          maxWidth: 1240,
          fontWeight: "500",
        }}
      >
        <div style={{ width: "100px" }}>
          <Link
            prefetch={false}
            href="/menu"
            style={{ textDecoration: "none", color: "#333" }}
          >
            <LayoutGrid size={24} />
          </Link>
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
            width={210}
            height={60}
            priority
          />
        </div>

        <div
          style={{
            width: "100px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 20,
            color: "#2B2B2B",
          }}
        >
          <Link
            prefetch={false}
            href="/search"
            style={{ textDecoration: "none", color: "#333" }}
          >
            <Search size={24} />
          </Link>
          <Link
            prefetch={false}
            href="/wishlist"
            style={{ textDecoration: "none", color: "#333" }}
          >
            <Heart size={24} />
          </Link>
          <Link
            prefetch={false}
            href="/cart"
            style={{ textDecoration: "none", color: "#333" }}
          >
            <ShoppingBag size={24} />
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "6px 0",
          gap: 48,
          width: "100%",
          maxWidth: 920,
          color: "#5B6B73",
          letterSpacing: 0.2,
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#5B6B73",
            fontSize: 14,
            fontFamily: "var(--font-rothek)",
            fontWeight: 500,
          }}
        >
          Home
        </Link>
        <Link
          prefetch={false}
          href="/shop"
          style={{
            textDecoration: "none",
            color: "#5B6B73",
            fontSize: 14,
            fontFamily: "var(--font-rothek)",
            fontWeight: 500,
          }}
        >
          Shop
        </Link>
        <Link
          prefetch={false}
          href="/about"
          style={{
            textDecoration: "none",
            color: "#5B6B73",
            fontSize: 14,
            fontFamily: "var(--font-rothek)",
            fontWeight: 500,
          }}
        >
          About
        </Link>
        <Link
          prefetch={false}
          href="/customize"
          style={{
            textDecoration: "none",
            color: "#5B6B73",
            fontSize: 14,
            fontFamily: "var(--font-rothek)",
            fontWeight: 500,
          }}
        >
          Customize
        </Link>
        {user ? (
          <>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#5B6B73",
                fontSize: 14,
                fontFamily: "var(--font-rothek)",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              style={{
                textDecoration: "none",
                color: "#5B6B73",
                fontSize: 14,
                fontFamily: "var(--font-rothek)",
                fontWeight: 500,
              }}
            >
              Login
            </Link>
            <Link
              href="/signup"
              style={{
                textDecoration: "none",
                color: "#5B6B73",
                fontSize: 14,
                fontFamily: "var(--font-rothek)",
                fontWeight: 500,
              }}
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
