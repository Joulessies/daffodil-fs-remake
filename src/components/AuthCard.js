"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { isAdminEmail } from "../lib/admin";
import { useAuth } from "./AuthProvider";
import { AlertCircle, Eye, EyeOff, LogOut } from "lucide-react";

export default function AuthCard({ mode = "login" }) {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState(
    mode === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    fullName: "",
  });

  useEffect(() => {
    setActiveMode(mode === "signup" ? "signup" : "login");
  }, [mode]);

  const isSignup = activeMode === "signup";
  const isLoggedIn = !!user;
  const adminDetected = isAdminEmail((email || "").trim());

  const currentUserDisplay = useMemo(() => {
    const name =
      user?.user_metadata?.full_name || user?.user_metadata?.name || "";
    const emailAddr = user?.email || "";
    return name ? `${name} (${emailAddr})` : emailAddr;
  }, [user]);

  function validateFields() {
    const errors = {
      email: "",
      password: "",
      passwordConfirm: "",
      fullName: "",
    };
    const trimmedEmail = (email || "").trim();
    if (!trimmedEmail) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      errors.email = "Enter a valid email";

    if (isSignup) {
      if (!fullName.trim()) errors.fullName = "Full name is required";
      if (!password) errors.password = "Password is required";
      else if (password.length < 6) errors.password = "Minimum 6 characters";
      if (!passwordConfirm) errors.passwordConfirm = "Confirm your password";
      else if (passwordConfirm !== password)
        errors.passwordConfirm = "Passwords do not match";

      if (trimmedEmail.toLowerCase() === "john.doe@example.com") {
        errors.email = "An account with this email already exists.";
      }
    } else {
      if (!password) errors.password = "Password is required";
    }
    setFieldErrors(errors);
    return errors;
  }

  const hasErrors = (errs) => Object.values(errs).some((m) => !!m);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!supabase) {
      setFormError("Auth is not configured. Please try again later.");
      return;
    }
    if (isLoggedIn) {
      setFormError("You're already signed in. Please sign out to continue.");
      return;
    }
    const errs = validateFields();
    if (hasErrors(errs)) return;

    try {
      setIsSubmitting(true);
      const trimmedEmail = (email || "").trim();
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          const msg = /already/i.test(error.message)
            ? "An account with this email already exists."
            : error.message;
          setFormError(msg);
        } else {
          alert("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) setFormError(error.message);
      }
    } finally {
      setIsSubmitting(false);
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
        {isLoggedIn && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginBottom: 12,
              padding: "12px 14px",
              borderRadius: 8,
              background: "#ecfeff",
              border: "1px solid #a5f3fc",
              color: "#155e75",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertCircle size={18} />
            <div style={{ fontSize: 13 }}>
              You are already signed in as <strong>{currentUserDisplay}</strong>
              . Forms are disabled. Use Sign Out or Switch User to continue.
            </div>
          </div>
        )}
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
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <div
            role="tablist"
            aria-label="Auth mode"
            style={{
              display: "flex",
              gap: 6,
              background: "#f3f4f6",
              borderRadius: 10,
              padding: 4,
            }}
          >
            {[
              { key: "login", label: "Login" },
              { key: "signup", label: "Register" },
            ].map((tab) => {
              const selected = activeMode === tab.key;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveMode(tab.key)}
                  disabled={isLoggedIn}
                  style={{
                    border: "none",
                    background: selected ? "#fff" : "transparent",
                    color: "#111827",
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: isLoggedIn ? "not-allowed" : "pointer",
                    boxShadow: selected ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    fontWeight: 600,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          {!!formError && (
            <div
              role="alert"
              style={{
                marginBottom: 10,
                padding: "10px 12px",
                borderRadius: 8,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={18} />
              <span style={{ fontSize: 13 }}>{formError}</span>
            </div>
          )}

          {isSignup && (
            <div style={{ marginBottom: 10 }}>
              <label
                htmlFor="fullName"
                style={{
                  display: "block",
                  fontSize: 14,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Full name*
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName)
                    setFieldErrors({ ...fieldErrors, fullName: "" });
                }}
                placeholder="e.g. John Doe"
                aria-invalid={!!fieldErrors.fullName}
                aria-describedby={
                  fieldErrors.fullName ? "fullName-error" : undefined
                }
                disabled={isLoggedIn || isSubmitting}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${
                    fieldErrors.fullName ? "#ef4444" : "#d1d5db"
                  }`,
                  borderRadius: 8,
                  outline: "none",
                }}
              />
              {fieldErrors.fullName && (
                <div
                  id="fullName-error"
                  style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}
                >
                  {fieldErrors.fullName}
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: 10 }}>
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email)
                  setFieldErrors({ ...fieldErrors, email: "" });
              }}
              placeholder="you@example.com"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              disabled={isLoggedIn || isSubmitting}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${
                  fieldErrors.email ? "#ef4444" : "#d1d5db"
                }`,
                borderRadius: 8,
                outline: "none",
              }}
              required
            />
            {fieldErrors.email && (
              <div
                id="email-error"
                style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}
              >
                {fieldErrors.email}
              </div>
            )}
            {adminDetected && !fieldErrors.email && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#065f46" }}>
                Admin email detected. You will have admin access after login.
              </div>
            )}
          </div>

          <div style={{ marginBottom: 10 }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: 14,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Password*
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password)
                    setFieldErrors({ ...fieldErrors, password: "" });
                }}
                placeholder={isSignup ? "Create a password" : "Your password"}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
                disabled={isLoggedIn || isSubmitting}
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 12px",
                  border: `1px solid ${
                    fieldErrors.password ? "#ef4444" : "#d1d5db"
                  }`,
                  borderRadius: 8,
                  outline: "none",
                }}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoggedIn || isSubmitting}
                style={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  border: "none",
                  background: "transparent",
                  cursor:
                    isLoggedIn || isSubmitting ? "not-allowed" : "pointer",
                  padding: 4,
                  color: "#6b7280",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <div
                id="password-error"
                style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}
              >
                {fieldErrors.password}
              </div>
            )}
          </div>

          {isSignup && (
            <div style={{ marginBottom: 10 }}>
              <label
                htmlFor="passwordConfirm"
                style={{
                  display: "block",
                  fontSize: 14,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Confirm password*
              </label>
              <input
                id="passwordConfirm"
                type={showPassword ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  if (fieldErrors.passwordConfirm)
                    setFieldErrors({ ...fieldErrors, passwordConfirm: "" });
                }}
                placeholder="Re-enter your password"
                aria-invalid={!!fieldErrors.passwordConfirm}
                aria-describedby={
                  fieldErrors.passwordConfirm
                    ? "passwordConfirm-error"
                    : undefined
                }
                disabled={isLoggedIn || isSubmitting}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${
                    fieldErrors.passwordConfirm ? "#ef4444" : "#d1d5db"
                  }`,
                  borderRadius: 8,
                  outline: "none",
                }}
                required
              />
              {fieldErrors.passwordConfirm && (
                <div
                  id="passwordConfirm-error"
                  style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}
                >
                  {fieldErrors.passwordConfirm}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggedIn || isSubmitting}
            style={{
              marginTop: 6,
              width: "100%",
              background: isLoggedIn ? "#9ca3af" : "#3b5bfd",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 16px",
              fontWeight: 600,
              cursor: isLoggedIn ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.9 : 1,
              transition: "background 150ms ease, opacity 150ms ease",
            }}
          >
            {isSubmitting
              ? isSignup
                ? "Creating account..."
                : "Signing in..."
              : isSignup
              ? "Create account"
              : "Sign in"}
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
              try {
                await supabase.auth.signOut({ scope: "local" });
              } catch {}
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "github",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                  flowType: "pkce",
                },
              });
              if (error) alert(error.message);
            }}
            style={buttonBaseStyle}
            disabled={isLoggedIn || isSubmitting}
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

              try {
                await supabase.auth.signOut({ scope: "local" });
              } catch {}
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                  flowType: "pkce",
                  queryParams: { prompt: "select_account" },
                },
              });
              if (error) alert(error.message);
            }}
            style={buttonBaseStyle}
            disabled={isLoggedIn || isSubmitting}
          >
            <Image
              src="/images/google.png"
              alt="Google"
              width={20}
              height={20}
            />
            <span>Continue with Google</span>
          </button>
          <button
            onClick={async () => {
              if (!supabase) {
                alert("Auth is not configured. Please try again later.");
                return;
              }

              try {
                await supabase.auth.signOut({ scope: "local" });
              } catch {}
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "azure",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                  flowType: "pkce",
                  scopes: "openid profile email offline_access",
                  queryParams: { prompt: "select_account" },
                },
              });
              if (error) alert(error.message);
            }}
            style={buttonBaseStyle}
            disabled={isLoggedIn || isSubmitting}
          >
            <Image
              src="/images/microsoft-logo.png"
              alt="Microsoft"
              width={24}
              height={24}
            />
            <span>Continue with Microsoft</span>
          </button>
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Admin access is granted to specific emails. If your email is
          configured as an admin, sign in normally and then open{" "}
          <strong>/admin</strong>.
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {!isSignup ? (
            <p style={{ margin: 0, fontSize: 14 }}>
              Don't have an account?{" "}
              <button
                onClick={() => setActiveMode("signup")}
                disabled={isLoggedIn}
                style={{
                  color: "#3b5bfd",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: isLoggedIn ? "not-allowed" : "pointer",
                }}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 14 }}>
              Already have an account?{" "}
              <button
                onClick={() => setActiveMode("login")}
                disabled={isLoggedIn}
                style={{
                  color: "#3b5bfd",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: isLoggedIn ? "not-allowed" : "pointer",
                }}
              >
                Log in now
              </button>
            </p>
          )}

          {isLoggedIn && (
            <button
              onClick={async () => {
                const { supabase } = await import("../lib/supabase");
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
              }}
              aria-label="Sign out"
            >
              <LogOut size={16} /> Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
