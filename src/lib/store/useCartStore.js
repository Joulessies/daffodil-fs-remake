import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

async function pushCartToServer(items, identifier = "default") {
  try {
    if (typeof window === "undefined") return;
    await fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, items }),
    });
  } catch (e) {}
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      open: () => {
        get().syncWithServer();
        set({ isOpen: true });
      },
      close: () => set({ isOpen: false }),
      toggleOpen: () => {
        const nextState = !get().isOpen;
        if (nextState) get().syncWithServer();
        set({ isOpen: nextState });
      },

      syncWithServer: async (identifier = "default") => {
        try {
          if (typeof window === "undefined") return;
          const res = await fetch(`/api/cart/sync?identifier=${encodeURIComponent(identifier)}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.items)) {
              const currentJson = JSON.stringify(get().items);
              const incomingJson = JSON.stringify(data.items);
              if (currentJson !== incomingJson && data.items.length > 0) {
                set({ items: data.items });
              }
            }
          }
        } catch (e) {}
      },

      addItem: (item) => {
        if (!item || !item.id) return false;
        const items = get().items;
        const existingIndex = items.findIndex((p) => p.id === item.id);
        const addQty = Math.max(1, Number(item.quantity) || 1);

        let newItems;
        if (existingIndex !== -1) {
          const updated = [...items];
          const prevQty = Number(updated[existingIndex].quantity) || 1;
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...item,
            quantity: prevQty + addQty,
          };
          newItems = updated;
        } else {
          newItems = [{ ...item, quantity: addQty }, ...items];
        }

        set({ items: newItems });
        pushCartToServer(newItems);
        return true;
      },

      removeItem: (id) => {
        const newItems = get().items.filter((p) => p.id !== id);
        set({ items: newItems });
        pushCartToServer(newItems);
      },

      updateQuantity: (id, qty) => {
        const quantity = Number(qty);
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const newItems = get().items.map((it) =>
          it.id === id ? { ...it, quantity } : it
        );
        set({ items: newItems });
        pushCartToServer(newItems);
      },

      clearCart: () => {
        set({ items: [] });
        pushCartToServer([]);
      },

      getTotal: () => {
        return get().items.reduce(
          (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce(
          (sum, it) => sum + (Number(it.quantity) || 1),
          0
        );
      },
    }),
    {
      name: "daffodil-cart",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : null)),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (typeof window !== "undefined" && state) {
          state.syncWithServer();
          window.addEventListener("focus", () => state.syncWithServer());
          setInterval(() => {
            if (typeof document !== "undefined" && !document.hidden) {
              state.syncWithServer();
            }
          }, 3000);
        }
      },
    }
  )
);
