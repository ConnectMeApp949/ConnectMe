import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeftIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'CancelBooking'>;

const CANCELLATION_REASONS = [
  'Change of plans',
  'Found another vendor',
  'Event cancelled',
  'Personal emergency',
  'Other',
] as const;

type CancellationReason = typeof CANCELLATION_REASONS[number];

interface PolicyTier {
  label: string;
  description: string;
  refundPercent: number;
}

const POLICY_TIERS: PolicyTier[] = [
  { label: 'More than 48 hours before event', description: 'Full refund', refundPercent: 100 },
  { label: 'Within 48 hours', description: '50% refund', refundPercent: 50 },
  { label: 'No-show', description: 'No refund', refundPercent: 0 },
];

function getApplicableTierIndex(eventDate: string | undefined): number {
  if (!eventDate) return 2;
  const now = new Date();
  const event = new Date(eventDate);
  const hoursUntilEvent = (event.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilEvent > 48) return 0;
  if (hoursUntilEvent > 0) return 1;
  return 2;
}

export default function CancelBookingScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const { token } = useAuth();
  const booking = route.params?.booking as any;
  const vendorName = booking?.vendor?.businessName ?? 'Unknown Vendor';
  const amount = Number(booking?.totalAmount ?? 0);
  const eventDate = booking?.eventDate
    ? new Date(booking.eventDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
  const [comments, setComments] = useState('');
  const [cancelled, setCancelled] = useState(false);

  const activeTierIndex = useMemo(
    () => getApplicableTierIndex(booking?.eventDate),
    [booking?.eventDate],
  );

  const refundPercent = POLICY_TIERS[activeTierIndex].refundPercent;
  const refundAmount = (amount * refundPercent) / 100;

  const canConfirm = selectedReason !== null;

  function handleCancel() {
    Alert.alert(
      'Are you sure?',
      `This will cancel your booking with ${vendorName}. You will receive a refund of $${refundAmount.toFixed(2)}.`,
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Yes, Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
              const res = await fetch(`${API_URL}/bookings/${booking?.id}/cancel`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                  reason: selectedReason,
                  comments,
                }),
              });
              if (!res.ok) {
                throw new Error(`Server error (${res.status})`);
              }
              const data = await res.json();
              if (!data.success) {
                throw new Error(data.error?.message || 'Cancellation failed');
              }
              setCancelled(true);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not cancel booking. Please try again.');
            }
          },
        },
      ],
    );
  }

  if (cancelled) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.successContainer}>
          <View style={s.successIconWrap}>
            <Text style={s.successIcon}>✓</Text>
          </View>
          <Text style={s.successTitle}>Booking Cancelled</Text>
          <Text style={s.successSub}>
            Your booking with {vendorName} has been cancelled.
          </Text>

          <View style={s.refundCard}>
            <Text style={s.refundCardTitle}>Refund Details</Text>
            <View style={s.refundRow}>
              <Text style={s.refundLabel}>Original Amount</Text>
              <Text style={s.refundValue}>${amount.toFixed(2)}</Text>
            </View>
            <View style={s.refundRow}>
              <Text style={s.refundLabel}>Refund ({refundPercent}%)</Text>
              <Text style={[s.refundValue, { color: colors.success }]}>
                ${refundAmount.toFixed(2)}
              </Text>
            </View>
            <Text style={s.refundNote}>
              Refunds are typically processed within 5-10 business days.
            </Text>
          </View>

          <TouchableOpacity
            style={s.backToBookingsBtn}
            activeOpacity={0.7}
            onPress={() => navigation.popToTop()}
            accessibilityLabel="Back to Bookings"
            accessibilityRole="button"
          >
            <Text style={s.backToBookingsBtnText}>Back to Bookings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.backBtn}
            activeOpacity={0.6}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: themeColors.text }]}>Cancel Booking</Text>
          <View style={s.headerSpacer} />
        </View>

        {/* Booking summary card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Booking Summary</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Vendor</Text>
            <Text style={s.summaryValue}>{vendorName}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Date</Text>
            <Text style={s.summaryValue}>{eventDate}</Text>
          </View>
          <View style={[s.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={s.summaryLabel}>Amount</Text>
            <Text style={s.summaryValue}>${amount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Cancellation policy */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Cancellation Policy</Text>
          {POLICY_TIERS.map((tier, index) => {
            const isActive = index === activeTierIndex;
            return (
              <View
                key={tier.label}
                style={[
                  s.policyRow,
                  isActive && s.policyRowActive,
                  index === POLICY_TIERS.length - 1 && { borderBottomWidth: 0 },
                ]}
                accessibilityLabel={`${tier.label}: ${tier.description}${isActive ? ', applies to your booking' : ''}`}
              >
                <View style={s.policyContent}>
                  <Text style={[s.policyLabel, isActive && s.policyLabelActive]}>
                    {tier.label}
                  </Text>
                  <Text style={[s.policyDesc, isActive && s.policyDescActive]}>
                    {tier.description}
                  </Text>
                </View>
                {isActive && (
                  <View style={s.policyBadge}>
                    <Text style={s.policyBadgeText}>Applies</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Refund estimate */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Refund Estimate</Text>
          <View style={s.refundEstimate}>
            <Text style={s.refundEstimateAmount}>${refundAmount.toFixed(2)}</Text>
            <Text style={s.refundEstimateDesc}>
              {refundPercent === 100
                ? 'Full refund to original payment method'
                : refundPercent === 50
                  ? '50% refund to original payment method'
                  : 'No refund applicable'}
            </Text>
          </View>
        </View>

        {/* Reason selection */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Reason for Cancellation</Text>
          {CANCELLATION_REASONS.map((reason) => {
            const selected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                style={s.reasonRow}
                activeOpacity={0.6}
                onPress={() => setSelectedReason(reason)}
                accessibilityLabel={reason}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
              >
                <View style={[s.radio, selected && s.radioSelected]}>
                  {selected && <View style={s.radioInner} />}
                </View>
                <Text style={[s.reasonText, selected && s.reasonTextSelected]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Additional comments */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Additional Comments (Optional)</Text>
          <TextInput
            style={s.textInput}
            placeholder="Tell us more about why you're cancelling..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={200}
            value={comments}
            onChangeText={setComments}
            textAlignVertical="top"
            accessibilityLabel="Additional comments"
            accessibilityHint="Optional, up to 200 characters"
          />
          <Text style={s.charCount}>{comments.length}/200</Text>
        </View>

        {/* Confirm cancellation */}
        <View style={s.confirmSection}>
          <TouchableOpacity
            style={[s.cancelBtn, !canConfirm && s.cancelBtnDisabled]}
            activeOpacity={0.7}
            onPress={handleCancel}
            disabled={!canConfirm}
            accessibilityLabel="Cancel this booking"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canConfirm }}
            accessibilityHint={
              canConfirm
                ? 'Tap to confirm cancellation'
                : 'Select a cancellation reason first'
            }
          >
            <Text
              style={[s.cancelBtnText, !canConfirm && s.cancelBtnTextDisabled]}
            >
              Cancel this booking
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  headerSpacer: { width: 44 },

  // Card
  card: {
    marginHorizontal: spacing.md + 4,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm + 4,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  summaryValue: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },

  // Policy
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: borderRadius.sm,
  },
  policyRowActive: {
    backgroundColor: colors.lightBlue,
    borderWidth: 1,
    borderColor: colors.accent,
    marginVertical: 4,
  },
  policyContent: { flex: 1 },
  policyLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  policyLabelActive: {
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  policyDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  policyDescActive: {
    color: colors.accent,
  },
  policyBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  policyBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.white,
  },

  // Refund estimate
  refundEstimate: { alignItems: 'center', paddingVertical: spacing.sm },
  refundEstimateAmount: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.success,
  },
  refundEstimateDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },

  // Reasons
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 4,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  reasonText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  reasonTextSelected: {
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  // Text input
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm + 4,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    minHeight: 80,
  },
  charCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },

  // Confirm
  confirmSection: {
    paddingHorizontal: spacing.md + 4,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.sm + 2,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelBtnDisabled: {
    backgroundColor: colors.border,
  },
  cancelBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
  },
  cancelBtnTextDisabled: {
    color: colors.textMuted,
  },

  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successIcon: {
    fontFamily: fonts.bold,
    fontSize: 36,
    color: colors.white,
  },
  successTitle: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  successSub: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  refundCard: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  refundCardTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm + 4,
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  refundLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  refundValue: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  refundNote: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  backToBookingsBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm + 2,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  backToBookingsBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
  },
});
