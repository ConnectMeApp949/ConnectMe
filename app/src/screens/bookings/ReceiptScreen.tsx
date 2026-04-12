import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeftIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'Receipt'>;

export default function ReceiptScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const { token } = useAuth();
  const booking = route.params?.booking as any;
  const vendor = booking?.vendor;
  const vendorName = vendor?.businessName ?? 'Unknown Vendor';
  const category = vendor?.category?.replace(/_/g, ' ') ?? '';
  const totalAmount = Number(booking?.totalAmount ?? 0);
  const eventDate = booking?.eventDate
    ? new Date(booking.eventDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const startTime = booking?.eventStartTime
    ? new Date(booking.eventStartTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';
  const endTime = booking?.eventEndTime
    ? new Date(booking.eventEndTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';
  const location = booking?.eventLocation ?? 'N/A';
  const bookingId = booking?.id ?? 'N/A';

  const receiptNumber = useMemo(() => {
    const digits = Math.floor(100000 + Math.random() * 900000);
    return `CM-${digits}`;
  }, []);

  // Price breakdown
  const serviceFeeRate = 0.05;
  const promoDiscount = Number(booking?.promoDiscount ?? 0);
  const basePrice = totalAmount / (1 + serviceFeeRate) + promoDiscount;
  const serviceFee = basePrice * serviceFeeRate;
  const computedTotal = basePrice + serviceFee - promoDiscount;

  const paymentDate = booking?.paymentDate
    ? new Date(booking.paymentDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : eventDate;

  async function handleDownloadPdf() {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
      const res = await fetch(`${API_URL}/bookings/${bookingId}/receipt-pdf`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Download failed');
      Alert.alert('Receipt Downloaded', 'Your receipt PDF has been saved to your device.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not download receipt. Please try again.');
    }
  }

  async function handleEmailReceipt() {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
      const res = await fetch(`${API_URL}/bookings/${bookingId}/email-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Email failed');
      Alert.alert('Receipt Sent', 'Receipt has been sent to your email address.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send receipt. Please try again.');
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `ConnectMe Receipt ${receiptNumber}\n\nVendor: ${vendorName}\nDate: ${eventDate}\nTotal: $${computedTotal.toFixed(2)}\n\nThank you for using ConnectMe!`,
      });
    } catch {
      // User cancelled or error
    }
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
          <Text style={[s.headerTitle, { color: themeColors.text }]}>Receipt</Text>
          <View style={s.backBtn} />
        </View>

        {/* Branding area */}
        <View style={s.brandingArea}>
          <Text style={s.brandName}>ConnectMe</Text>
          <Text style={s.brandSubtitle}>Receipt</Text>
          <Text style={s.receiptNumber}>{receiptNumber}</Text>
        </View>

        {/* Booking info card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Booking Information</Text>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Vendor</Text>
            <Text style={s.detailValue}>{vendorName}</Text>
          </View>
          {category ? (
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Business Type</Text>
              <Text style={s.detailValue}>{category}</Text>
            </View>
          ) : null}
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Event Date</Text>
            <Text style={s.detailValue}>{eventDate}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Time</Text>
            <Text style={s.detailValue}>
              {startTime && endTime ? `${startTime} - ${endTime}` : 'N/A'}
            </Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Location</Text>
            <Text style={s.detailValue} numberOfLines={2}>
              {location}
            </Text>
          </View>
          <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={s.detailLabel}>Booking ID</Text>
            <Text style={s.detailValue}>{bookingId}</Text>
          </View>
        </View>

        {/* Price breakdown card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Price Breakdown</Text>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Base price</Text>
            <Text style={s.detailValue}>${basePrice.toFixed(2)}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Service fee (5%)</Text>
            <Text style={s.detailValue}>${serviceFee.toFixed(2)}</Text>
          </View>
          {promoDiscount > 0 && (
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Promo discount</Text>
              <Text style={[s.detailValue, { color: colors.success }]}>
                -${promoDiscount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>${computedTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment info card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Payment Information</Text>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Payment method</Text>
            <Text style={s.detailValue}>{booking?.paymentMethodLabel ?? 'Card on file'}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Payment date</Text>
            <Text style={s.detailValue}>{paymentDate}</Text>
          </View>
          <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={s.detailLabel}>Status</Text>
            <View style={s.paidBadge}>
              <Text style={s.paidBadgeText}>Paid</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Action buttons */}
        <View style={s.actionsContainer}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={handleDownloadPdf}
            activeOpacity={0.7}
            accessibilityLabel="Download PDF receipt"
            accessibilityRole="button"
            accessibilityHint="Downloads a PDF copy of this receipt"
          >
            <Text style={s.actionBtnText}>Download PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={handleEmailReceipt}
            activeOpacity={0.7}
            accessibilityLabel="Email receipt"
            accessibilityRole="button"
            accessibilityHint="Sends this receipt to your email address"
          >
            <Text style={s.actionBtnText}>Email Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, s.actionBtnPrimary]}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityLabel="Share receipt"
            accessibilityRole="button"
            accessibilityHint="Opens the share sheet to share this receipt"
          >
            <Text style={s.actionBtnPrimaryText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Footer text */}
        <Text style={s.footerText}>
          Thank you for using ConnectMe! If you have questions about this charge, contact support.
        </Text>

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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: spacing.sm,
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

  // Branding
  brandingArea: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.lightBlue,
    marginBottom: spacing.md,
  },
  brandName: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.primary,
  },
  brandSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  receiptNumber: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Card
  card: {
    marginHorizontal: 20,
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
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
  },
  detailValue: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
    flex: 1,
  },

  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.primary,
  },

  // Paid badge
  paidBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  paidBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.success,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
    marginVertical: spacing.sm,
  },

  // Actions
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginTop: spacing.sm,
  },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.text,
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionBtnPrimaryText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.white,
  },

  // Footer
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: spacing.lg,
    lineHeight: 19,
  },
});
