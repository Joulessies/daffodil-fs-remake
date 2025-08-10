"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function AuthCard({ mode = "login" }) {
  const [email, setEmail] = useState("");

  const isSignup = mode === "signup";

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!supabase) {
      alert("Auth is not configured. Please try again later.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the magic link.");
    }
  };

  const buttonBaseStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
    justifyContent: "flex-start",
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          width: 420,
          maxWidth: "100%",
          background: "#fff",
          border: "1px solid #f0f0f0",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          borderRadius: 12,
          padding: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Image
            src="/images/logo.svg"
            alt="Daffodil"
            width={200}
            height={200}
          />
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-rothek)",
              fontSize: 28,
            }}
          >
            Welcome
          </h2>
          <p style={{ margin: 0, color: "#6b7280", textAlign: "center" }}>
            {isSignup
              ? "Create your account to continue."
              : "Log in to continue."}
          </p>
        </div>

        <form onSubmit={handleContinue} style={{ marginTop: 24 }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: 14,
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Email address*
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              outline: "none",
            }}
            required
          />
          <button
            type="submit"
            style={{
              marginTop: 12,
              width: "100%",
              background: "#3b5bfd",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Continue
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 18,
            color: "#9ca3af",
          }}
        >
          <div style={{ height: 1, background: "#e5e7eb", flex: 1 }} />
          <span style={{ fontSize: 12 }}>OR</span>
          <div style={{ height: 1, background: "#e5e7eb", flex: 1 }} />
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <button
            onClick={async () => {
              if (!supabase) {
                alert("Auth is not configured. Please try again later.");
                return;
              }
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "github",
                options: {
                  redirectTo: `${window.location.origin}/`,
                  flowType: "pkce",
                },
              });
              if (error) alert(error.message);
            }}
            style={buttonBaseStyle}
          >
            <Image
              src="/images/github.png"
              alt="GitHub"
              width={20}
              height={20}
            />
            <span>Continue with GitHub</span>
          </button>
          <button
            onClick={async () => {
              if (!supabase) {
                alert("Auth is not configured. Please try again later.");
                return;
              }
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/`,
                  flowType: "pkce",
                },
              });
              if (error) alert(error.message);
            }}
            style={buttonBaseStyle}
          >
            <Image
              src="/images/google.png"
              alt="Google"
              width={20}
              height={20}
            />
            <span>Continue with Google</span>
          </button>
        </div>

        {!isSignup && (
          <p style={{ marginTop: 16, fontSize: 14, textAlign: "center" }}>
            Don't have an account?{" "}
            <Link
              href="/signup"
              style={{
                color: "#3b5bfd",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign up
            </Link>
          </p>
        )}
        {isSignup && (
          <p style={{ marginTop: 16, fontSize: 14, textAlign: "center" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "#3b5bfd",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Log in now
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
