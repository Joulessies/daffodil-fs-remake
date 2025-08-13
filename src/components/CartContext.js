"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

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

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 1),
        0
      ),
    [items]
  );

  const addItem = (item) => {
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
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    const safeQty = Math.max(1, Number(quantity) || 1);
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: safeQty } : it))
    );
  };

  const clearCart = () => setItems([]);

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
