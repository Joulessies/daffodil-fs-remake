import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order } from '@/types';
import { DEFAULT_PRODUCTS } from './mockProducts';
import { getApiBaseUrl } from './apiConfig';

const DB_PRODUCTS_KEY = '@daffodil_db_products';
const DB_ORDERS_KEY = '@daffodil_db_orders';
const DB_CONFIG_KEY = '@daffodil_db_config';
const DB_SYNC_TIME_KEY = '@daffodil_db_last_sync';

const DEFAULT_SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rwsxqxwekjhxxjoajnal.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_oV-NsDI5cn8oOb3S7SsRFQ_eMA5q-eU';

let supabaseClient: SupabaseClient | null = null;
let currentSupabaseUrl = DEFAULT_SUPABASE_URL;
let currentSupabaseKey = DEFAULT_SUPABASE_ANON_KEY;
let isCloudConnected = false;

function getOrCreateClient(url: string, key: string): SupabaseClient {
  if (!supabaseClient || currentSupabaseUrl !== url || currentSupabaseKey !== key) {
    currentSupabaseUrl = url;
    currentSupabaseKey = key;
    supabaseClient = createClient(url, key, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseClient;
}

export interface DatabaseStatus {
  isCloudConnected: boolean;
  provider: 'supabase' | 'local';
  supabaseUrl: string;
  productCount: number;
  orderCount: number;
  lastSyncTime: string | null;
}

export async function initDatabase(): Promise<DatabaseStatus> {
  try {
    const savedConfig = await AsyncStorage.getItem(DB_CONFIG_KEY);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed.url && parsed.key) {
        currentSupabaseUrl = parsed.url;
        currentSupabaseKey = parsed.key;
      }
    }
  } catch (err) {
    console.warn('Could not read custom DB config:', err);
  }

  const localProductsStr = await AsyncStorage.getItem(DB_PRODUCTS_KEY);
  if (!localProductsStr) {
    await AsyncStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  }

  await checkCloudConnection();

  return getDatabaseStatus();
}

export async function checkCloudConnection(): Promise<boolean> {
  try {
    const client = getOrCreateClient(currentSupabaseUrl, currentSupabaseKey);
    const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), 3500)
    );

    const queryPromise = client.from('products').select('id').limit(1);
    const res: any = await Promise.race([queryPromise, timeoutPromise]);

    if (!res.error) {
      isCloudConnected = true;
      return true;
    }
  } catch (e) {}

  isCloudConnected = false;
  return false;
}

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const products = await getLocalProducts();
  const orders = await getLocalOrders();
  const lastSyncTime = await AsyncStorage.getItem(DB_SYNC_TIME_KEY);

  return {
    isCloudConnected,
    provider: isCloudConnected ? 'supabase' : 'local',
    supabaseUrl: currentSupabaseUrl,
    productCount: products.length,
    orderCount: orders.length,
    lastSyncTime,
  };
}

export async function updateDatabaseCredentials(url: string, key: string): Promise<boolean> {
  try {
    const trimmedUrl = url.trim();
    const trimmedKey = key.trim();

    await AsyncStorage.setItem(
      DB_CONFIG_KEY,
      JSON.stringify({ url: trimmedUrl, key: trimmedKey })
    );

    currentSupabaseUrl = trimmedUrl;
    currentSupabaseKey = trimmedKey;
    supabaseClient = null;

    const ok = await checkCloudConnection();
    if (ok) {
      await syncDatabase();
    }
    return ok;
  } catch (e) {
    console.error('Error saving DB config:', e);
    return false;
  }
}

export async function syncDatabase(): Promise<{ success: boolean; message: string }> {
  const isUp = await checkCloudConnection();
  const now = new Date().toISOString();

  if (!isUp) {
    await AsyncStorage.setItem(DB_SYNC_TIME_KEY, now);
    return {
      success: false,
      message: 'Cloud database is paused or unreachable. Active local database is operational.',
    };
  }

  const client = getOrCreateClient(currentSupabaseUrl, currentSupabaseKey);

  try {
    const { data: cloudProducts, error: pError } = await client
      .from('products')
      .select('*')
      .eq('status', 'active');

    if (!pError && cloudProducts && cloudProducts.length > 0) {
      const mapped: Product[] = cloudProducts.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        price: Number(item.price) || 0,
        category: item.category || 'seasonal',
        colors: item.colors || [],
        stock: item.stock !== undefined ? Number(item.stock) : 50,
        images:
          Array.isArray(item.images) && item.images.length > 0
            ? item.images.map((img: string) => {
                if (img.startsWith('http')) return img;
                const def = DEFAULT_PRODUCTS.find((p) => p.id === item.id);
                return def
                  ? def.images[0]
                  : 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80';
              })
            : [
                DEFAULT_PRODUCTS.find((p) => p.id === item.id)?.images[0] ||
                  'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80',
              ],
        rating: 4.9,
        reviews_count: 28,
      }));

      await AsyncStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(mapped));
    }

    const localOrders = await getLocalOrders();
    for (const order of localOrders) {
      try {
        await client.from('orders').upsert({
          id: order.id.startsWith('DAFF-') ? undefined : order.id,
          email: order.email,
          shipping_address: order.shipping_address,
          items: order.items,
          total: order.total,
          status: order.status,
          payment_method: order.payment_method,
          user_id: order.user_id || null,
        });
      } catch (e) {}
    }

    await AsyncStorage.setItem(DB_SYNC_TIME_KEY, now);
    return { success: true, message: 'Synchronized with Supabase Cloud successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Sync encountered an error.' };
  }
}

export async function getProducts(category?: string): Promise<Product[]> {
  try {
    const client = getOrCreateClient(currentSupabaseUrl, currentSupabaseKey);
    let query = client.from('products').select('*').eq('status', 'active');
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 4000)
    );
    const { data, error }: any = await Promise.race([query, timeoutPromise]);

    if (!error && Array.isArray(data) && data.length > 0) {
      isCloudConnected = true;
      const mapped: Product[] = data.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        price: Number(item.price) || 0,
        category: item.category || 'seasonal',
        colors: item.colors || [],
        stock: item.stock !== undefined ? Number(item.stock) : 50,
        images:
          Array.isArray(item.images) && item.images.length > 0
            ? item.images.map((img: string) => {
                if (img.startsWith('http')) return img;
                const def = DEFAULT_PRODUCTS.find((p) => p.id === item.id);
                return def
                  ? def.images[0]
                  : 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80';
              })
            : [
                DEFAULT_PRODUCTS.find((p) => p.id === item.id)?.images[0] ||
                  'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80',
              ],
        rating: 4.9,
        reviews_count: 24,
      }));

      // Cache locally so it is instant and works offline
      AsyncStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(mapped)).catch(() => {});
      return mapped;
    }
  } catch (e) {
    // Fall back to local database cache if network or cloud timeout
  }

  const localList = await getLocalProducts();
  if (!category || category === 'all') {
    return localList;
  }
  return localList.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}

export async function getProductById(id: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.id === id) || null;
}

export async function placeOrder(
  order: Omit<Order, 'id' | 'created_at' | 'status'>
): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: `DAFF-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  try {
    const existing = await getLocalOrders();
    const updated = [newOrder, ...existing];
    await AsyncStorage.setItem(DB_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed saving order to local DB:', e);
  }

  try {
    const currentProducts = await getLocalProducts();
    const updatedProducts = currentProducts.map((p) => {
      const orderedItem = order.items.find((it) => it.id === p.id);
      if (orderedItem) {
        const qty = orderedItem.quantity || 1;
        const currentStock = p.stock !== undefined ? p.stock : 50;
        return { ...p, stock: Math.max(0, currentStock - qty) };
      }
      return p;
    });
    await AsyncStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(updatedProducts));
  } catch (e) {
    console.error('Failed decrementing stock in local DB:', e);
  }

  // Always attempt cloud synchronization for order placement
  try {
    const client = getOrCreateClient(currentSupabaseUrl, currentSupabaseKey);
    const { data, error } = await client
      .from('orders')
      .insert({
        order_number: newOrder.id,
        email: newOrder.email,
        customer_email: newOrder.email,
        customer_name: newOrder.shipping_address?.recipientName,
        customer_phone: newOrder.shipping_address?.phone,
        shipping_address: newOrder.shipping_address,
        items: newOrder.items,
        total: newOrder.total,
        status: newOrder.status,
        payment_method: newOrder.payment_method,
        user_id: newOrder.user_id || null,
      })
      .select()
      .maybeSingle();

    if (!error && data?.id) {
      newOrder.id = data.id;
      isCloudConnected = true;
    }

    for (const item of order.items) {
      try {
        const { data: prod } = await client
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .maybeSingle();
        if (prod) {
          const currentStock = Number(prod.stock) || 0;
          const newStock = Math.max(0, currentStock - (item.quantity || 1));
          await client.from('products').update({ stock: newStock }).eq('id', item.id);
        }
      } catch (e) {}
    }
  } catch (err) {
    console.warn('Could not write order to cloud, stored locally:', err);
  }

  try {
    const apiBaseUrl = getApiBaseUrl();

    fetch(`${apiBaseUrl}/api/admin/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_number: newOrder.id,
        customer_email: newOrder.email,
        customer_name: newOrder.shipping_address?.recipientName || 'Mobile Shopper',
        customer_phone: newOrder.shipping_address?.phone || '',
        shipping_address: newOrder.shipping_address,
        total: newOrder.total,
        items: newOrder.items,
        payment_method: newOrder.payment_method,
        status: 'pending',
      }),
    }).catch(() => {});

    fetch(`${apiBaseUrl}/api/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newOrder.email,
        name: newOrder.shipping_address?.recipientName,
        address: `${newOrder.shipping_address?.street}, ${newOrder.shipping_address?.barangayCity}`,
        items: newOrder.items,
        total: newOrder.total,
      }),
    }).catch(() => {});
  } catch (e) {}

  return newOrder;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: Order['status']
): Promise<boolean> {
  try {
    const localOrders = await getLocalOrders();
    const updated = localOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    await AsyncStorage.setItem(DB_ORDERS_KEY, JSON.stringify(updated));

    if (isCloudConnected) {
      const client = getOrCreateClient(currentSupabaseUrl, currentSupabaseKey);
      await client.from('orders').update({ status: newStatus }).eq('id', orderId);
    }
    return true;
  } catch (e) {
    console.error('Error updating order status:', e);
    return false;
  }
}

export async function getOrders(email?: string): Promise<Order[]> {
  const localOrders = await getLocalOrders();

  if (email) {
    try {
      const client = getOrCreateClient(currentSupabaseUrl, currentSupabaseKey);
      const { data, error } = await client
        .from('orders')
        .select('*')
        .or(`email.eq.${email},customer_email.eq.${email}`)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        isCloudConnected = true;
        const mergedMap = new Map<string, Order>();
        localOrders.forEach((o) => mergedMap.set(o.id, o));
        data.forEach((d) => {
          mergedMap.set(d.id, {
            id: d.id,
            user_id: d.user_id,
            email: d.email,
            shipping_address: d.shipping_address || {},
            items: d.items || [],
            total: Number(d.total) || 0,
            shippingFee: 150,
            status: d.status || 'pending',
            payment_method: d.payment_method || 'cod',
            payment_id: d.payment_id,
            created_at: d.created_at || new Date().toISOString(),
          });
        });

        return Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    } catch (err) {
      console.warn('Error fetching cloud orders:', err);
    }
  }

  return localOrders;
}

async function getLocalProducts(): Promise<Product[]> {
  try {
    const str = await AsyncStorage.getItem(DB_PRODUCTS_KEY);
    if (str) return JSON.parse(str);
  } catch (e) {}
  return DEFAULT_PRODUCTS;
}

async function getLocalOrders(): Promise<Order[]> {
  try {
    const str = await AsyncStorage.getItem(DB_ORDERS_KEY);
    if (str) return JSON.parse(str);
  } catch (e) {}
  return [];
}
