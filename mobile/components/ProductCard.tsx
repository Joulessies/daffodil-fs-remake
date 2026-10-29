import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import Theme from '@/constants/Theme';

interface ProductCardProps {
  product: Product;
  cardWidth?: number;
}

const { width } = Dimensions.get('window');
const DEFAULT_CARD_WIDTH = (width - 44) / 2;

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cardWidth = DEFAULT_CARD_WIDTH,
}) => {
  const router = useRouter();
  const { addToCart, isWishlisted, toggleWishlist } = useCart();
  const wishlisted = isWishlisted(product.id);

  const imageUrl =
    product.images && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80';

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={[styles.container, { width: cardWidth }]}
      onPress={() => router.push(`/product/${product.id}` as any)}
    >
      {/* Visual Canvas */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

        {/* Minimalist Heart Button */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => toggleWishlist(product)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={17}
            color={wishlisted ? Theme.colors.accentRose : '#18181B'}
          />
        </TouchableOpacity>

        {/* Category Pill */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{product.category}</Text>
        </View>
      </View>

      {/* Typography & Details */}
      <View style={styles.infoContainer}>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={11} color="#C0841D" />
          <Text style={styles.ratingText}>{product.rating?.toFixed(1) || '4.9'}</Text>
          <Text style={styles.reviewsCount}>({product.reviews_count || 24})</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.price}>₱{product.price.toLocaleString()}</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addToCart(product, 1)}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.minimal,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: Theme.colors.surfaceSubtle,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoContainer: {
    padding: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  reviewsCount: {
    fontSize: 10,
    color: Theme.colors.textMuted,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  addButton: {
    backgroundColor: Theme.colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
