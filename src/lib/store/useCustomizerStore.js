import { create } from "zustand";

const FLOWER_TYPES = {
  roses: { label: "Roses", pricePerStem: 100 },
  tulips: { label: "Tulips", pricePerStem: 100 },
  sunflowers: { label: "Sunflowers", pricePerStem: 100 },
  mixed: { label: "Mixed Bouquet", pricePerStem: 100 },
};

const WRAPS = {
  kraft: { label: "Kraft Paper", price: 3 },
  satin: { label: "Satin Wrap", price: 5 },
  box: { label: "Gift Box", price: 8 },
};

const ADDONS = {
  vase: { label: "Glass Vase", price: 12 },
  teddy: { label: "Mini Teddy", price: 8 },
  chocolate: { label: "Chocolates", price: 10 },
  card: { label: "Greeting Card", price: 3 },
};

export const useCustomizerStore = create((set, get) => ({
  flowerType: "roses",
  stems: 12,
  wrap: "kraft",
  color: "red",
  addons: [],
  note: "",
  aiImage: "",
  aiLoading: false,

  setFlowerType: (flowerType) => set({ flowerType }),
  setStems: (stems) => set({ stems: Math.max(1, Math.min(50, Number(stems) || 1)) }),
  setWrap: (wrap) => set({ wrap }),
  setColor: (color) => set({ color }),
  setNote: (note) => set({ note }),
  setAiImage: (aiImage) => set({ aiImage }),
  setAiLoading: (aiLoading) => set({ aiLoading }),
  setAddons: (addons) => set({ addons }),
  toggleAddon: (addonKey) => {
    const { addons } = get();
    if (addons.includes(addonKey)) {
      set({ addons: addons.filter((k) => k !== addonKey) });
    } else {
      set({ addons: [...addons, addonKey] });
    }
  },

  reset: () =>
    set({
      flowerType: "roses",
      stems: 12,
      wrap: "kraft",
      color: "red",
      addons: [],
      note: "",
      aiImage: "",
      aiLoading: false,
    }),

  calculateTotal: () => {
    const { flowerType, stems, wrap, addons } = get();
    const flowerPrice =
      (FLOWER_TYPES[flowerType]?.pricePerStem || 100) * stems;
    const wrapPrice = WRAPS[wrap]?.price || 0;
    const addonsPrice = addons.reduce(
      (sum, k) => sum + (ADDONS[k]?.price || 0),
      0
    );
    return flowerPrice + wrapPrice + addonsPrice;
  },
}));
