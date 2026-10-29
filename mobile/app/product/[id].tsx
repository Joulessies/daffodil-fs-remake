import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Theme from '@/constants/Theme';
import { Product } from '@/types';
import { getProductById } from '@/services/supabase';
import { useCart } from '@/context/CartContext';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [giftNote, setGiftNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getProductById(id).then((p) => {
        setProduct(p);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Ionicons name="flower-outline" size={36} color={Theme.colors.textMuted} />
          <Text style={styles.loadingText}>Loading arrangement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const currentImage = product.images[selectedImageIdx] || product.images[0];

  const handleAddToCart = () => {
    addToCart(product, quantity, giftNote.trim() ? giftNote.trim() : undefined);
    Alert.alert(
      'Added to Bag & Web Cart',
      `${product.title} has been added to your bag and synced to the website cart!`,
      [
        { text: 'Continue', style: 'cancel' },
        { text: 'View Bag', onPress: () => router.push('/(tabs)/cart' as any) },
      ]
    );
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, giftNote.trim() ? giftNote.trim() : undefined);
    router.push('/checkout' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.floatingHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color={Theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => toggleWishlist(product)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={wishlisted ? 'heart' : 'heart-outline'}
              size={20}
              color={wishlisted ? Theme.colors.accentRose : Theme.colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/(tabs)/cart' as any)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="bag-handle-outline" size={20} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageGalleryContainer}>
          <Image source={{ uri: currentImage }} style={styles.mainImage} resizeMode="cover" />

          {product.images.length > 1 && (
            <View style={styles.thumbnailsRow}>
              {product.images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.thumbBtn,
                    selectedImageIdx === idx && styles.thumbBtnActive,
                  ]}
                  onPress={() => setSelectedImageIdx(idx)}
                >
                  <Image source={{ uri: img }} style={styles.thumbImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.categoryBadgeText}>{product.category.toUpperCase()}</Text>
            <Text style={styles.stockText}>
              {product.stock && product.stock > 0 ? 'Fresh Harvest Available' : 'Limited'}
            </Text>
          </View>

          <Text style={styles.productTitle}>{product.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₱{product.price.toLocaleString()}</Text>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={12} color="#C0841D" />
              <Text style={styles.ratingNumber}>{product.rating?.toFixed(1) || '4.9'}</Text>
              <Text style={styles.reviewsText}>({product.reviews_count || 32})</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>BOTANICAL NOTES</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>

          <View style={styles.careCard}>
            <Text style={styles.careTitle}>STUDIO VASE CARE</Text>
            <Text style={styles.careText}>
              1. Cut stems 2cm diagonally upon arrival.{'\n'}
              2. Place in clean, chilled water away from direct sun.{'\n'}
              3. Replenish vase water every 48 hours for extended life.
            </Text>
          </View>

          <View style={styles.giftCardSection}>
            <Text style={styles.giftCardTitle}>HANDWRITTEN STATIONERY NOTE</Text>
            <Text style={styles.giftCardSubtitle}>
              Complimentary handwritten greeting printed on heavy cardstock.
            </Text>
            <TextInput
              style={styles.giftCardInput}
              placeholder="Write your note to the recipient..."
              placeholderTextColor={Theme.colors.textMuted}
              multiline
              numberOfLines={3}
              value={giftNote}
              onChangeText={setGiftNote}
            />
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>QUANTITY</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={14} color={Theme.colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={14} color={Theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addToCartBtn}
          activeOpacity={0.8}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>Add to Bag</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowBtn}
          activeOpacity={0.88}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>Purchase Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: Theme.colors.textMuted,
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 44,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRightGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  imageGalleryContainer: {
    width: '100%',
    height: 380,
    backgroundColor: Theme.colors.surfaceSubtle,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailsRow: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.75)',
    padding: 4,
    borderRadius: Theme.borderRadius.full,
  },
  thumbBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  thumbBtnActive: {
    borderColor: Theme.colors.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 20,
    backgroundColor: Theme.colors.surface,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textMuted,
    letterSpacing: 1.2,
  },
  stockText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    lineHeight: 26,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  reviewsText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.divider,
    marginVertical: 16,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  careCard: {
    backgroundColor: Theme.colors.surfaceSubtle,
    padding: 14,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: 16,
  },
  careTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  careText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },
  giftCardSection: {
    backgroundColor: Theme.colors.surface,
    padding: 14,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 16,
  },
  giftCardTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 0.8,
  },
  giftCardSubtitle: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginVertical: 4,
  },
  giftCardInput: {
    backgroundColor: Theme.colors.surfaceSubtle,
    borderRadius: Theme.borderRadius.sm,
    padding: 10,
    fontSize: 12,
    color: Theme.colors.textPrimary,
    textAlignVertical: 'top',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.8,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceSubtle,
    borderRadius: Theme.borderRadius.sm,
    padding: 2,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginHorizontal: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 10,
  },
  addToCartBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    height: 46,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  addToCartText: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  buyNowBtn: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    height: 46,
    borderRadius: Theme.borderRadius.sm,
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
