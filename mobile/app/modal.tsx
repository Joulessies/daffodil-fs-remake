import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Theme from '@/constants/Theme';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>ATELIER DISPATCH & CARE</Text>
        <Text style={styles.subtitle}>
          How we ensure each stem arrives in its purest organic form.
        </Text>
      </View>

      {/* Guide section 1 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>1. SAME-DAY METRO DISPATCH</Text>
        <Text style={styles.cardText}>
          Orders confirmed prior to 4:00 PM PST are hand-delivered the same day throughout Metro Manila, Rizal, Cavite, and Laguna. Stems travel in custom hydration reservoir wraps to maintain peak freshness.
        </Text>
      </View>

      {/* Guide section 2 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>2. 100% BOTANICAL GUARANTEE</Text>
        <Text style={styles.cardText}>
          Sourced daily from sustainable growers in Benguet and Tagaytay. If your floral design arrives damaged or below atelier standard, we replace or refund the arrangement immediately.
        </Text>
      </View>

      {/* Guide section 3 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>3. VASE LONGEVITY GUIDE</Text>
        <Text style={styles.cardText}>
          • Trim stems 2cm at a 45° angle under running water.{'\n'}
          • Remove any foliage resting below the waterline.{'\n'}
          • Refresh chilled vase water every 48 hours.{'\n'}
          • Avoid direct equatorial sunlight, drafts, or ripening produce.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        activeOpacity={0.85}
      >
        <Text style={styles.closeButtonText}>Close Guide</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 19,
  },
  closeButton: {
    backgroundColor: Theme.colors.primary,
    height: 44,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
