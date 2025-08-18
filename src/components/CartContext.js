"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useAuthPrompt } from "./AuthPromptContext";

const CartContext = createContext({
  items: [],
  isOpen: false,
  open: () => {},
  close: () => {},
  addItem: (_item) => {},
  removeItem: (_id) => {},
  updateQuantity: (_id, _qty) => {},
  clearCart: () => {},
  total: 0,
});

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const authPrompt = useAuthPrompt();

  // Storage key is scoped per user to isolate carts between accounts (and guest)
  const storageKey = useMemo(
    () => (user?.id ? `cart:${user.id}` : "cart:guest"),
    [user?.id]
  );

  // Load cart whenever the active account changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, [storageKey]);

  // Persist current cart to the active account's storage key
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {}
  }, [items, storageKey]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 1),
        0
      ),
    [items]
  );

  const requireAuthOrRedirect = (reason) => {
    // If auth state is still loading, don't block or prompt
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
    )
      return false;
    setItems((prev) => {
      const index = prev.findIndex((p) => p.id === item.id);
      if (index !== -1) {
        const copy = [...prev];
        const prevQty = copy[index].quantity || 1;
        copy[index] = {
          ...copy[index],
          quantity: prevQty + (item.quantity || 1),
        };
        return copy;
      }
      return [{ quantity: 1, ...item }, ...prev];
    });
    return true;
  };

  const removeItem = (id) => {
    if (
      !requireAuthOrRedirect("Please log in or register to modify your cart.")
    )
      return;
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (
      !requireAuthOrRedirect("Please log in or register to modify your cart.")
    )
      return;
    const safeQty = Math.max(1, Number(quantity) || 1);
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: safeQty } : it))
    );
  };

  const clearCart = () => {
    if (
      !requireAuthOrRedirect("Please log in or register to modify your cart.")
    )
      return;
    setItems([]);
  };

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      total,
    }),
    [items, isOpen, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
