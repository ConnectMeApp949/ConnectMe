import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, StarIcon, StarOutlineIcon } from '../../components/Icons';
import Skeleton from '../../components/Skeleton';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

type Props = NativeStackScreenProps<any, 'MyReviews'>;

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  vendorResponse: string | null;
  photos?: string[];
  createdAt: string;
  booking: {
    eventType: string;
    vendor: {
      businessName: string;
      coverPhoto: string | null;
    };
  };
}

export default function MyReviewsScreen({ navigation }: Props) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      // Fetch completed bookings which have reviews
      const res = await fetch(`${API_URL}/bookings?status=COMPLETED`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        // Build review list from bookings that have reviews
        const bookings = data.data ?? [];
        const reviewList: ReviewItem[] = bookings
          .filter((b: any) => b.review)
          .map((b: any) => ({
            id: b.review.id ?? b.id,
            rating: b.review.rating,
            comment: b.review.comment,
            vendorResponse: b.review.vendorResponse,
            photos: b.review.photos ?? undefined,
            createdAt: b.review.createdAt ?? b.createdAt,
            booking: {
              eventType: b.eventType,
              vendor: {
                businessName: b.vendor?.businessName ?? 'Unknown',
                coverPhoto: b.vendor?.coverPhoto ?? null,
              },
            },
          }));
        setReviews(reviewList);
      }
    } catch {
      Alert.alert('Error', 'Unable to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function renderStars(rating: number) {
    return (
      <View style={{ flexDirection: 'row' }}>
        {[1,2,3,4,5].map(i => i <= rating
          ? <StarIcon key={i} size={14} color={colors.star} />
          : <StarOutlineIcon key={i} size={14} color={colors.border} strokeWidth={1.5} />
        )}
      </View>
    );
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function renderReview({ item }: { item: ReviewItem }) {
    return (
      <View style={s.card}>
        {/* Vendor info */}
        <View style={s.vendorRow}>
          {item.booking.vendor.coverPhoto ? (
            <Image source={{ uri: item.booking.vendor.coverPhoto }} style={s.vendorPhoto} accessibilityLabel={`${item.booking.vendor.businessName} photo`} accessibilityRole="image" />
          ) : (
            <View style={s.vendorPhotoFb}>
              <Text style={s.vendorPhotoText}>{item.booking.vendor.businessName[0]}</Text>
            </View>
          )}
          <View style={s.vendorInfo}>
            <Text style={s.vendorName}>{item.booking.vendor.businessName}</Text>
            <Text style={s.eventType}>{item.booking.eventType}</Text>
          </View>
        </View>

        {/* Rating + date */}
        <View style={s.ratingRow}>
          {renderStars(item.rating)}
          <Text style={s.date}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* Comment */}
        {item.comment && <Text style={s.comment}>{item.comment}</Text>}

        {/* Review photos */}
        {item.photos && item.photos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.photosRow}
            contentContainerStyle={s.photosContent}
            accessibilityLabel={`Review photos, ${item.photos.length} images`}
            accessibilityRole="list"
          >
            {item.photos.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={s.photoThumb}
                accessibilityLabel={`Review photo ${i + 1} of ${item.photos!.length}`}
                accessibilityRole="image"
              />
            ))}
          </ScrollView>
        )}

        {/* Vendor response */}
        {item.vendorResponse && (
          <View style={s.response}>
            <Text style={s.responseLabel}>Response from {item.booking.vendor.businessName}</Text>
            <Text style={s.responseText}>{item.vendorResponse}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Reviews</Text>
        <View style={s.backBtn} />
      </View>

      {loading ? (
        <View style={{ padding: 20 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={s.card}>
              <View style={s.vendorRow}>
                <Skeleton width={44} height={44} borderRadius={22} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Skeleton width="55%" height={14} />
                  <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
                </View>
              </View>
              <Skeleton width="30%" height={14} style={{ marginBottom: 10 }} />
              <Skeleton width="100%" height={12} />
              <Skeleton width="100%" height={12} style={{ marginTop: 6 }} />
              <Skeleton width="60%" height={12} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
      ) : reviews.length === 0 ? (
        <View style={s.emptyState}>
          <View style={s.emptyIconWrap}>
            <StarOutlineIcon size={36} color={colors.textMuted} />
          </View>
          <Text style={s.emptyTitle}>No reviews yet</Text>
          <Text style={s.emptySub}>Reviews you leave for vendors will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={s.summaryCard}>
              <Text style={s.summaryNum}>{reviews.length}</Text>
              <Text style={s.summaryLabel}>Reviews Left</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  list: { padding: 20 },

  // Summary
  summaryCard: {
    alignItems: 'center', paddingVertical: 20, marginBottom: 20,
    backgroundColor: colors.cardBackground, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
  },
  summaryNum: { fontFamily: fonts.bold, fontSize: 32, color: colors.text },
  summaryLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 4 },

  // Card
  card: {
    backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
    elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  vendorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  vendorPhoto: { width: 44, height: 44, borderRadius: 22 },
  vendorPhotoFb: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  vendorPhotoText: { fontFamily: fonts.bold, fontSize: 18, color: colors.white },
  vendorInfo: { marginLeft: 12, flex: 1 },
  vendorName: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  eventType: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },

  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stars: { fontSize: 16, color: colors.star },
  date: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },

  comment: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, lineHeight: 22 },

  photosRow: { marginTop: 12 },
  photosContent: { gap: 8 },
  photoThumb: { width: 80, height: 80, borderRadius: 8 },

  response: {
    marginTop: 12, padding: 12, backgroundColor: colors.cardBackground,
    borderRadius: 8, borderLeftWidth: 3, borderLeftColor: colors.accent,
  },
  responseLabel: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.accent, marginBottom: 4 },
  responseText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  // Empty
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 12 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  emptySub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
});
