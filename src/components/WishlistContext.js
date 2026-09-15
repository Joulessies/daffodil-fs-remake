"use client";

import { createContext, useContext, useMemo } from "react";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useAuth } from "./AuthProvider";
import { useAuthPrompt } from "./AuthPromptContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const store = useWishlistStore();
  const { user, isLoading } = useAuth();
  const authPrompt = useAuthPrompt();

  const requireAuthOrRedirect = (reason) => {
    if (isLoading) return true;
    if (!user) {
      authPrompt.open(reason || "Please log in or register first to continue.");
      return false;
    }
    return true;
  };

  const add = (item) => {
    if (!requireAuthOrRedirect("Please log in or register to save favorites.")) {
      return;
    }
    store.add(item);
  };

  const remove = (id) => {
    if (
      !requireAuthOrRedirect("Please log in or register to modify favorites.")
    ) {
      return;
    }
    store.remove(id);
  };

  const toggle = (item) => {
    if (
      !requireAuthOrRedirect("Please log in or register to modify favorites.")
    ) {
      return;
    }
    store.toggle(item);
  };

  const clear = () => {
    if (
      !requireAuthOrRedirect("Please log in or register to modify favorites.")
    ) {
      return;
    }
    store.clear();
  };

  const value = useMemo(
    () => ({
      items: store.items,
      add,
      remove,
      toggle,
      contains: store.contains,
      clear,
    }),
    [store.items]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (ctx) return ctx;

  const store = useWishlistStore();
  return {
    items: store.items,
    add: store.add,
    remove: store.remove,
    toggle: store.toggle,
    contains: store.contains,
    clear: store.clear,
  };
}

export { useWishlistStore };
