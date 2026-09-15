import { create } from "zustand";

export const useUIStore = create((set) => ({
  // Mobile drawer navigation
  isMobileMenuOpen: false,
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // Profile modal
  isProfileOpen: false,
  openProfile: () => set({ isProfileOpen: true }),
  closeProfile: () => set({ isProfileOpen: false }),

  // Search modal / query
  isSearchOpen: false,
  searchQuery: "",
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Product Quick View Modal
  selectedProduct: null,
  isProductModalOpen: false,
  openProductModal: (product) =>
    set({ selectedProduct: product, isProductModalOpen: true }),
  closeProductModal: () =>
    set({ isProductModalOpen: false, selectedProduct: null }),
}));
