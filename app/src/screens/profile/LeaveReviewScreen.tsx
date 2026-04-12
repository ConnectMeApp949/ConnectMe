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
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
const MAX_COMMENT_LENGTH = 500;
const MAX_PHOTOS = 3;

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

const CATEGORY_RATINGS = ['Communication', 'Quality', 'Value', 'Punctuality'] as const;

type Props = NativeStackScreenProps<any, 'LeaveReview'>;

export default function LeaveReviewScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const { token } = useAuth();
  const vendor = route.params?.vendor as any;
  const bookingDate = route.params?.bookingDate as string | undefined;
  const bookingId = route.params?.bookingId as string | undefined;

  const vendorName = vendor?.businessName ?? 'Unknown Vendor';
  const category = vendor?.category?.replace(/_/g, ' ') ?? '';
  const coverPhoto = vendor?.coverPhoto ?? null;

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
  const [photos, setPhotos] = useState<string[]>([]);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setCategoryRating(cat: string, rating: number) {
    setCategoryRatings((prev) => ({ ...prev, [cat]: rating }));
  }

  async function pickImages() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to add photos.');
      return;
    }

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      Alert.alert('Limit reached', `You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris].slice(0, MAX_PHOTOS));
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (overallRating === 0) return;

    setSubmitting(true);
    try {
      const body: any = {
        rating: overallRating,
        comment: comment.trim() || null,
        wouldRecommend,
        categoryRatings:
          Object.keys(categoryRatings).length > 0 ? categoryRatings : null,
        photos: photos.length > 0 ? photos : null,
      };

      if (bookingId) {
        body.bookingId = bookingId;
      }

      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert('Review submitted', 'Thank you for your feedback!', [
          {
            text: 'Share Your Experience',
            onPress: async () => {
              try {
                await Share.share({
                  message: `I just reviewed ${vendorName} on ConnectMe -- ${overallRating} stars!`,
                  url: `https://connectmeapp.services/vendor/${vendor?.id}`,
                });
              } catch {
                // User cancelled share
              }
              navigation.goBack();
            },
          },
          { text: 'Done', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', data.message ?? 'Unable to submit review. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Unable to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.6}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={[s.backText, { color: themeColors.text }]}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Leave a Review</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Vendor info card */}
        <View style={s.card}>
          <View style={s.vendorRow}>
            {coverPhoto ? (
              <Image
                source={{ uri: coverPhoto }}
                style={s.vendorPhoto}
                accessibilityLabel={`${vendorName} photo`}
                accessibilityRole="image"
              />
            ) : (
              <View style={s.vendorPhotoFb}>
                <Text style={s.vendorPhotoText}>{vendorName[0]}</Text>
              </View>
            )}
            <View style={s.vendorInfo}>
              <Text style={s.vendorName}>{vendorName}</Text>
              {category !== '' && <Text style={s.vendorCategory}>{category}</Text>}
              {formattedDate !== '' && <Text style={s.bookingDate}>{formattedDate}</Text>}
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
            placeholder="Tell others about your experience..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={MAX_COMMENT_LENGTH}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
            accessibilityLabel="Review text"
            accessibilityHint="Write about your experience, up to 500 characters"
          />
          <Text style={s.charCounter}>
            {comment.length}/{MAX_COMMENT_LENGTH}
          </Text>
        </View>

        {/* Photo attachment */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Add Photos (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoScroll}>
            {photos.map((uri, index) => (
              <View key={uri} style={s.photoThumbWrap}>
                <Image
                  source={{ uri }}
                  style={s.photoThumb}
                  accessibilityLabel={`Attached photo ${index + 1}`}
                  accessibilityRole="image"
                />
                <TouchableOpacity
                  style={s.photoRemoveBtn}
                  onPress={() => removePhoto(index)}
                  activeOpacity={0.6}
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  accessibilityRole="button"
                >
                  <Text style={s.photoRemoveText}>{'\u00D7'}</Text>
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity
                style={s.addPhotoBtn}
                onPress={pickImages}
                activeOpacity={0.7}
                accessibilityLabel="Add photos"
                accessibilityRole="button"
                accessibilityHint={`Add up to ${MAX_PHOTOS - photos.length} more photo${MAX_PHOTOS - photos.length > 1 ? 's' : ''}`}
              >
                <Text style={s.addPhotoIcon}>{'\uFF0B'}</Text>
                <Text style={s.addPhotoText}>Add photos</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
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

        {/* Would you recommend? */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Would you recommend this vendor?</Text>
          <View style={s.recommendRow}>
            <TouchableOpacity
              style={[
                s.recommendBtn,
                wouldRecommend === true && s.recommendBtnActive,
              ]}
              onPress={() => setWouldRecommend(true)}
              activeOpacity={0.7}
              accessibilityLabel="Yes, I would recommend"
              accessibilityRole="button"
              accessibilityState={{ selected: wouldRecommend === true }}
            >
              <Text
                style={[
                  s.recommendBtnText,
                  wouldRecommend === true && s.recommendBtnTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.recommendBtn,
                wouldRecommend === false && s.recommendBtnActiveNo,
              ]}
              onPress={() => setWouldRecommend(false)}
              activeOpacity={0.7}
              accessibilityLabel="No, I would not recommend"
              accessibilityRole="button"
              accessibilityState={{ selected: wouldRecommend === false }}
            >
              <Text
                style={[
                  s.recommendBtnText,
                  wouldRecommend === false && s.recommendBtnTextActive,
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

  // Vendor info
  vendorRow: { flexDirection: 'row', alignItems: 'center' },
  vendorPhoto: { width: 52, height: 52, borderRadius: 26 },
  vendorPhotoFb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorPhotoText: { fontFamily: fonts.bold, fontSize: 20, color: colors.white },
  vendorInfo: { marginLeft: spacing.sm + spacing.xs, flex: 1 },
  vendorName: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text },
  vendorCategory: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
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

  // Photos
  photoScroll: { marginTop: spacing.xs },
  photoThumbWrap: { position: 'relative', marginRight: spacing.sm },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: { color: colors.white, fontSize: 16, fontFamily: fonts.bold, lineHeight: 18 },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
  },
  addPhotoIcon: { fontSize: 24, color: colors.textMuted },
  addPhotoText: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted, marginTop: 2 },

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

  // Recommend
  recommendRow: { flexDirection: 'row', gap: spacing.sm },
  recommendBtn: {
    flex: 1,
    paddingVertical: spacing.sm + spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  recommendBtnActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  recommendBtnActiveNo: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  recommendBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  recommendBtnTextActive: { color: colors.white },

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
