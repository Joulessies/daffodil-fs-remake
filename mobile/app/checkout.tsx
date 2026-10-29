import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Theme from '@/constants/Theme';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { placeOrder } from '@/services/supabase';
import { getApiBaseUrl } from '@/services/apiConfig';
import { PaymentMethodType } from '@/types';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, subtotal, discountAmount, shippingFee, total, clearCart } = useCart();
  const { user, guestEmail } = useAuth();

  const [recipientName, setRecipientName] = useState(
    user?.user_metadata?.full_name || ''
  );
  const [phone, setPhone] = useState('0917 123 4567');
  const [email, setEmail] = useState(user?.email || guestEmail || 'client@example.com');
  const [street, setStreet] = useState('Unit 14B, Ayala Avenue');
  const [city, setCity] = useState('Makati City, Metro Manila');
  const [postalCode, setPostalCode] = useState('1226');
  const [deliveryDate, setDeliveryDate] = useState('Today (Same-day)');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Payment Options: 'cod' | 'paymongo' | 'stripe' | 'paypal' | 'gcash'
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // E-Wallet Reference (Direct GCash / Maya)
  const [walletReference, setWalletReference] = useState('');

  // Fallback Manual Card Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.user_metadata?.full_name || user?.user_metadata?.name) {
      setRecipientName(user.user_metadata.full_name || user.user_metadata.name || '');
    }
    AsyncStorage.getItem('@daffodil_saved_profile').then((str) => {
      if (str) {
        try {
          const parsed = JSON.parse(str);
          if (parsed.fullName) setRecipientName(parsed.fullName);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.street) setStreet(parsed.street);
          if (parsed.city) setCity(parsed.city);
          if (parsed.postalCode) setPostalCode(parsed.postalCode);
        } catch (e) {}
      }
    });
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!recipientName.trim()) {
      Alert.alert('Missing Field', 'Please enter recipient name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Missing Field', 'Please provide a contact phone number for the courier.');
      return;
    }
    if (!street.trim() || !city.trim()) {
      Alert.alert('Missing Field', 'Please provide complete delivery address.');
      return;
    }

    if (paymentMethod === 'gcash' && !walletReference.trim()) {
      Alert.alert(
        'Reference Required',
        'Please enter the GCash/Maya payment reference number after sending payment.'
      );
      return;
    }

    setIsSubmitting(true);
    const apiBase = getApiBaseUrl();

    try {
      let paymentId = `PAY-${Date.now().toString().slice(-6)}`;

      // 1. STRIPE CHECKOUT FLOW
      if (paymentMethod === 'stripe') {
        try {
          const stripeRes = await fetch(`${apiBase}/api/payments/stripe/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: items.map((it) => ({
                id: it.product.id,
                title: it.product.title,
                price: it.product.price,
                quantity: it.quantity,
              })),
              customerEmail: email.trim(),
              successUrl: 'daffodil://order-success?payment=STRIPE',
              cancelUrl: 'daffodil://checkout?cancelled=1',
            }),
          });

          const stripeData = await stripeRes.json();
          if (stripeRes.ok && stripeData?.url) {
            const browserResult = await WebBrowser.openAuthSessionAsync(
              stripeData.url,
              'daffodil://order-success'
            );
            if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
              setIsSubmitting(false);
              return;
            }
            paymentId = stripeData.sessionId || `STRIPE-${Date.now()}`;
          }
        } catch (stripeErr) {
          console.log('Stripe checkout online gateway notice:', stripeErr);
        }
      }

      // 2. PAYMONGO CHECKOUT FLOW
      else if (paymentMethod === 'paymongo') {
        try {
          const pmRes = await fetch(`${apiBase}/api/payments/paymongo/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: items.map((it) => ({
                title: it.product.title,
                price: it.product.price,
                quantity: it.quantity,
              })),
              customerEmail: email.trim(),
              paymentMethodTypes: ['gcash', 'paymaya', 'grab_pay', 'card'],
              successUrl: 'daffodil://order-success?payment=PAYMONGO',
              cancelUrl: 'daffodil://checkout?cancelled=1',
            }),
          });

          const pmData = await pmRes.json();
          const checkoutUrl =
            pmData?.url ||
            pmData?.checkout_url ||
            pmData?.data?.attributes?.checkout_url;

          if (pmRes.ok && checkoutUrl) {
            const browserResult = await WebBrowser.openAuthSessionAsync(
              checkoutUrl,
              'daffodil://order-success'
            );
            if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
              setIsSubmitting(false);
              return;
            }
            paymentId = pmData?.reference_number || `PAYMONGO-${Date.now()}`;
          } else if (pmData?.error) {
            // If PayMongo secret is pending on server, inform user gracefully
            Alert.alert(
              'PayMongo Gateway',
              `${pmData.error}. Switching to confirmed direct order.`
            );
          }
        } catch (pmErr) {
          console.log('PayMongo gateway notice:', pmErr);
        }
      }

      // 3. PAYPAL CHECKOUT FLOW
      else if (paymentMethod === 'paypal') {
        try {
          const ppRes = await fetch(`${apiBase}/api/payments/paypal/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: (total / 58).toFixed(2),
              currency: 'USD',
            }),
          });

          const ppData = await ppRes.json();
          if (ppRes.ok && ppData?.id) {
            const ppCheckoutUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${ppData.id}`;
            const browserResult = await WebBrowser.openAuthSessionAsync(
              ppCheckoutUrl,
              'daffodil://order-success'
            );
            if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
              setIsSubmitting(false);
              return;
            }
            paymentId = ppData.id;
          }
        } catch (ppErr) {
          console.log('PayPal gateway notice:', ppErr);
        }
      }

      // 4. CASH ON DELIVERY
      else if (paymentMethod === 'cod') {
        paymentId = 'COD-PENDING';
      }

      // 5. DIRECT GCASH QR
      else if (paymentMethod === 'gcash') {
        paymentId = `GCASH-REF-${walletReference.trim()}`;
      }

      // Construct and insert order in Supabase Database
      const orderData = {
        user_id: user?.id || null,
        email: email.trim(),
        shipping_address: {
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          street: street.trim(),
          barangayCity: city.trim(),
          postalCode: postalCode.trim(),
          deliveryDate,
          specialInstructions: specialInstructions.trim() || undefined,
        },
        items: items.map((it) => ({
          id: it.product.id,
          title: it.product.title,
          price: it.product.price,
          quantity: it.quantity,
          image: it.product.images[0],
          giftNote: it.giftNote,
        })),
        total,
        discount: discountAmount,
        shippingFee,
        payment_method: paymentMethod,
        payment_id: paymentId,
      };

      const placed = await placeOrder(orderData);

      // Save delivery details to AsyncStorage for next time
      AsyncStorage.setItem(
        '@daffodil_saved_profile',
        JSON.stringify({
          fullName: recipientName.trim(),
          phone: phone.trim(),
          street: street.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
        })
      ).catch(() => {});

      clearCart();
      setIsSubmitting(false);

      router.replace({
        pathname: '/order-success',
        params: {
          orderId: placed.id,
          total: total.toString(),
          recipient: recipientName,
          address: `${street}, ${city}`,
          payment: paymentMethod.toUpperCase(),
        },
      } as any);
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Error', err?.message || 'Failed to complete order.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Checkout',
          headerTitleStyle: { fontWeight: '700', fontSize: 16 },
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerShadowVisible: false,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Recipient Details */}
        <View style={styles.card}>
          <Text style={styles.stepTitle}>1. RECIPIENT DETAILS</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Recipient name"
              placeholderTextColor={Theme.colors.textMuted}
              value={recipientName}
              onChangeText={setRecipientName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>MOBILE PHONE (COURIER CONTACT)</Text>
            <TextInput
              style={styles.input}
              placeholder="0917 123 4567"
              placeholderTextColor={Theme.colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS (RECEIPT & TRACKING)</Text>
            <TextInput
              style={styles.input}
              placeholder="client@example.com"
              placeholderTextColor={Theme.colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.stepTitle}>2. DELIVERY ADDRESS & DATE</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>STREET ADDRESS / UNIT / BUILDING</Text>
            <TextInput
              style={styles.input}
              placeholder="Unit 14B, Ayala Avenue"
              placeholderTextColor={Theme.colors.textMuted}
              value={street}
              onChangeText={setStreet}
            />
          </View>

          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>CITY / BARANGAY</Text>
              <TextInput
                style={styles.input}
                placeholder="Makati City"
                placeholderTextColor={Theme.colors.textMuted}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>POSTAL CODE</Text>
              <TextInput
                style={styles.input}
                placeholder="Postal"
                placeholderTextColor={Theme.colors.textMuted}
                keyboardType="numeric"
                value={postalCode}
                onChangeText={setPostalCode}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DISPATCH SCHEDULE</Text>
            <View style={styles.dateSelectorRow}>
              {['Today (Same-day)', 'Tomorrow Express', 'Weekend'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.dateOptionBtn,
                    deliveryDate === opt && styles.dateOptionBtnActive,
                  ]}
                  onPress={() => setDeliveryDate(opt)}
                >
                  <Text
                    style={[
                      styles.dateOptionText,
                      deliveryDate === opt && styles.dateOptionTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>COURIER SPECIAL INSTRUCTIONS (OPTIONAL)</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top', paddingTop: 8 }]}
              placeholder="e.g. Leave with building concierge, ring doorbell twice"
              placeholderTextColor={Theme.colors.textMuted}
              multiline
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
            />
          </View>
        </View>

        {/* Payment Selection with PayMongo, Stripe, PayPal, COD, GCash */}
        <View style={styles.card}>
          <Text style={styles.stepTitle}>3. PAYMENT PROVIDER & METHOD</Text>

          <View style={styles.paymentMethodsList}>
            {/* PayMongo Option */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'paymongo' && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod('paymongo')}
              activeOpacity={0.8}
            >
              <View style={styles.paymentRadioRow}>
                <View
                  style={[
                    styles.radioCircle,
                    paymentMethod === 'paymongo' && styles.radioCircleActive,
                  ]}
                >
                  {paymentMethod === 'paymongo' && <View style={styles.radioDot} />}
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.paymentOptionTitle}>PayMongo</Text>
                    <View style={styles.gatewayBadge}>
                      <Text style={styles.gatewayBadgeText}>PH E-WALLETS</Text>
                    </View>
                  </View>
                  <Text style={styles.paymentOptionDesc}>
                    GCash, PayMaya, GrabPay & Local Cards
                  </Text>
                </View>
                <Ionicons name="wallet-outline" size={20} color={Theme.colors.accentGold} />
              </View>
            </TouchableOpacity>

            {/* Stripe Option */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'stripe' && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod('stripe')}
              activeOpacity={0.8}
            >
              <View style={styles.paymentRadioRow}>
                <View
                  style={[
                    styles.radioCircle,
                    paymentMethod === 'stripe' && styles.radioCircleActive,
                  ]}
                >
                  {paymentMethod === 'stripe' && <View style={styles.radioDot} />}
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.paymentOptionTitle}>Stripe Checkout</Text>
                    <View style={styles.gatewayBadge}>
                      <Text style={styles.gatewayBadgeText}>CARDS & PAY</Text>
                    </View>
                  </View>
                  <Text style={styles.paymentOptionDesc}>
                    Visa, Mastercard, AMEX, Google & Apple Pay
                  </Text>
                </View>
                <Ionicons name="card-outline" size={20} color={Theme.colors.primary} />
              </View>
            </TouchableOpacity>

            {/* PayPal Option */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'paypal' && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod('paypal')}
              activeOpacity={0.8}
            >
              <View style={styles.paymentRadioRow}>
                <View
                  style={[
                    styles.radioCircle,
                    paymentMethod === 'paypal' && styles.radioCircleActive,
                  ]}
                >
                  {paymentMethod === 'paypal' && <View style={styles.radioDot} />}
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.paymentOptionTitle}>PayPal</Text>
                    <View style={styles.gatewayBadge}>
                      <Text style={styles.gatewayBadgeText}>DIGITAL WALLET</Text>
                    </View>
                  </View>
                  <Text style={styles.paymentOptionDesc}>
                    Direct PayPal secure digital checkout
                  </Text>
                </View>
                <Ionicons name="logo-paypal" size={18} color="#00457C" />
              </View>
            </TouchableOpacity>

            {/* Cash on Delivery (COD) */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cod' && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod('cod')}
              activeOpacity={0.8}
            >
              <View style={styles.paymentRadioRow}>
                <View
                  style={[
                    styles.radioCircle,
                    paymentMethod === 'cod' && styles.radioCircleActive,
                  ]}
                >
                  {paymentMethod === 'cod' && <View style={styles.radioDot} />}
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.paymentOptionTitle}>Cash on Delivery (COD)</Text>
                  <Text style={styles.paymentOptionDesc}>
                    Direct cash settlement upon door handoff
                  </Text>
                </View>
                <Ionicons name="cash-outline" size={20} color={Theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Direct GCash QR Settlement */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'gcash' && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod('gcash')}
              activeOpacity={0.8}
            >
              <View style={styles.paymentRadioRow}>
                <View
                  style={[
                    styles.radioCircle,
                    paymentMethod === 'gcash' && styles.radioCircleActive,
                  ]}
                >
                  {paymentMethod === 'gcash' && <View style={styles.radioDot} />}
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.paymentOptionTitle}>Direct GCash / Maya QR</Text>
                  <Text style={styles.paymentOptionDesc}>
                    Instant transfer to Atelier Merchant Number
                  </Text>
                </View>
                <Ionicons name="qr-code-outline" size={20} color="#007DFE" />
              </View>

              {paymentMethod === 'gcash' && (
                <View style={styles.walletDetailsCard}>
                  <Text style={styles.walletDetailsTitle}>ATELIER GCASH MERCHANT</Text>
                  <Text style={styles.walletDetailsNumber}>0917 892 4410</Text>
                  <Text style={styles.walletDetailsName}>Daffodil Floral Atelier Inc.</Text>

                  <TextInput
                    style={[styles.input, { marginTop: 10, backgroundColor: Theme.colors.surface }]}
                    placeholder="Enter GCash / Maya Reference #"
                    placeholderTextColor={Theme.colors.textMuted}
                    value={walletReference}
                    onChangeText={setWalletReference}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.stepTitle}>SUMMARY ({items.length} ITEMS)</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₱{subtotal.toLocaleString()}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Promotion Discount</Text>
              <Text style={styles.summaryValue}>-₱{discountAmount.toLocaleString()}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {shippingFee === 0 ? 'Complimentary' : `₱${shippingFee}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalValue}>₱{total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Place Order CTA Button */}
        <TouchableOpacity
          style={styles.placeOrderBtn}
          activeOpacity={0.88}
          disabled={isSubmitting}
          onPress={handlePlaceOrder}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.placeOrderBtnText}>
              Complete Order • ₱{total.toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          Encrypted 256-Bit SSL Atelier Checkout
        </Text>

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
  scrollContent: {
    padding: 18,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.surfaceSubtle,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateOptionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceSubtle,
  },
  dateOptionBtnActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.surface,
  },
  dateOptionText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  dateOptionTextActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  paymentMethodsList: {
    gap: 10,
  },
  paymentOption: {
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 12,
    backgroundColor: Theme.colors.surfaceSubtle,
  },
  paymentOptionActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.surface,
  },
  paymentRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: Theme.colors.primary,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Theme.colors.primary,
  },
  paymentOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  paymentOptionDesc: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  gatewayBadge: {
    backgroundColor: Theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Theme.borderRadius.sm,
  },
  gatewayBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  walletDetailsCard: {
    marginTop: 10,
    padding: 12,
    backgroundColor: Theme.colors.surfaceSubtle,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  walletDetailsTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.textMuted,
    letterSpacing: 1,
  },
  walletDetailsNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#007DFE',
    marginTop: 2,
  },
  walletDetailsName: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
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
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  placeOrderBtn: {
    backgroundColor: Theme.colors.primary,
    height: 48,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  placeOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  securityNote: {
    textAlign: 'center',
    fontSize: 10,
    color: Theme.colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 12,
    textTransform: 'uppercase',
  },
});
