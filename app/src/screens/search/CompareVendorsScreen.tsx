import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ChevronLeftIcon, StarIcon, CheckIcon, XIcon, PlusIcon, ClockIcon,
  MapPinIcon,
} from '../../components/Icons';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_VENDORS = 3;

const CATEGORY_LABELS: Record<string, string> = {
  FOOD_TRUCK: 'Food Truck', DJ: 'DJ', CATERING: 'Catering',
  WEDDING_SERVICES: 'Weddings', PHOTOGRAPHY: 'Photography',
  ENTERTAINMENT: 'Entertainment', OTHER: 'Other',
};

type Props = NativeStackScreenProps<any, 'CompareVendors'>;

export default function CompareVendorsScreen({ navigation, route }: Props) {
  const initialVendors = (route.params as any)?.vendors ?? [];
  const [vendors, setVendors] = useState<any[]>(initialVendors.slice(0, MAX_VENDORS));

  const columnWidth = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * (MAX_VENDORS - 1)) / MAX_VENDORS;

  function removeVendor(index: number) {
    setVendors((prev) => prev.filter((_, i) => i !== index));
  }

  // Compute highlights
  const prices = vendors.map((v) => Number(v.basePrice ?? 0));
  const ratings = vendors.map((v) => Number(v.averageRating ?? 0));
  const lowestPrice = Math.min(...prices);
  const highestRating = Math.max(...ratings);

  function renderVendorColumn(vendor: any, index: number) {
    const price = Number(vendor.basePrice ?? 0);
    const rating = Number(vendor.averageRating ?? 0);
    const totalReviews = Number(vendor.totalReviews ?? 0);
    const totalBookings = Number(vendor.totalBookings ?? 0);
    const serviceRadius = vendor.serviceRadius ?? 0;
    const isInstantBook = totalBookings % 2 === 0 && totalBookings > 0;

    return (
      <View key={vendor.id} style={[styles.column, { width: columnWidth }]}>
        {/* Remove button */}
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removeVendor(index)}
          accessibilityLabel={`Remove ${vendor.businessName} from comparison`}
          accessibilityRole="button"
        >
          <XIcon size={14} color={colors.white} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Photo */}
        {vendor.coverPhoto ? (
          <Image source={{ uri: vendor.coverPhoto }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <Text style={styles.photoInitial}>{vendor.businessName?.[0]}</Text>
          </View>
        )}

        {/* Name */}
        <Text style={styles.vendorName} numberOfLines={2}>{vendor.businessName}</Text>

        {/* Category */}
        <Text style={styles.categoryText} numberOfLines={1}>
          {CATEGORY_LABELS[vendor.category] ?? vendor.category}
        </Text>

        {/* Rating */}
        <View style={[
          styles.statRow,
          rating === highestRating && vendors.length > 1 && styles.highlightBest,
        ]}>
          <StarIcon size={14} color={colors.star} />
          <Text style={styles.statValue}>
            {rating > 0 ? rating.toFixed(1) : 'New'}
          </Text>
        </View>

        {/* Price */}
        <View style={[
          styles.statRow,
          price === lowestPrice && vendors.length > 1 && styles.highlightGreen,
        ]}>
          <Text style={[
            styles.priceText,
            price === lowestPrice && vendors.length > 1 && styles.priceTextGreen,
          ]}>
            ${price.toFixed(0)}
          </Text>
        </View>

        {/* Reviews */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{totalReviews} reviews</Text>
        </View>

        {/* Response time */}
        <View style={styles.statRow}>
          <ClockIcon size={12} color={colors.textMuted} strokeWidth={1.5} />
          <Text style={styles.statLabel}>98%</Text>
        </View>

        {/* Total bookings */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{totalBookings} bookings</Text>
        </View>

        {/* Service radius */}
        <View style={styles.statRow}>
          <MapPinIcon size={12} color={colors.textMuted} strokeWidth={1.5} />
          <Text style={styles.statLabel}>{serviceRadius} mi</Text>
        </View>

        {/* Instant book */}
        <View style={styles.statRow}>
          {isInstantBook ? (
            <View style={styles.instantBadge}>
              <CheckIcon size={12} color={colors.success} strokeWidth={2.5} />
              <Text style={styles.instantText}>Instant</Text>
            </View>
          ) : (
            <View style={styles.noInstantBadge}>
              <XIcon size={12} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.noInstantText}>Request</Text>
            </View>
          )}
        </View>

        {/* Book Now */}
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('RequestBooking', {
            vendor,
            instantBook: isInstantBook,
          })}
          activeOpacity={0.7}
          accessibilityLabel={`Book ${vendor.businessName}`}
          accessibilityRole="button"
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>

        {/* View Details */}
        <TouchableOpacity
          onPress={() => navigation.navigate('VendorDetail', { vendor })}
          activeOpacity={0.6}
          accessibilityLabel={`View details for ${vendor.businessName}`}
          accessibilityRole="link"
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderPlaceholder(index: number) {
    return (
      <View key={`placeholder-${index}`} style={[styles.column, styles.placeholderColumn, { width: columnWidth }]}>
        <View style={styles.placeholderIcon}>
          <PlusIcon size={28} color={colors.textMuted} strokeWidth={1.5} />
        </View>
        <Text style={styles.placeholderText}>Add Vendor</Text>
      </View>
    );
  }

  const placeholdersNeeded = Math.max(0, 2 - vendors.length);
  const placeholders = Array.from({ length: placeholdersNeeded }, (_, i) => i);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Vendors</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Comparison labels column + vendor columns */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Row labels (left side) */}
        <View style={styles.comparisonArea}>
          {vendors.map((v, i) => renderVendorColumn(v, i))}
          {placeholders.map((_, i) => renderPlaceholder(i))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  comparisonArea: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  column: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    alignItems: 'center',
    position: 'relative',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  photoFallback: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitial: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.white,
  },
  vendorName: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    minHeight: 36,
  },
  categoryText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: borderRadius.sm,
    width: '100%',
    justifyContent: 'center',
    minHeight: 28,
  },
  highlightBest: {
    backgroundColor: '#FEF9E7',
  },
  highlightGreen: {
    backgroundColor: '#ECFDF5',
    borderRadius: borderRadius.sm,
  },
  statValue: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.text,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  priceTextGreen: {
    color: colors.success,
  },
  instantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  instantText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.success,
  },
  noInstantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  noInstantText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
  },
  bookBtn: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: spacing.sm,
    width: '100%',
    alignItems: 'center',
  },
  bookBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.white,
  },
  viewDetailsText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.primary,
    marginTop: spacing.sm,
    textDecorationLine: 'underline',
  },
  placeholderColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
    minHeight: 300,
  },
  placeholderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  placeholderText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
});
