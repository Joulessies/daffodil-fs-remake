import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // Modal controls
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      // Cart Actions
      addItem: (item) => {
        if (!item || !item.id) return false;
        const items = get().items;
        const existingIndex = items.findIndex((p) => p.id === item.id);
        const addQty = Math.max(1, Number(item.quantity) || 1);

        if (existingIndex !== -1) {
          const updated = [...items];
          const prevQty = Number(updated[existingIndex].quantity) || 1;
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...item,
            quantity: prevQty + addQty,
          };
          set({ items: updated });
        } else {
          set({
            items: [{ ...item, quantity: addQty }, ...items],
          });
        }
        return true;
      },

      removeItem: (id) => {
        set({ items: get().items.filter((p) => p.id !== id) });
      },

      updateQuantity: (id, qty) => {
        const quantity = Number(qty);
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((it) =>
            it.id === id ? { ...it, quantity } : it
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      // Calculations
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // only persist items, not modal isOpen
    }
  )
);
