import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Theme from '@/constants/Theme';
import { useCart } from '@/context/CartContext';

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    shippingFee,
    total,
    appliedPromo,
    applyPromo,
    removePromo,
    syncWithWebServer,
    isSyncing,
    lastSyncedAt,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleApplyPromo = () => {
    if (!couponCode.trim()) return;
    const res = applyPromo(couponCode);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoError(null);
      setCouponCode('');
    }
  };

  const freeShippingThreshold = 2000;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(1, subtotal / freeShippingThreshold);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-handle-outline" size={40} color={Theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Explore our curated studio collection of fresh floral cuts.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/catalog' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.browseButtonText}>Browse Collection</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.shippingBarContainer}>
          {amountToFreeShipping > 0 ? (
            <>
              <View style={styles.shippingBarHeader}>
                <Text style={styles.shippingBarText}>
                  Complimentary delivery on orders above ₱2,000 (Add ₱{amountToFreeShipping.toLocaleString()} more)
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[styles.progressBarFill, { width: `${freeShippingProgress * 100}%` }]}
                />
              </View>
            </>
          ) : (
            <View style={styles.freeShippingSuccessRow}>
              <Ionicons name="checkmark-circle" size={15} color={Theme.colors.primary} />
              <Text style={styles.freeShippingSuccessText}>
                Complimentary Express Delivery Unlocked
              </Text>
            </View>
          )}
        </View>

        <View style={styles.webSyncBar}>
          <View style={styles.webSyncLeft}>
            <View style={styles.liveDot} />
            <View>
              <Text style={styles.webSyncTitle}>Connected to Website Cart</Text>
              <Text style={styles.webSyncSubtitle}>
                {lastSyncedAt ? `Last synced at ${lastSyncedAt}` : 'Live auto-sync enabled'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.syncBtn}
            onPress={async () => {
              const ok = await syncWithWebServer();
              Alert.alert(
                ok ? 'Bag Synced with Website!' : 'Bag Saved Locally',
                ok
                  ? 'Your mobile items are now synced to the website cart! Open your browser to view them.'
                  : 'Web server is offline or unreachable. Your items are safely saved on your device.'
              );
            }}
            disabled={isSyncing}
            activeOpacity={0.8}
          >
            <Ionicons name="sync-outline" size={13} color={Theme.colors.primary} />
            <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync Now'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsCountText}>
              Selected Items ({items.length})
            </Text>
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearCartText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {items.map((item) => (
            <View key={item.product.id} style={styles.itemCard}>
              <Image
                source={{
                  uri:
                    item.product.images && item.product.images[0]
                      ? item.product.images[0]
                      : 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80',
                }}
                style={styles.itemImage}
              />

              <View style={styles.itemDetails}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.product.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.product.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={17} color={Theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemCategory}>{item.product.category}</Text>
                {item.giftNote ? (
                  <Text style={styles.giftNoteText} numberOfLines={1}>
                    Note: "{item.giftNote}"
                  </Text>
                ) : null}

                <View style={styles.itemBottomRow}>
                  <Text style={styles.itemPrice}>
                    ₱{(item.product.price * item.quantity).toLocaleString()}
                  </Text>

                  <View style={styles.qtyContainer}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Ionicons name="remove" size={12} color={Theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={12} color={Theme.colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.couponCard}>
          <Text style={styles.couponTitle}>PROMOTIONAL VOUCHER</Text>
          {appliedPromo ? (
            <View style={styles.appliedPromoRow}>
              <View style={styles.promoTag}>
                <Text style={styles.promoTagCode}>{appliedPromo.code}</Text>
                <Text style={styles.promoTagDesc}>{appliedPromo.description}</Text>
              </View>
              <TouchableOpacity onPress={removePromo}>
                <Ionicons name="close-circle-outline" size={18} color={Theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter code (e.g. DAFFODIL10)"
                  placeholderTextColor={Theme.colors.textMuted}
                  autoCapitalize="characters"
                  value={couponCode}
                  onChangeText={(text) => {
                    setCouponCode(text);
                    setPromoError(null);
                  }}
                />
                <TouchableOpacity
                  style={styles.applyCouponBtn}
                  onPress={handleApplyPromo}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyCouponText}>Apply</Text>
                </TouchableOpacity>
              </View>
              {promoError ? <Text style={styles.promoErrorText}>{promoError}</Text> : null}
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₱{subtotal.toLocaleString()}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount ({appliedPromo?.discountPercent}%)</Text>
              <Text style={[styles.summaryValue, { color: Theme.colors.textPrimary }]}>
                -₱{discountAmount.toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>
              {shippingFee === 0 ? 'Complimentary' : `₱${shippingFee}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated Total</Text>
            <Text style={styles.totalValue}>₱{total.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          activeOpacity={0.88}
          onPress={() => router.push('/checkout' as any)}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout • ₱{total.toLocaleString()}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginTop: 14,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.sm,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  shippingBarContainer: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  shippingBarHeader: {
    marginBottom: 6,
  },
  shippingBarText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: Theme.colors.surfaceSubtle,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },
  freeShippingSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freeShippingSuccessText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  itemsSection: {
    marginBottom: 16,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemsCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearCartText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surfaceSubtle,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  itemCategory: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  giftNoteText: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceSubtle,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginHorizontal: 6,
  },
  couponCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  couponTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    color: Theme.colors.textPrimary,
  },
  applyCouponBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 16,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyCouponText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  promoErrorText: {
    color: Theme.colors.error,
    fontSize: 11,
    marginTop: 6,
  },
  appliedPromoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceSubtle,
    padding: 10,
    borderRadius: Theme.borderRadius.sm,
  },
  promoTag: {
    flex: 1,
  },
  promoTagCode: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  promoTagDesc: {
    fontSize: 10,
    color: Theme.colors.textMuted,
  },
  summaryCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.divider,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  checkoutButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  webSyncBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 16,
  },
  webSyncLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  webSyncTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  webSyncSubtitle: {
    fontSize: 9,
    color: Theme.colors.textMuted,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  syncBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
});
