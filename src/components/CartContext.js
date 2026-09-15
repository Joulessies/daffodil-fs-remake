"use client";

import { createContext, useContext, useMemo } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuth } from "./AuthProvider";
import { useAuthPrompt } from "./AuthPromptContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const store = useCartStore();
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

  const addItem = (item) => {
    if (
      !requireAuthOrRedirect(
        "Please log in or register to add items to your cart."
      )
    ) {
      return false;
    }
    return store.addItem(item);
  };

  const removeItem = (id) => {
    if (
      !requireAuthOrRedirect("Please log in or register to modify your cart.")
    ) {
      return;
    }
    store.removeItem(id);
  };

  const updateQuantity = (id, quantity) => {
    if (
      !requireAuthOrRedirect("Please log in or register to modify your cart.")
    ) {
      return;
    }
    store.updateQuantity(id, quantity);
  };

  const clearCart = () => {
    if (
      !requireAuthOrRedirect("Please log in or register to modify your cart.")
    ) {
      return;
    }
    store.clearCart();
  };

  const total = store.getTotal();

  const value = useMemo(
    () => ({
      items: store.items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isOpen: store.isOpen,
      open: store.open,
      close: store.close,
      total,
    }),
    [store.items, store.isOpen, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx) return ctx;

  // Fallback to Zustand store directly if accessed outside CartProvider
  const store = useCartStore();
  return {
    items: store.items,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    isOpen: store.isOpen,
    open: store.open,
    close: store.close,
    total: store.getTotal(),
  };
}

export { useCartStore };
