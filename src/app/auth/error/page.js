"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "Default":
      default:
        return "An error occurred during authentication.";
    }
  };

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-rothek)" }}>Authentication Error</h1>
      <p style={{ maxWidth: 520, textAlign: "center" }}>
        {getErrorMessage(error)}
      </p>
      <Link
        href="/login"
        style={{
          textDecoration: "none",
          color: "var(--color-primary)",
          fontWeight: "bold",
        }}
      >
        Go back to Login
      </Link>
    </>
  );
}

export default function AuthError() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <Suspense fallback={<div />}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
