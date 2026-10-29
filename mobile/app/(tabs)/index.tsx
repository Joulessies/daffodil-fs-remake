import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Theme from '@/constants/Theme';
import { CATEGORIES } from '@/services/mockProducts';
import { getProducts } from '@/services/supabase';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';

export default function HomeScreen() {
  const router = useRouter();
  const { itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (cat?: string) => {
    const list = await getProducts(cat || selectedCategory);
    setProducts(list);
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Editorial Minimalist Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandTitle}>DAFFODIL</Text>
          <Text style={styles.brandSubtitle}>FLORAL ATELIER & BOUTIQUE</Text>
        </View>

        <TouchableOpacity
          style={styles.cartIconButton}
          onPress={() => router.push('/(tabs)/cart' as any)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="bag-handle-outline" size={21} color={Theme.colors.textPrimary} />
          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Theme.colors.primary]}
          />
        }
      >
        {/* Minimal Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={17} color={Theme.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search botanical arrangements..."
              placeholderTextColor={Theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={Theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Minimal Editorial Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTag}>DAFFODIL FLOWER SHOP</Text>
            <Text style={styles.heroTitle}>Bouquets from the Florist</Text>
            <Text style={styles.heroSubtitle}>
              Handcrafted floral arrangements that bring beauty and joy to every moment.
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => router.push('/(tabs)/catalog' as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.heroButtonText}>Explore Catalog</Text>
              <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Pills */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Curations</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/catalog' as any)}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Product Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>
            {selectedCategory === 'all'
              ? 'Selected Arrangements'
              : `${selectedCategory.toUpperCase()} COLLECTION`}
          </Text>
          <Text style={styles.countText}>{filteredProducts.length} items</Text>
        </View>

        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>

        {/* Minimalist Studio Guarantees */}
        <View style={styles.studioGuarantees}>
          <View style={styles.guaranteeRow}>
            <Ionicons name="leaf-outline" size={18} color={Theme.colors.textPrimary} />
            <View style={styles.guaranteeTextCol}>
              <Text style={styles.guaranteeTitle}>Fresh Highland Harvest</Text>
              <Text style={styles.guaranteeDesc}>
                Cut at dawn from sustainable boutique growers.
              </Text>
            </View>
          </View>

          <View style={styles.guaranteeDivider} />

          <View style={styles.guaranteeRow}>
            <Ionicons name="car-outline" size={18} color={Theme.colors.textPrimary} />
            <View style={styles.guaranteeTextCol}>
              <Text style={styles.guaranteeTitle}>Climate-Controlled Transit</Text>
              <Text style={styles.guaranteeDesc}>
                Transported in hydration packs to preserve natural form.
              </Text>
            </View>
          </View>

          <View style={styles.guaranteeDivider} />

          <View style={styles.guaranteeRow}>
            <Ionicons name="mail-open-outline" size={18} color={Theme.colors.textPrimary} />
            <View style={styles.guaranteeTextCol}>
              <Text style={styles.guaranteeTitle}>Embossed Gift Stationery</Text>
              <Text style={styles.guaranteeDesc}>
                Includes complimentary card handwritten with your bespoke note.
              </Text>
            </View>
          </View>
        </View>

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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: Theme.colors.background,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    letterSpacing: 2.8,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    color: Theme.colors.textMuted,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  cartIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Theme.colors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: Theme.colors.textPrimary,
  },
  heroBanner: {
    marginHorizontal: 20,
    height: 195,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(24, 24, 27, 0.45)',
  },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 20,
    bottom: 20,
    justifyContent: 'center',
  },
  heroTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F4F4F5',
    letterSpacing: 2,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 25,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#D4D4D8',
    marginBottom: 14,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Theme.borderRadius.sm,
    gap: 6,
  },
  heroButtonText: {
    color: Theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Theme.colors.textPrimary,
    textTransform: 'uppercase',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  countText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 6,
    paddingBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  categoryChipSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.2,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  studioGuarantees: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guaranteeTextCol: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 2,
  },
  guaranteeDesc: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    lineHeight: 15,
  },
  guaranteeDivider: {
    height: 1,
    backgroundColor: Theme.colors.divider,
    marginVertical: 12,
  },
});
