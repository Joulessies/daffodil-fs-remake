import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      contains: (id) => {
        return get().items.some((it) => it.id === id);
      },

      add: (item) => {
        if (!item) return;
        const normalized = normalizeItem(item);
        if (get().contains(normalized.id)) return;
        set({ items: [normalized, ...get().items] });
      },

      remove: (id) => {
        set({ items: get().items.filter((it) => it.id !== id) });
      },

      toggle: (item) => {
        if (!item) return;
        const normalized = normalizeItem(item);
        const exists = get().contains(normalized.id);
        if (exists) {
          get().remove(normalized.id);
        } else {
          get().add(normalized);
        }
      },

      clear: () => set({ items: [] }),

      getItemCount: () => get().items.length,
    }),
    {
      name: "daffodil-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
