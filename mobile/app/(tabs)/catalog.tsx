import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '@/constants/Theme';
import { CATEGORIES } from '@/services/mockProducts';
import { getProducts } from '@/services/supabase';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';

type SortOption = 'popular' | 'price-asc' | 'price-desc';

export default function CatalogScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [refreshing, setRefreshing] = useState(false);

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

  const processedProducts = products
    .filter((p) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesColor =
        !selectedColor || (p.colors && p.colors.includes(selectedColor));

      return matchesSearch && matchesColor;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return (b.popularity || 0) - (a.popularity || 0);
    });

  const availableColors = ['yellow', 'pink', 'red', 'white', 'purple', 'orange'];

  return (
    <SafeAreaView style={styles.safeArea}>
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
        {/* Minimal Search Input */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={17} color={Theme.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by flower or keyword..."
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

        {/* Categories Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catButton, isSelected && styles.catButtonActive]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catText, isSelected && styles.catTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Minimalist Filter Bar */}
        <View style={styles.filterSection}>
          <View style={styles.sortRow}>
            <Text style={styles.filterLabel}>Sort:</Text>
            <TouchableOpacity
              style={[styles.sortPill, sortBy === 'popular' && styles.sortPillActive]}
              onPress={() => setSortBy('popular')}
            >
              <Text
                style={[
                  styles.sortPillText,
                  sortBy === 'popular' && styles.sortPillTextActive,
                ]}
              >
                Featured
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortPill, sortBy === 'price-asc' && styles.sortPillActive]}
              onPress={() => setSortBy('price-asc')}
            >
              <Text
                style={[
                  styles.sortPillText,
                  sortBy === 'price-asc' && styles.sortPillTextActive,
                ]}
              >
                Price ↑
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortPill, sortBy === 'price-desc' && styles.sortPillActive]}
              onPress={() => setSortBy('price-desc')}
            >
              <Text
                style={[
                  styles.sortPillText,
                  sortBy === 'price-desc' && styles.sortPillTextActive,
                ]}
              >
                Price ↓
              </Text>
            </TouchableOpacity>
          </View>

          {/* Color Palettes */}
          <View style={styles.colorRow}>
            <Text style={styles.filterLabel}>Tone:</Text>
            <TouchableOpacity
              style={[styles.colorResetPill, !selectedColor && styles.colorResetPillActive]}
              onPress={() => setSelectedColor(null)}
            >
              <Text style={styles.colorResetText}>All</Text>
            </TouchableOpacity>

            {availableColors.map((color) => {
              const isSelected = selectedColor === color;
              const colorMap: Record<string, string> = {
                yellow: '#F59E0B',
                pink: '#F472B6',
                red: '#EF4444',
                white: '#E5E7EB',
                purple: '#A855F7',
                orange: '#FB923C',
              };
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorDot,
                    { backgroundColor: colorMap[color] },
                    isSelected && styles.colorDotSelected,
                  ]}
                  onPress={() => setSelectedColor(isSelected ? null : color)}
                />
              );
            })}
          </View>
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {processedProducts.length} floral selection{processedProducts.length !== 1 ? 's' : ''}
          </Text>
          {(selectedColor || searchQuery) && (
            <TouchableOpacity
              onPress={() => {
                setSelectedColor(null);
                setSearchQuery('');
              }}
            >
              <Text style={styles.clearText}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Grid */}
        {processedProducts.length > 0 ? (
          <View style={styles.grid}>
            {processedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="flower-outline" size={38} color={Theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No matching flora</Text>
            <Text style={styles.emptySubtitle}>
              Please adjust your filters or search terms.
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSelectedCategory('all');
                setSelectedColor(null);
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetButtonText}>Reset All</Text>
            </TouchableOpacity>
          </View>
        )}

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
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: Theme.colors.textPrimary,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 6,
    paddingVertical: 8,
  },
  catButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  catButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.2,
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  filterSection: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 12,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 8,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 4,
  },
  sortPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surfaceSubtle,
  },
  sortPillActive: {
    backgroundColor: Theme.colors.primary,
  },
  sortPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  sortPillTextActive: {
    color: '#FFFFFF',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  colorResetPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  colorResetPillActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.surfaceSubtle,
  },
  colorResetText: {
    fontSize: 10,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  colorDotSelected: {
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    transform: [{ scale: 1.2 }],
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 8,
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    textDecorationLine: 'underline',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  resetButton: {
    marginTop: 14,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Theme.borderRadius.sm,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
});
