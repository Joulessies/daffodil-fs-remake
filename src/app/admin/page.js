"use client";

import { useAuth } from "@/components/AuthProvider";

export default function AdminPage() {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user || !isAdmin) {
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
    return null;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontFamily: "var(--font-rothek)", marginBottom: 12 }}>
        Admin
      </h1>
      <p>Welcome, {user.email}.</p>
      <ul style={{ marginTop: 16 }}>
        <li>Manage products (coming soon)</li>
        <li>View orders (coming soon)</li>
      </ul>
    </div>
  );
}
