import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Theme from '@/constants/Theme';
import { Order } from '@/types';
import { getOrders } from '@/services/database';
import { useAuth } from '@/context/AuthContext';

export default function OrdersScreen() {
  const router = useRouter();
  const { user, guestEmail } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    const list = await getOrders(user?.email || guestEmail);
    setOrders(list);
  };

  useEffect(() => {
    loadOrders();
  }, [user, guestEmail]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'delivering':
        return { step: 3, label: 'Out for Delivery' };
      case 'preparing':
        return { step: 2, label: 'Atelier Arranging' };
      case 'delivered':
        return { step: 4, label: 'Delivered' };
      default:
        return { step: 1, label: 'Order Confirmed' };
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={38} color={Theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>Client Sign In Required</Text>
          <Text style={styles.emptySubtitle}>
            Please sign in to view your bespoke order history and live dispatch tracking.
          </Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => router.push('/(auth)/login' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.shopNowButtonText}>Sign In / Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={38} color={Theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>No Order History</Text>
          <Text style={styles.emptySubtitle}>
            When you purchase flora, live dispatch updates will display here.
          </Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => router.push('/(tabs)/catalog' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.shopNowButtonText}>Browse Collection</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Theme.colors.primary]}
          />
        }
      >
        <Text style={styles.headingTitle}>ACTIVITY & DISPATCH ({orders.length})</Text>

        {orders.map((order) => {
          const { step, label } = getStatusStep(order.status);
          const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <View key={order.id} style={styles.orderCard}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderNumber}>{order.id}</Text>
                  <Text style={styles.orderDate}>{formattedDate}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{label}</Text>
                </View>
              </View>

              {/* Minimal Line Progress Stepper */}
              <View style={styles.stepperContainer}>
                <View style={styles.stepTrack}>
                  <View
                    style={[
                      styles.stepProgressFill,
                      {
                        width:
                          step === 1
                            ? '15%'
                            : step === 2
                            ? '50%'
                            : step === 3
                            ? '80%'
                            : '100%',
                      },
                    ]}
                  />
                </View>
                <View style={styles.stepperLabelsRow}>
                  <Text style={[styles.stepLabelText, step >= 1 && styles.stepLabelActive]}>
                    Placed
                  </Text>
                  <Text style={[styles.stepLabelText, step >= 2 && styles.stepLabelActive]}>
                    Atelier
                  </Text>
                  <Text style={[styles.stepLabelText, step >= 3 && styles.stepLabelActive]}>
                    Courier
                  </Text>
                  <Text style={[styles.stepLabelText, step >= 4 && styles.stepLabelActive]}>
                    Delivered
                  </Text>
                </View>
              </View>

              {/* Items List */}
              <View style={styles.itemsList}>
                {order.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.title} <Text style={{ color: Theme.colors.textMuted }}>× {item.quantity}</Text>
                    </Text>
                    <Text style={styles.itemPrice}>
                      ₱{(item.price * item.quantity).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.divider} />

              {/* Details & Total */}
              <View style={styles.footerRow}>
                <Text style={styles.addressText} numberOfLines={1}>
                  {order.shipping_address?.street || ''}, {order.shipping_address?.barangayCity || ''}
                </Text>
                <Text style={styles.paymentMethodText}>
                  {order.payment_method?.toUpperCase()}
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>₱{order.total.toLocaleString()}</Text>
              </View>

              {/* Customer Actions & Courier Help */}
              <View style={styles.customerActionsRow}>
                <TouchableOpacity
                  style={styles.contactSupportBtn}
                  onPress={() => Linking.openURL('tel:+639178924410')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call-outline" size={13} color={Theme.colors.textSecondary} />
                  <Text style={styles.contactSupportText}>Courier Concierge</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.refreshStatusBtn}
                  onPress={onRefresh}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={13} color={Theme.colors.primary} />
                  <Text style={styles.refreshStatusText}>Live Refresh</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  scrollContent: {
    padding: 20,
  },
  headingTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Theme.colors.textSecondary,
    marginBottom: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  shopNowButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: Theme.borderRadius.sm,
  },
  shopNowButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  orderCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  orderDate: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: Theme.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepperContainer: {
    marginVertical: 10,
  },
  stepTrack: {
    height: 2,
    backgroundColor: Theme.colors.surfaceSubtle,
    borderRadius: 1,
    overflow: 'hidden',
  },
  stepProgressFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },
  stepperLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  stepLabelText: {
    fontSize: 9,
    fontWeight: '600',
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  stepLabelActive: {
    color: Theme.colors.textPrimary,
  },
  itemsList: {
    gap: 6,
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 12,
    color: Theme.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.divider,
    marginVertical: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    flex: 1,
    marginRight: 8,
  },
  paymentMethodText: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    backgroundColor: Theme.colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  customerActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  contactSupportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 6,
  },
  contactSupportText: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  refreshStatusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 6,
  },
  refreshStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
});
