"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useAuthPrompt } from "./AuthPromptContext";

const WishlistContext = createContext({
  items: [],
  add: (_item) => {},
  remove: (_id) => {},
  toggle: (_item) => {},
  contains: (_id) => false,
  clear: () => {},
});

function normalizeItem(raw) {
  const title = String(raw?.title || "").trim();
  const slug = (raw?.id || title || Math.random().toString(36).slice(2))
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return {
    id: slug,
    title,
    image: raw?.image || null,
    price: Number(raw?.price) || null,
  };
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const { user, isLoading } = useAuth();
  const authPrompt = useAuthPrompt();

  // Storage key is scoped per user to isolate favorites between accounts (and guest)
  const storageKey = useMemo(
    () => (user?.id ? `wishlist:${user.id}` : "wishlist:guest"),
    [user?.id]
  );

  // Load when account changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, [storageKey]);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {}
  }, [items, storageKey]);

  const contains = (id) => items.some((it) => it.id === id);

  const requireAuthOrRedirect = (reason) => {
    if (isLoading) return true;
    if (!user) {
      authPrompt.open(reason || "Please log in or register first to continue.");
      return false;
    }
    return true;
  };

  const add = (item) => {
    if (!requireAuthOrRedirect("Please log in or register to save favorites."))
      return;
    const normalized = normalizeItem(item);
    setItems((prev) =>
      contains(normalized.id) ? prev : [normalized, ...prev]
    );
  };

  const remove = (id) => {
    if (
      !requireAuthOrRedirect("Please log in or register to modify favorites.")
    )
      return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const toggle = (item) => {
    if (
      !requireAuthOrRedirect("Please log in or register to modify favorites.")
    )
      return;
    const normalized = normalizeItem(item);
    setItems((prev) => {
      const exists = prev.some((it) => it.id === normalized.id);
      return exists
        ? prev.filter((it) => it.id !== normalized.id)
        : [normalized, ...prev];
    });
  };

  const clear = () => {
    if (
      !requireAuthOrRedirect("Please log in or register to modify favorites.")
    )
      return;
    setItems([]);
  };

  const value = useMemo(
    () => ({ items, add, remove, toggle, contains, clear }),
    [items]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
