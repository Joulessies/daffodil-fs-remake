import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, CartItem, PromoCode } from '@/types';
import { PROMO_CODES } from '@/services/mockProducts';
import { getApiBaseUrl } from '@/services/apiConfig';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, giftNote?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  appliedPromo: PromoCode | null;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  itemCount: number;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  syncWithWebServer: (cartItems?: CartItem[]) => Promise<boolean>;
  isSyncing: boolean;
  lastSyncedAt: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@daffodil_cart';
const WISHLIST_STORAGE_KEY = '@daffodil_wishlist';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const syncWithWebServer = useCallback(async (cartItems?: CartItem[]): Promise<boolean> => {
    const listToSync = cartItems !== undefined ? cartItems : items;
    setIsSyncing(true);
    try {
      const baseUrl = getApiBaseUrl();
      const formatted = listToSync.map((it) => ({
        id: it.product.id,
        title: it.product.title,
        price: it.product.price,
        quantity: it.quantity,
        images: it.product.images,
        image: it.product.images[0],
        giftNote: it.giftNote,
      }));

      const res = await fetch(`${baseUrl}/api/cart/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'default',
          items: formatted,
        }),
      });

      if (res.ok) {
        setLastSyncedAt(new Date().toLocaleTimeString());
        setIsSyncing(false);
        return true;
      }
    } catch (e) {}
    setIsSyncing(false);
    return false;
  }, [items]);

  useEffect(() => {
    (async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          setItems(parsed);
          syncWithWebServer(parsed);
        } else {
          try {
            const baseUrl = getApiBaseUrl();
            const res = await fetch(`${baseUrl}/api/cart/sync?identifier=default`);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data.items) && data.items.length > 0) {
                const mapped: CartItem[] = data.items.map((it: any) => ({
                  product: {
                    id: it.id,
                    title: it.title,
                    price: it.price,
                    description: it.description || '',
                    category: it.category || 'seasonal',
                    images: it.images || (it.image ? [it.image] : []),
                  },
                  quantity: it.quantity || 1,
                  giftNote: it.giftNote,
                }));
                setItems(mapped);
              }
            }
          } catch (e) {}
        }

        const storedWishlist = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
        if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
      } catch (e) {
        console.error('Error loading cart from storage', e);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(console.error);
    syncWithWebServer(items);
  }, [items]);

  useEffect(() => {
    AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist)).catch(console.error);
  }, [wishlist]);

  const addToCart = (product: Product, quantity = 1, giftNote?: string) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        if (giftNote) copy[existingIdx].giftNote = giftNote;
        return copy;
      }
      return [...prev, { product, quantity, giftNote }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
  };

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const applyPromo = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const promo = PROMO_CODES.find((p) => p.code === trimmed);

    if (!promo) {
      return { success: false, message: 'Invalid promo coupon code' };
    }

    if (subtotal < promo.minSpend) {
      return {
        success: false,
        message: `Requires minimum order of ₱${promo.minSpend.toLocaleString()}`,
      };
    }

    setAppliedPromo(promo);
    return { success: true, message: `Coupon applied: ${promo.description}` };
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  const shippingFee = subtotal === 0 ? 0 : appliedPromo?.code === 'SPRINGFREESHIP' || subtotal >= 2000 ? 0 : 150;

  const discountAmount = appliedPromo && appliedPromo.discountPercent > 0
    ? Math.round((subtotal * appliedPromo.discountPercent) / 100)
    : 0;

  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedPromo,
        applyPromo,
        removePromo,
        subtotal,
        discountAmount,
        shippingFee,
        total,
        itemCount,
        wishlist,
        toggleWishlist,
        isWishlisted,
        syncWithWebServer,
        isSyncing,
        lastSyncedAt,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
