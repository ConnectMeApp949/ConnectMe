import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Image, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeftIcon, SparklesIcon } from '../../components/Icons';
import { apiHeaders } from '../../services/headers';

type Props = NativeStackScreenProps<any, 'Tip'>;

const TIP_PERCENTAGES = [10, 15, 20, 25] as const;

export default function TipScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const { token } = useAuth();
  const booking = route.params?.booking as any;
  const vendor = booking?.vendor;
  const vendorName = vendor?.businessName ?? 'Your Vendor';
  const coverPhoto = vendor?.coverPhoto ?? null;
  const totalAmount = Number(booking?.totalAmount ?? 0);

  const eventDate = booking?.eventDate
    ? new Date(booking.eventDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const [selectedPercent, setSelectedPercent] = useState<number | null>(15);
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [noTip, setNoTip] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function getTipAmount(): number {
    if (noTip) return 0;
    if (isCustom) {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
    if (selectedPercent !== null) {
      return Math.round(totalAmount * (selectedPercent / 100) * 100) / 100;
    }
    return 0;
  }

  const tipAmount = getTipAmount();

  function handleSelectPercent(pct: number) {
    setSelectedPercent(pct);
    setIsCustom(false);
    setNoTip(false);
  }

  function handleCustom() {
    setIsCustom(true);
    setSelectedPercent(null);
    setNoTip(false);
  }

  function handleNoTip() {
    setNoTip(true);
    setSelectedPercent(null);
    setIsCustom(false);
    setCustomAmount('');
  }

  async function handleSubmit() {
    if (tipAmount <= 0 && !noTip) {
      Alert.alert('Invalid Amount', 'Please select or enter a tip amount.');
      return;
    }

    setSubmitting(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
      const res = await fetch(`${API_URL}/bookings/${booking?.id}/tip`, {
        method: 'POST',
        headers: apiHeaders(token),
        body: JSON.stringify({
          amount: tipAmount,
          message: message.trim() || undefined,
        }),
      });
      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Tip failed');
      }
      setSuccess(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unable to send tip. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
        <View style={s.successContainer}>
          <View style={[s.successIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <SparklesIcon size={36} color={colors.primary} />
          </View>
          <Text style={[s.successTitle, { color: themeColors.text }]}>Tip Sent!</Text>
          <Text style={[s.successMessage, { color: themeColors.textSecondary }]}>
            Thank you for your generosity. The vendor will receive your tip
            within 2-3 business days.
          </Text>
          <TouchableOpacity
            style={s.doneBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Done"
            accessibilityRole="button"
          >
            <Text style={s.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Leave a Tip</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Vendor info */}
        <View style={[s.vendorCard, { backgroundColor: themeColors.cardBackground }]}>
          {coverPhoto ? (
            <Image
              source={{ uri: coverPhoto }}
              style={s.vendorPhoto}
              accessibilityLabel={`${vendorName} photo`}
              accessibilityRole="image"
            />
          ) : (
            <View style={s.vendorPhotoFallback}>
              <Text style={s.vendorPhotoText}>{vendorName[0]}</Text>
            </View>
          )}
          <View style={s.vendorInfo}>
            <Text style={[s.vendorName, { color: themeColors.text }]}>{vendorName}</Text>
            {eventDate ? (
              <Text style={[s.serviceDate, { color: themeColors.textSecondary }]}>Service on {eventDate}</Text>
            ) : null}
            <Text style={[s.bookingTotal, { color: themeColors.textSecondary }]}>
              Booking total: ${totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Tip amount selection */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: themeColors.text }]}>Select tip amount</Text>

          <View style={s.percentRow}>
            {TIP_PERCENTAGES.map((pct) => {
              const active = selectedPercent === pct && !isCustom && !noTip;
              const dollarValue = Math.round(totalAmount * (pct / 100) * 100) / 100;
              return (
                <TouchableOpacity
                  key={pct}
                  style={[s.percentBtn, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }, active && s.percentBtnActive]}
                  onPress={() => handleSelectPercent(pct)}
                  activeOpacity={0.7}
                  accessibilityLabel={`${pct} percent tip, $${dollarValue.toFixed(2)}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[s.percentText, { color: themeColors.text }, active && s.percentTextActive]}
                  >
                    {pct}%
                  </Text>
                  <Text
                    style={[s.percentDollar, { color: themeColors.textSecondary }, active && s.percentDollarActive]}
                  >
                    ${dollarValue.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Custom button */}
            <TouchableOpacity
              style={[s.percentBtn, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }, isCustom && s.percentBtnActive]}
              onPress={handleCustom}
              activeOpacity={0.7}
              accessibilityLabel="Custom tip amount"
              accessibilityRole="button"
              accessibilityState={{ selected: isCustom }}
            >
              <Text style={[s.percentText, { color: themeColors.text }, isCustom && s.percentTextActive]}>
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {/* Custom amount input */}
          {isCustom && (
            <View style={s.customInputWrap}>
              <Text style={s.dollarSign}>$</Text>
              <TextInput
                style={[s.customInput, { color: themeColors.text }]}
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder="0.00"
                placeholderTextColor={themeColors.textSecondary}
                keyboardType="decimal-pad"
                returnKeyType="done"
                accessibilityLabel="Custom tip amount in dollars"
                accessibilityHint="Enter a custom dollar amount for the tip"
              />
            </View>
          )}

          {/* No tip option */}
          <TouchableOpacity
            style={[s.noTipBtn, { borderColor: themeColors.border }, noTip && s.noTipBtnActive]}
            onPress={handleNoTip}
            activeOpacity={0.7}
            accessibilityLabel="No tip"
            accessibilityRole="button"
            accessibilityState={{ selected: noTip }}
          >
            <Text style={[s.noTipText, noTip && { color: themeColors.text }]}>
              No tip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tip message */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: themeColors.text }]}>Add a note (optional)</Text>
          <TextInput
            style={[s.messageInput, { color: themeColors.text, borderColor: themeColors.border }]}
            value={message}
            onChangeText={(t) => setMessage(t.slice(0, 100))}
            placeholder="Add a note for the vendor"
            placeholderTextColor={themeColors.textSecondary}
            multiline
            maxLength={100}
            accessibilityLabel="Tip note for the vendor"
            accessibilityHint="Optional message to include with your tip, up to 100 characters"
          />
          <Text style={[s.charCount, { color: themeColors.textSecondary }]}>{message.length}/100</Text>
        </View>

        {/* Payment summary */}
        {!noTip && tipAmount > 0 && (
          <View style={[s.summaryCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <Text style={[s.summaryTitle, { color: themeColors.text }]}>Payment Summary</Text>
            <View style={s.summaryRow}>
              <Text style={[s.summaryLabel, { color: themeColors.textSecondary }]}>Tip amount</Text>
              <Text style={[s.summaryValue, { color: themeColors.text }]}>${tipAmount.toFixed(2)}</Text>
            </View>
            <View style={[s.summaryDivider, { backgroundColor: themeColors.border }]} />
            <View style={s.summaryRow}>
              <Text style={[s.summaryLabel, { color: themeColors.textSecondary }]}>Payment method</Text>
              <Text style={[s.summaryValue, { color: themeColors.text }]}>{booking?.paymentMethodLabel ?? 'Card on file'}</Text>
            </View>
          </View>
        )}

        {/* Submit button */}
        <TouchableOpacity
          style={[
            s.submitBtn,
            (noTip || submitting) && s.submitBtnDisabled,
          ]}
          onPress={noTip ? () => navigation.goBack() : handleSubmit}
          activeOpacity={0.7}
          disabled={submitting}
          accessibilityLabel={noTip ? 'Skip tip and go back' : `Send $${tipAmount.toFixed(2)} tip`}
          accessibilityRole="button"
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={s.submitBtnText}>
              {noTip ? 'Continue Without Tip' : `Send Tip — $${tipAmount.toFixed(2)}`}
            </Text>
          )}
        </TouchableOpacity>

        {/* Skip link */}
        <TouchableOpacity
          style={s.skipLink}
          onPress={() => navigation.goBack()}
          activeOpacity={0.6}
          accessibilityLabel="Maybe later, skip leaving a tip"
          accessibilityRole="button"
        >
          <Text style={[s.skipText, { color: themeColors.textSecondary }]}>Maybe later</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
  },

  // Vendor card
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  vendorPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  vendorPhotoFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorPhotoText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.white,
  },
  vendorInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  vendorName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  serviceDate: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bookingTotal: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  // Percent buttons
  percentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  percentBtn: {
    flex: 1,
    minWidth: 70,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  percentBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.lightBlue,
  },
  percentText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  percentTextActive: {
    color: colors.primary,
  },
  percentDollar: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  percentDollarActive: {
    color: colors.accent,
  },

  // Custom input
  customInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.lightBlue,
  },
  dollarSign: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  customInput: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.text,
    paddingVertical: spacing.md,
  },

  // No tip
  noTipBtn: {
    marginTop: spacing.sm,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  noTipBtnActive: {
    borderColor: colors.textMuted,
    backgroundColor: colors.cardBackground,
  },
  noTipText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  noTipTextActive: {
    color: colors.text,
  },

  // Message input
  messageInput: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },

  // Summary card
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
  },

  // Submit
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  submitBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  },

  // Skip
  skipLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skipText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },

  // Success
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.md,
  },
  successTitle: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  successMessage: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.sm,
  },
  doneBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  },
});
