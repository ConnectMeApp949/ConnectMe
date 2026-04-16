import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { StarIcon, HeartFilledIcon, HeartIcon, CheckIcon } from './Icons';
import { useSavedVendors } from '../hooks/useSavedVendors';
import { getVendorBadges } from '../constants/badges';

const CARD_WIDTH = (Dimensions.get('window').width - spacing.lg * 2 - spacing.sm) / 2;

const UNIT_SHORT: Record<string, string> = {
  PER_HOUR: '/hr',
  PER_EVENT: '/event',
  CUSTOM: '',
};

// Curated cover photos for vendors with generic/placeholder images
const CURATED_COVERS: Record<string, string> = {
  'SA Rolling Kitchen': 'https://images.unsplash.com/photo-1567129937968-cdad8f07e2f8?w=800&h=600&fit=crop',
  'SA Matcha Bar': 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&h=600&fit=crop',
  'Puro Coffee Cart': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
  'Alamo Mobile Bartenders': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop',
  'River City Juice Co.': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&h=600&fit=crop',
  'Fiesta Cocktail Catering': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&h=600&fit=crop',
  'The Boba Truck SA': 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=800&h=600&fit=crop',
  'Hill Country Spirits': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=600&fit=crop',
  'SA Smoothie Station': 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=800&h=600&fit=crop',
};

const CATEGORY_LABELS: Record<string, string> = {
  FOOD_TRUCK: 'Mobile Eats', DJ: 'Music', CATERING: 'Catering',
  WEDDING_SERVICES: 'Weddings', PHOTOGRAPHY: 'Photography',
  ENTERTAINMENT: 'Entertainment', EXPERIENCES: 'Experiences', WELLNESS: 'Wellness', BEVERAGES: 'Beverages', OTHER: 'Other',
};

function VendorBadgesInline({ vendor }: { vendor: any }) {
  const badges = getVendorBadges(vendor).slice(0, 2);
  if (badges.length === 0) return null;
  return (
    <View style={styles.badgeRow}>
      {badges.map((badge) => (
        <View key={badge.type} style={[styles.badgePill, { backgroundColor: badge.backgroundColor }]} accessibilityLabel={`${badge.label} badge`}>
          <Text style={styles.badgeIcon}>{badge.icon}</Text>
          <Text style={[styles.badgeLabel, { color: badge.textColor }]}>{badge.label}</Text>
        </View>
      ))}
    </View>
  );
}

interface VendorCardProps {
  vendor: any;
  onPress: () => void;
  variant?: 'grid' | 'featured';
}

export default function VendorCard({ vendor, onPress, variant = 'grid' }: VendorCardProps) {
  const { colors: themeColors } = useTheme();
  const { isSaved, toggle } = useSavedVendors();
  const saved = isSaved(vendor.id);
  const isFeatured = variant === 'featured';
  const cardWidth = isFeatured ? 260 : CARD_WIDTH;
  const imageHeight = isFeatured ? 180 : cardWidth * 0.75;
  const [imgError, setImgError] = useState(false);
  const coverUri = CURATED_COVERS[vendor.businessName] || vendor.coverPhoto || vendor.portfolioPhotos?.[0];

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityLabel={`${vendor.businessName}, ${vendor.averageRating > 0 ? `rated ${Number(vendor.averageRating).toFixed(1)} stars` : 'New vendor'}, from $${Number(vendor.basePrice).toFixed(0)}`}
      accessibilityRole="button"
      accessibilityHint="Opens vendor detail page"
    >
      {/* Image */}
      <View style={[styles.imageWrapper, { height: imageHeight }]}>
        {!imgError && coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImgError(true)}
            accessibilityLabel={`${vendor.businessName} cover photo`}
            accessibilityRole="image"
          />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <Text style={styles.imageFallbackText}>{vendor.businessName?.[0] ?? 'V'}</Text>
          </View>
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.35)']}
          style={styles.gradient}
        />

        {/* Heart (top-right, Airbnb style) */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={(e) => { e.stopPropagation?.(); toggle(vendor); }}
          accessibilityLabel={saved ? `Remove ${vendor.businessName} from saved` : `Save ${vendor.businessName}`}
          accessibilityRole="button"
          accessibilityHint={saved ? 'Removes this vendor from your favorites' : 'Adds this vendor to your favorites'}
        >
          {saved ? <HeartFilledIcon size={18} color={colors.error} /> : <HeartIcon size={18} color={colors.textMuted} strokeWidth={1.5} />}
        </TouchableOpacity>

        {/* Verified badge */}
        {vendor.user?.isVerified && (
          <View style={styles.verifiedBadge}>
            <CheckIcon size={12} color={colors.white} strokeWidth={2.5} />
          </View>
        )}

        {/* Price overlay */}
        <View style={styles.priceOverlay}>
          <Text style={styles.priceText}>
            From ${Number(vendor.basePrice).toFixed(0)}
            {UNIT_SHORT[vendor.priceUnit] ?? ''}
          </Text>
        </View>

      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>{vendor.businessName}</Text>
        </View>
        <VendorBadgesInline vendor={vendor} />
        <Text style={[styles.category, { color: themeColors.textSecondary }]}>
          {CATEGORY_LABELS[vendor.category] ?? vendor.category}
        </Text>
        <View style={styles.ratingRow}>
          <StarIcon size={14} color={themeColors.star} />
          <Text style={[styles.rating, { color: themeColors.text }]}>
            {vendor.averageRating > 0 ? Number(vendor.averageRating).toFixed(1) : 'New'}
          </Text>
          {vendor.totalReviews > 0 && (
            <Text style={[styles.reviews, { color: themeColors.textMuted }]}> · {vendor.totalReviews} reviews</Text>
          )}
          {vendor.priceUnit && UNIT_SHORT[vendor.priceUnit] ? (
            <Text style={styles.unitText}> · {UNIT_SHORT[vendor.priceUnit].replace('/', 'per ')}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Skeleton loader ─────────────────────────────────────

export function VendorCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'featured' }) {
  const isFeatured = variant === 'featured';
  const cardWidth = isFeatured ? 260 : CARD_WIDTH;
  const imageHeight = isFeatured ? 180 : cardWidth * 0.75;

  return (
    <View style={[styles.container, { width: cardWidth }]}>
      <View style={[styles.skeletonImage, { height: imageHeight }]} />
      <View style={styles.info}>
        <View style={[styles.skeletonBar, { width: '75%', height: 14 }]} />
        <View style={[styles.skeletonBar, { width: '50%', height: 12, marginTop: 6 }]} />
        <View style={[styles.skeletonBar, { width: '40%', height: 12, marginTop: 6 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.cardBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: 'rgba(255,255,255,0.7)',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  heartButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  heartIcon: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '300',
  },
  heartSaved: {
    color: colors.error,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
  },
  priceOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  priceText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.white,
  },
  info: {
    paddingTop: spacing.sm,
    paddingHorizontal: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    gap: 3,
  },
  badgeIcon: {
    fontSize: 9,
  },
  badgeLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  category: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  star: {
    fontSize: 15,
    color: colors.star,
    marginRight: 3,
  },
  rating: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  reviews: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  unitText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },

  // Skeleton
  skeletonImage: {
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  skeletonBar: {
    backgroundColor: colors.border,
    borderRadius: 4,
  },
});
