import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Theme from '@/constants/Theme';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId?: string;
    total?: string;
    recipient?: string;
    address?: string;
    payment?: string;
  }>();

  const orderId = params.orderId || 'DAFF-104928';
  const total = params.total || '0';
  const recipient = params.recipient || 'Valued Client';
  const address = params.address || 'Metro Manila Delivery Address';
  const payment = params.payment || 'COD';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Minimal Checkmark Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={32} color={Theme.colors.textPrimary} />
        </View>

        <Text style={styles.title}>ORDER CONFIRMED</Text>
        <Text style={styles.subtitle}>
          Thank you for choosing Daffodil Floral Atelier. Our florists have begun curating your blooms.
        </Text>

        {/* Minimalist Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptTitle}>RECEIPT</Text>
            <Text style={styles.orderIdText}>{orderId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Recipient</Text>
            <Text style={styles.receiptValue}>{recipient}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Address</Text>
            <Text style={[styles.receiptValue, { flex: 1, textAlign: 'right' }]}>
              {address}
            </Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Settlement</Text>
            <Text style={styles.receiptValue}>{payment}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Schedule</Text>
            <Text style={styles.receiptValue}>
              Today (Same-day Express)
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptTotalRow}>
            <Text style={styles.receiptTotalLabel}>Total Paid</Text>
            <Text style={styles.receiptTotalValue}>₱{Number(total).toLocaleString()}</Text>
          </View>
        </View>

        {/* Minimal Action Buttons */}
        <TouchableOpacity
          style={styles.trackOrderBtn}
          activeOpacity={0.85}
          onPress={() => router.replace('/(tabs)/orders' as any)}
        >
          <Text style={styles.trackOrderBtnText}>View Tracking Timeline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueShoppingBtn}
          activeOpacity={0.85}
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <Text style={styles.continueShoppingBtnText}>Return to Atelier</Text>
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
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 20,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Theme.colors.textSecondary,
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.divider,
    marginVertical: 12,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  receiptValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  receiptTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  trackOrderBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: Theme.colors.primary,
    height: 46,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: 10,
  },
  trackOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  continueShoppingBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 46,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  continueShoppingBtnText: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
