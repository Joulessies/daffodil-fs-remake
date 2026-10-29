export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  colors?: string[];
  popularity?: number;
  status?: string;
  stock?: number;
  images: string[];
  rating?: number;
  reviews_count?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  giftNote?: string;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  street: string;
  barangayCity: string;
  postalCode: string;
  deliveryDate?: string;
  specialInstructions?: string;
}

export type PaymentMethodType = 'cod' | 'gcash' | 'card' | 'paypal' | 'paymongo' | 'stripe';

export interface Order {
  id: string;
  user_id?: string | null;
  email: string;
  shipping_address: ShippingAddress;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
    giftNote?: string;
  }>;
  total: number;
  discount?: number;
  shippingFee: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  payment_method: PaymentMethodType;
  payment_id?: string;
  created_at: string;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  minSpend: number;
  description: string;
}
