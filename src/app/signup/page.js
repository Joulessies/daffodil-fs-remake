"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Home } from "lucide-react";
import { useSession, signIn } from "@auth/nextjs/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (session) {
      router.push("/");
    }

    // Check for error from URL params
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError("Registration failed. Please try again.");
    }
  }, [session, router, searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email signup not implemented yet:", formData);
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        setError("Google registration failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("github", {
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        setError("GitHub registration failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return null; // Will redirect
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "white !important",
      }}
    >
      {/* Home Icon */}
      <a
        href="/"
        style={{
          position: "absolute",
          top: 30,
          left: 30,
          color: "#333",
          zIndex: 2,
        }}
      >
        <Home size={28} />
      </a>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "40px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Image
            src="/images/logo.svg"
            alt="Daffodil"
            width={200}
            height={125}
            style={{ marginBottom: "20px" }}
            priority
          />
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              margin: "0 0 8px 0",
              color: "#333",
              fontFamily: "var(--font-rothek)",
            }}
          >
            Create your account
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              margin: "0",
            }}
          >
            Join Daffodil & Co. today
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              padding: "12px",
              marginBottom: "20px",
              color: "#dc2626",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Create a password"
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Confirm password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Create account
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "20px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "#e5e7eb",
            }}
          />
          <span
            style={{
              padding: "0 16px",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            Or continue with
          </span>
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "#e5e7eb",
            }}
          />
        </div>

        {/* Social Signup Buttons */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              backgroundColor: "white",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <Image
              src="/images/google.png"
              alt="Google"
              width={20}
              height={20}
              style={{ marginRight: "8px" }}
            />
            {isLoading ? "Loading..." : "Google"}
          </button>
          <button
            onClick={handleGitHubSignup}
            disabled={isLoading}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              backgroundColor: "white",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <Image
              src="/images/github.png"
              alt="GitHub"
              width={20}
              height={20}
              style={{ marginRight: "8px" }}
            />
            {isLoading ? "Loading..." : "GitHub"}
          </button>
        </div>

        {/* Sign In Link */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: "0",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
