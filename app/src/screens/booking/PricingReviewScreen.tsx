import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import { BookingFlowParamList } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { CalendarIcon, ClockIcon, MapPinIcon, SparklesIcon, FileTextIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';

const SERVICE_FEE_RATE = 0.05;

const UNIT_LABELS: Record<string, string> = {
  PER_HOUR: 'per hour',
  PER_EVENT: 'per event',
  CUSTOM: 'custom',
};

type Props = NativeStackScreenProps<BookingFlowParamList, 'PricingReview'>;

export default function PricingReviewScreen({ navigation, route }: Props) {
  const { token } = useAuth();
  const { vendor, draft } = route.params;
  const [loading, setLoading] = useState(false);

  const basePrice = Number(vendor.basePrice);
  const serviceFee = parseFloat((basePrice * SERVICE_FEE_RATE).toFixed(2));
  const total = parseFloat((basePrice + serviceFee).toFixed(2));

  const eventDate = draft.eventDate ? new Date(draft.eventDate) : null;
  const startTime = draft.startTime ? new Date(draft.startTime) : null;
  const endTime = draft.endTime ? new Date(draft.endTime) : null;

  async function handleRequestBooking() {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services'}/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
          },
          body: JSON.stringify({
            vendorId: vendor.id,
            eventDate: draft.eventDate,
            eventStartTime: draft.startTime,
            eventEndTime: draft.endTime,
            eventLocation: draft.eventLocation,
            eventType: draft.eventType,
            guestCount: draft.guestCount,
            specialRequirements: draft.specialRequirements,
            totalAmount: basePrice,
          }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        Alert.alert('Error', data.error?.message || 'Failed to create booking');
        return;
      }

      navigation.navigate('Payment', {
        vendor,
        draft,
        clientSecret: data.data.clientSecret,
        bookingId: data.data.booking.id,
      });
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function showFeeInfo() {
    Alert.alert(
      'Service Fee',
      'ConnectMe charges a 5% service fee to cover platform costs, secure payments, and customer support. This fee helps us maintain a reliable marketplace for both clients and vendors.'
    );
  }

  return (
    <ProfileSetupLayout
      step={4}
      totalSteps={6}
      title="Review your booking"
      onBack={() => navigation.goBack()}
      onContinue={handleRequestBooking}
      continueLabel="Request Booking"
      continueLoading={loading}
    >
      {/* Summary card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{vendor.businessName}</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailIconWrap}>
            <CalendarIcon size={16} color={colors.textSecondary} />
          </View>
          <Text style={styles.detailText}>
            {eventDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIconWrap}>
            <ClockIcon size={16} color={colors.textSecondary} />
          </View>
          <Text style={styles.detailText}>
            {startTime?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            {' – '}
            {endTime?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIconWrap}>
            <MapPinIcon size={16} color={colors.textSecondary} />
          </View>
          <Text style={styles.detailText}>{draft.eventLocation}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIconWrap}>
            <SparklesIcon size={16} color={colors.textSecondary} />
          </View>
          <Text style={styles.detailText}>{draft.eventType} · {draft.guestCount} guests</Text>
        </View>

        {draft.specialRequirements ? (
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <FileTextIcon size={16} color={colors.textSecondary} />
            </View>
            <Text style={styles.detailText} numberOfLines={2}>{draft.specialRequirements}</Text>
          </View>
        ) : null}
      </View>

      {/* Price breakdown */}
      <View style={styles.priceSection}>
        <Text style={styles.priceSectionTitle}>Price details</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            {vendor.businessName} ({UNIT_LABELS[vendor.priceUnit] ?? ''})
          </Text>
          <Text style={styles.priceValue}>${basePrice.toFixed(2)}</Text>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.feeRow}>
            <Text style={styles.priceLabel}>ConnectMe service fee</Text>
            <TouchableOpacity onPress={showFeeInfo}>
              <Text style={styles.infoIcon}>ⓘ</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.priceValue}>${serviceFee.toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Note */}
      <View style={styles.note}>
        <Text style={styles.noteText}>
          Vendor will confirm within 24 hours. You will not be charged until the vendor confirms.
        </Text>
      </View>
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  detailIconWrap: {
    width: 20,
    marginTop: 2,
  },
  detailText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
  },
  priceSection: {
    marginBottom: spacing.lg,
  },
  priceSectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  priceLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
  },
  priceValue: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoIcon: {
    fontSize: 16,
    color: colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.primary,
  },
  note: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  noteText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.accent,
    lineHeight: 20,
  },
});
