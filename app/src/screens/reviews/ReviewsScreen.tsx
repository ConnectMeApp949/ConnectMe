import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  vendorResponse: string | null;
  createdAt: string;
  client: { firstName: string; avatarInitial: string; profilePhoto: string | null };
}

const TABS = [
  { label: 'All', value: null },
  { label: '5 ★', value: 5 },
  { label: '4 ★', value: 4 },
  { label: '≤3 ★', value: 3 },
];

function Stars({ rating }: { rating: number }) {
  const { colors: themeColors } = useTheme();
  return (
    <Text style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ color: i <= rating ? themeColors.star : themeColors.border }}>★</Text>
      ))}
    </Text>
  );
}
const starStyles = StyleSheet.create({ row: { fontSize: 14 } });

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const { colors: themeColors } = useTheme();
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={barStyles.row}>
      <Text style={[barStyles.label, { color: themeColors.textSecondary }]}>{stars}</Text>
      <View style={[barStyles.track, { backgroundColor: themeColors.border }]}>
        <View style={[barStyles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={[barStyles.count, { color: themeColors.textMuted }]}>{count}</Text>
    </View>
  );
}
const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, width: 14, textAlign: 'center' },
  track: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, marginHorizontal: spacing.sm, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.star, borderRadius: 4 },
  count: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, width: 28, textAlign: 'right' },
});

type Props = NativeStackScreenProps<any, 'Reviews'>;

export default function ReviewsScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const { vendorId } = route.params as { vendorId: string };
  const [reviews, setReviews] = useState<Review[]>([]);
  const [breakdown, setBreakdown] = useState<Record<number, number>>({});
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = useCallback(async (p: number, ratingFilter: number | null) => {
    try {
      const params = new URLSearchParams({ page: String(p), sort: 'newest' });
      if (ratingFilter) params.set('rating', String(ratingFilter));
      const res = await fetch(`${API_URL}/reviews/vendor/${vendorId}?${params}`);
      const data = await res.json();

      if (data.success) {
        setAvgRating(data.data.averageRating);
        setTotalReviews(data.data.totalReviews);
        setBreakdown(data.data.ratingBreakdown);
        if (p === 1) setReviews(data.data.reviews);
        else setReviews((prev) => [...prev, ...data.data.reviews]);
        setHasMore(p < (data.meta?.totalPages ?? 1));
      }
    } catch { /* handle */ }
    finally { setLoading(false); }
  }, [vendorId]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchReviews(1, activeTab);
  }, [activeTab, fetchReviews]);

  function loadMore() {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchReviews(next, activeTab);
  }

  function renderReview({ item }: { item: Review }) {
    const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return (
      <View style={[styles.reviewCard, { borderBottomColor: themeColors.border }]}>
        <View style={styles.reviewHeader}>
          {item.client.profilePhoto ? (
            <Image source={{ uri: item.client.profilePhoto }} style={styles.reviewAvatar} />
          ) : (
            <View style={styles.reviewAvatarFallback}>
              <Text style={styles.reviewAvatarText}>{item.client.avatarInitial}</Text>
            </View>
          )}
          <View style={styles.reviewMeta}>
            <Text style={[styles.reviewName, { color: themeColors.text }]}>{item.client.firstName}</Text>
            <Text style={[styles.reviewDate, { color: themeColors.textMuted }]}>{date}</Text>
          </View>
          <Stars rating={item.rating} />
        </View>

        {item.comment && <Text style={[styles.reviewComment, { color: themeColors.text }]}>{item.comment}</Text>}

        {item.vendorResponse && (
          <View style={[styles.response, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={styles.responseLabel}>Vendor response</Text>
            <Text style={[styles.responseText, { color: themeColors.textSecondary }]}>{item.vendorResponse}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Reviews</Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            {/* Rating summary */}
            <View style={styles.summary}>
              <View style={styles.summaryLeft}>
                <Text style={[styles.avgRating, { color: themeColors.text }]}>{avgRating.toFixed(1)}</Text>
                <Stars rating={Math.round(avgRating)} />
                <Text style={[styles.totalText, { color: themeColors.textMuted }]}>{totalReviews} reviews</Text>
              </View>
              <View style={styles.summaryRight}>
                {[5, 4, 3, 2, 1].map((s) => (
                  <RatingBar key={s} stars={s} count={breakdown[s] ?? 0} total={totalReviews} />
                ))}
              </View>
            </View>

            {/* Filter tabs */}
            <View style={styles.tabRow}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.label}
                  style={[styles.tab, { borderColor: themeColors.border }, activeTab === tab.value && styles.tabActive]}
                  onPress={() => setActiveTab(tab.value)}
                >
                  <Text style={[styles.tabText, { color: themeColors.text }, activeTab === tab.value && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListFooterComponent={loading ? <ActivityIndicator color={themeColors.primary} style={styles.loader} /> : null}
        ListEmptyComponent={!loading ? (
          <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>No reviews match this filter</Text>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  list: { padding: spacing.lg },

  // Summary
  summary: { flexDirection: 'row', marginBottom: spacing.lg, gap: spacing.lg },
  summaryLeft: { alignItems: 'center', justifyContent: 'center', minWidth: 80 },
  avgRating: { fontFamily: fonts.bold, fontSize: 44, color: colors.text },
  totalText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  summaryRight: { flex: 1, justifyContent: 'center' },

  // Tabs
  tabRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  tabTextActive: { color: colors.white },

  // Review card
  reviewCard: { marginBottom: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: spacing.sm },
  reviewAvatarFallback: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
  },
  reviewAvatarText: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
  reviewMeta: { flex: 1 },
  reviewName: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  reviewDate: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  reviewComment: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, lineHeight: 22 },
  response: {
    marginTop: spacing.sm, padding: spacing.md, backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.sm, borderLeftWidth: 3, borderLeftColor: colors.accent,
  },
  responseLabel: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.accent, marginBottom: spacing.xs },
  responseText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  loader: { paddingVertical: spacing.lg },
  emptyText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
});
