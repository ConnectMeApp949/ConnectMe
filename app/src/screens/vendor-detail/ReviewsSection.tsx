import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { VendorReview } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { StarIcon, StarOutlineIcon } from '../../components/Icons';

// ─── Star display ────────────────────────────────────────

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= Math.round(rating)
          ? <StarIcon key={i} size={size} color={colors.star} />
          : <StarOutlineIcon key={i} size={size} color={colors.border} strokeWidth={1.5} />
      )}
    </View>
  );
}

// ─── Rating breakdown bar ────────────────────────────────

function RatingBar({ stars, percent }: { stars: number; percent: number }) {
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label}>{stars}</Text>
      <View style={barStyles.track}>
        <View style={[barStyles.fill, { width: `${percent}%` }]} />
      </View>
      <Text style={barStyles.percent}>{percent}%</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, width: 14, textAlign: 'center' },
  track: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, marginHorizontal: spacing.sm, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.star, borderRadius: 3 },
  percent: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, width: 36, textAlign: 'right' },
});

// ─── Individual review card ──────────────────────────────

function ReviewCard({ review }: { review: VendorReview }) {
  const date = new Date(review.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <View style={cardStyles.container}>
      <View style={cardStyles.header}>
        <View style={cardStyles.avatar}>
          {review.client.profilePhoto ? (
            <Image source={{ uri: review.client.profilePhoto }} style={cardStyles.avatarImage} />
          ) : (
            <Text style={cardStyles.avatarText}>
              {review.client.firstName[0]}
            </Text>
          )}
        </View>
        <View style={cardStyles.meta}>
          <Text style={cardStyles.name}>{review.client.firstName}</Text>
          <Text style={cardStyles.date}>{dateStr}</Text>
        </View>
        <Stars rating={review.rating} />
      </View>

      {review.comment && <Text style={cardStyles.comment}>{review.comment}</Text>}

      {review.photos && review.photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={cardStyles.photosRow}
          contentContainerStyle={cardStyles.photosContent}
          accessibilityLabel={`Review photos, ${review.photos.length} images`}
          accessibilityRole="list"
        >
          {review.photos.map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              style={cardStyles.photoThumb}
              accessibilityLabel={`Review photo ${i + 1} of ${review.photos!.length}`}
              accessibilityRole="image"
            />
          ))}
        </ScrollView>
      )}

      {review.vendorResponse && (
        <View style={cardStyles.response}>
          <Text style={cardStyles.responseLabel}>Vendor response</Text>
          <Text style={cardStyles.responseText}>{review.vendorResponse}</Text>
        </View>
      )}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  avatarText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
  meta: { flex: 1 },
  name: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  date: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  comment: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, lineHeight: 21 },
  photosRow: { marginTop: spacing.sm },
  photosContent: { gap: spacing.sm },
  photoThumb: { width: 80, height: 80, borderRadius: borderRadius.sm },
  response: {
    marginTop: spacing.sm, padding: spacing.md,
    backgroundColor: colors.cardBackground, borderRadius: borderRadius.sm, borderLeftWidth: 3, borderLeftColor: colors.accent,
  },
  responseLabel: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.accent, marginBottom: spacing.xs },
  responseText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
});

// ─── Main reviews section ────────────────────────────────

interface ReviewsSectionProps {
  averageRating: number;
  totalReviews: number;
  reviews: VendorReview[];
  ratingBreakdown?: number[];
  onSeeAll?: () => void;
}

export default function ReviewsSection({
  averageRating,
  totalReviews,
  reviews,
  ratingBreakdown = [80, 12, 5, 2, 1],
  onSeeAll,
}: ReviewsSectionProps) {
  return (
    <View>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.ratingBig}>
          <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
          <Stars rating={averageRating} size={20} />
          <Text style={styles.reviewCount}>{totalReviews} reviews</Text>
        </View>
        <View style={styles.breakdown}>
          {[5, 4, 3, 2, 1].map((star, i) => (
            <RatingBar key={star} stars={star} percent={ratingBreakdown[i] ?? 0} />
          ))}
        </View>
      </View>

      {/* Review cards */}
      {reviews.slice(0, 3).map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}

      {totalReviews > 3 && onSeeAll && (
        <Text style={styles.seeAll} onPress={onSeeAll}>
          See all {totalReviews} reviews →
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  ratingBig: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  ratingNumber: {
    fontFamily: fonts.bold,
    fontSize: 40,
    color: colors.text,
  },
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  breakdown: {
    flex: 1,
    justifyContent: 'center',
  },
  seeAll: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.accent,
    marginTop: spacing.sm,
  },
});
