import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
const MAX_COMMENT_LENGTH = 300;

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

const CATEGORY_RATINGS = ['Communication', 'Punctuality', 'Respect'] as const;

type Props = NativeStackScreenProps<any, 'ReviewClient'>;

export default function ReviewClientScreen({ navigation, route }: Props) {
  const client = route.params?.client as any;
  const bookingDate = route.params?.bookingDate as string | undefined;

  const clientName = client?.name ?? client?.displayName ?? 'Unknown Client';
  const clientAvatar = client?.avatar ?? client?.profilePhoto ?? null;

  const formattedDate = bookingDate
    ? new Date(bookingDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // State
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState('');
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [wouldWorkAgain, setWouldWorkAgain] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setCategoryRating(cat: string, rating: number) {
    setCategoryRatings((prev) => ({ ...prev, [cat]: rating }));
  }

  async function handleSubmit() {
    if (overallRating === 0) return;

    setSubmitting(true);
    try {
      const body: any = {
        clientId: client?.id,
        rating: overallRating,
        comment: comment.trim() || null,
        wouldWorkAgain,
        categoryRatings:
          Object.keys(categoryRatings).length > 0 ? categoryRatings : null,
      };

      const res = await fetch(`${API_URL}/reviews/client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert(
          'Review Submitted',
          'Thank you for your feedback!',
          [
            {
              text: 'Share Your Experience',
              onPress: handleShareAfterReview,
            },
            {
              text: 'Done',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        Alert.alert('Error', data.message ?? 'Unable to submit review. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Unable to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleShareAfterReview() {
    try {
      await Share.share({
        message: `I just reviewed a client on ConnectMe -- ${overallRating} stars! ConnectMe makes it easy to manage bookings and reviews.`,
      });
    } catch {
      // User cancelled share
    }
    navigation.goBack();
  }

  // ─── Star rendering helpers ────────────────────────────

  function renderStars(
    rating: number,
    onSelect: (r: number) => void,
    size: number,
    label: string,
  ) {
    return (
      <View style={s.starsRow} accessibilityRole="adjustable" accessibilityLabel={`${label}, ${rating} of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onSelect(star)}
            activeOpacity={0.6}
            accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}
            accessibilityRole="button"
            accessibilityState={{ selected: star <= rating }}
            style={{ padding: spacing.xs }}
          >
            <Text style={{ fontSize: size, color: star <= rating ? colors.star : colors.border }}>
              {star <= rating ? '\u2605' : '\u2606'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  const canSubmit = overallRating > 0 && !submitting;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.6}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={s.backText}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Review Client</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Client info card */}
        <View style={s.card}>
          <View style={s.clientRow}>
            {clientAvatar ? (
              <Image
                source={{ uri: clientAvatar }}
                style={s.clientPhoto}
                accessibilityLabel={`${clientName} photo`}
                accessibilityRole="image"
              />
            ) : (
              <View style={s.clientPhotoFb}>
                <Text style={s.clientPhotoText}>{clientName[0]}</Text>
              </View>
            )}
            <View style={s.clientInfo}>
              <Text style={s.clientName}>{clientName}</Text>
              {formattedDate !== '' && <Text style={s.bookingDate}>Booking: {formattedDate}</Text>}
            </View>
          </View>
        </View>

        {/* Overall star rating */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Overall Rating</Text>
          {renderStars(overallRating, setOverallRating, 36, 'Overall rating')}
          {overallRating > 0 && (
            <Text style={s.ratingLabel}>{RATING_LABELS[overallRating]}</Text>
          )}
        </View>

        {/* Review text */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Your Review</Text>
          <TextInput
            style={s.textInput}
            placeholder="How was your experience with this client?"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={MAX_COMMENT_LENGTH}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
            accessibilityLabel="Review text"
            accessibilityHint="Write about your experience with this client, up to 300 characters"
          />
          <Text style={s.charCounter}>
            {comment.length}/{MAX_COMMENT_LENGTH}
          </Text>
        </View>

        {/* Category ratings */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Rate by Category (optional)</Text>
          {CATEGORY_RATINGS.map((cat) => (
            <View key={cat} style={s.categoryRow}>
              <Text style={s.categoryLabel}>{cat}</Text>
              {renderStars(
                categoryRatings[cat] ?? 0,
                (r) => setCategoryRating(cat, r),
                20,
                `${cat} rating`,
              )}
            </View>
          ))}
        </View>

        {/* Would you work with them again? */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Would you work with them again?</Text>
          <View style={s.toggleRow}>
            <TouchableOpacity
              style={[
                s.toggleBtn,
                wouldWorkAgain === true && s.toggleBtnActiveYes,
              ]}
              onPress={() => setWouldWorkAgain(true)}
              activeOpacity={0.7}
              accessibilityLabel="Yes, I would work with them again"
              accessibilityRole="button"
              accessibilityState={{ selected: wouldWorkAgain === true }}
            >
              <Text
                style={[
                  s.toggleBtnText,
                  wouldWorkAgain === true && s.toggleBtnTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.toggleBtn,
                wouldWorkAgain === false && s.toggleBtnActiveNo,
              ]}
              onPress={() => setWouldWorkAgain(false)}
              activeOpacity={0.7}
              accessibilityLabel="No, I would not work with them again"
              accessibilityRole="button"
              accessibilityState={{ selected: wouldWorkAgain === false }}
            >
              <Text
                style={[
                  s.toggleBtnText,
                  wouldWorkAgain === false && s.toggleBtnTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.7}
          accessibilityLabel="Submit Review"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={s.submitBtnText}>Submit Review</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },

  scrollContent: { padding: spacing.lg },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  // Client info
  clientRow: { flexDirection: 'row', alignItems: 'center' },
  clientPhoto: { width: 52, height: 52, borderRadius: 26 },
  clientPhotoFb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientPhotoText: { fontFamily: fonts.bold, fontSize: 20, color: colors.white },
  clientInfo: { marginLeft: spacing.sm + spacing.xs, flex: 1 },
  clientName: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text },
  bookingDate: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Stars
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  ratingLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.star,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Text input
  textInput: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm + spacing.xs,
    lineHeight: 22,
    backgroundColor: colors.cardBackground,
  },
  charCounter: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },

  // Category ratings
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },

  // Toggle (would work again)
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm + spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toggleBtnActiveYes: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  toggleBtnActiveNo: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  toggleBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  toggleBtnTextActive: { color: colors.white },

  // Submit
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
});
