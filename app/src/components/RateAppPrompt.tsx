import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { StarIcon, StarOutlineIcon } from './Icons';
import { colors, fonts, spacing, borderRadius } from '../theme';

const HAS_RATED_KEY = 'hasRatedApp';
const RATE_APP_OPEN_COUNT_KEY = 'rateAppOpenCount';
// Use StoreReview API instead of raw URL to avoid broken links and comply with Apple guidelines
let StoreReview: any = null;
try { StoreReview = require('expo-store-review'); } catch { /* unavailable */ }

interface RateAppPromptProps {
  onNavigateToHelp: () => void;
}

export default function RateAppPrompt({ onNavigateToHelp }: RateAppPromptProps) {
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [showFollowUp, setShowFollowUp] = useState(false);

  useEffect(() => {
    checkVisibility();
  }, []);

  async function checkVisibility() {
    try {
      const hasRated = await SecureStore.getItemAsync(HAS_RATED_KEY);
      if (hasRated === 'true') return;

      // Show after 3 app opens (mocked as counter)
      const countStr = await SecureStore.getItemAsync(RATE_APP_OPEN_COUNT_KEY);
      const count = countStr ? parseInt(countStr, 10) + 1 : 1;
      await SecureStore.setItemAsync(RATE_APP_OPEN_COUNT_KEY, count.toString());

      if (count >= 3) {
        setVisible(true);
      }
    } catch {
      // Silently ignore SecureStore errors
    }
  }

  async function handleDismiss() {
    try {
      await SecureStore.setItemAsync(HAS_RATED_KEY, 'true');
    } catch {
      // Ignore
    }
    setVisible(false);
    setRating(0);
    setShowFollowUp(false);
  }

  function handleStarPress(star: number) {
    setRating(star);
    setShowFollowUp(true);
  }

  async function handleRateOnStore() {
    try {
      if (StoreReview && await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      }
    } catch {
      // Review request failed
    }
    handleDismiss();
  }

  function handleTellUsMore() {
    handleDismiss();
    onNavigateToHelp();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <Pressable
        style={styles.overlay}
        onPress={handleDismiss}
        accessibilityLabel="Close rating prompt"
        accessibilityRole="button"
      >
        <Pressable
          style={styles.card}
          onPress={() => {}}
          accessibilityRole="alert"
          accessibilityLabel="Rate ConnectMe"
        >
          <View style={styles.iconWrap}>
            <StarIcon size={28} color={colors.star} strokeWidth={1.5} />
          </View>

          <Text style={styles.title}>Enjoying ConnectMe?</Text>
          <Text style={styles.subtitle}>
            Your feedback helps us improve and helps other users find us.
          </Text>

          {/* Star rating row */}
          <View
            style={styles.starsRow}
            accessibilityRole="adjustable"
            accessibilityLabel={`Rating, ${rating} of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleStarPress(star)}
                activeOpacity={0.6}
                accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}
                accessibilityRole="button"
                accessibilityState={{ selected: star <= rating }}
                style={styles.starBtn}
              >
                {star <= rating ? (
                  <StarIcon size={36} color={colors.star} strokeWidth={1.5} />
                ) : (
                  <StarOutlineIcon size={36} color={colors.border} strokeWidth={1.5} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Follow-up action based on rating */}
          {showFollowUp && rating >= 4 && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleRateOnStore}
              activeOpacity={0.7}
              accessibilityLabel="Rate us on the App Store"
              accessibilityRole="button"
              accessibilityHint="Opens the App Store to leave a review"
            >
              <Text style={styles.primaryBtnText}>Rate us on the App Store</Text>
            </TouchableOpacity>
          )}

          {showFollowUp && rating >= 1 && rating <= 3 && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleTellUsMore}
              activeOpacity={0.7}
              accessibilityLabel="Tell us how to improve"
              accessibilityRole="button"
              accessibilityHint="Opens the help screen to send feedback"
            >
              <Text style={styles.primaryBtnText}>Tell us how to improve</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleDismiss}
            activeOpacity={0.6}
            accessibilityLabel="Maybe later"
            accessibilityRole="button"
            accessibilityHint="Dismisses the rating prompt"
          >
            <Text style={styles.dismissText}>Maybe later</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  starBtn: {
    padding: spacing.xs,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  },
  dismissText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    paddingVertical: spacing.xs,
  },
});
