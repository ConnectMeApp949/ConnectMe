import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform, Share, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Calendar from 'expo-calendar';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { StarIcon, CalendarIcon, CheckIcon, ClockIcon, XIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'BookingDetail'>;

// ─── Timeline types & helpers ────────────────────────────

type StepState = 'completed' | 'current' | 'future' | 'cancelled';

interface TimelineStep {
  label: string;
  timestamp: string;
  state: StepState;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateWithTime(date: Date): string {
  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${datePart} at ${timePart}`;
}

function buildTimelineSteps(booking: any): TimelineStep[] {
  const status = (booking?.status ?? '').toUpperCase();
  const createdAt = booking?.createdAt ? new Date(booking.createdAt) : null;
  const confirmedAt = booking?.confirmedAt ? new Date(booking.confirmedAt) : null;
  const eventDate = booking?.eventDate ? new Date(booking.eventDate) : null;

  const submittedTs = createdAt ? formatDateWithTime(createdAt) : '';
  const paymentTs = createdAt ? formatDateWithTime(createdAt) : '';
  const confirmedTs = confirmedAt ? formatDateWithTime(confirmedAt) : '';
  const eventTs = eventDate ? formatShortDate(eventDate) : '';

  if (status === 'CANCELLED') {
    return [
      { label: 'Request Submitted', timestamp: submittedTs, state: 'completed' },
      { label: 'Payment Authorized', timestamp: paymentTs, state: 'completed' },
      { label: 'Cancelled', timestamp: '', state: 'cancelled' },
    ];
  }

  if (status === 'COMPLETED') {
    return [
      { label: 'Request Submitted', timestamp: submittedTs, state: 'completed' },
      { label: 'Payment Authorized', timestamp: paymentTs, state: 'completed' },
      { label: 'Vendor Confirmed', timestamp: confirmedTs, state: 'completed' },
      { label: 'Day of Event', timestamp: eventTs, state: 'completed' },
      { label: 'Completed', timestamp: 'Event finished', state: 'completed' },
    ];
  }

  if (status === 'CONFIRMED' || status === 'UPCOMING') {
    const now = new Date();
    const isToday = eventDate && eventDate.toDateString() === now.toDateString();
    const isPast = eventDate && eventDate < now;

    if (isToday || isPast) {
      return [
        { label: 'Request Submitted', timestamp: submittedTs, state: 'completed' },
        { label: 'Payment Authorized', timestamp: paymentTs, state: 'completed' },
        { label: 'Vendor Confirmed', timestamp: confirmedTs, state: 'completed' },
        { label: 'Day of Event', timestamp: eventTs, state: 'current' },
        { label: 'Completed', timestamp: 'After your event', state: 'future' },
      ];
    }

    return [
      { label: 'Request Submitted', timestamp: submittedTs, state: 'completed' },
      { label: 'Payment Authorized', timestamp: paymentTs, state: 'completed' },
      { label: 'Vendor Confirmed', timestamp: confirmedTs, state: 'completed' },
      { label: 'Day of Event', timestamp: eventTs, state: 'current' },
      { label: 'Completed', timestamp: 'After your event', state: 'future' },
    ];
  }

  // PENDING (awaiting vendor confirmation)
  return [
    { label: 'Request Submitted', timestamp: submittedTs, state: 'completed' },
    { label: 'Payment Authorized', timestamp: paymentTs, state: 'completed' },
    { label: 'Vendor Confirmed', timestamp: 'Awaiting confirmation', state: 'current' },
    { label: 'Day of Event', timestamp: eventTs, state: 'future' },
    { label: 'Completed', timestamp: 'After your event', state: 'future' },
  ];
}

function getCountdownMessage(booking: any): string | null {
  const status = (booking?.status ?? '').toUpperCase();
  const eventDate = booking?.eventDate ? new Date(booking.eventDate) : null;
  const now = new Date();

  if (status === 'PENDING') {
    return 'Vendor usually responds in 2 hours';
  }

  if ((status === 'CONFIRMED' || status === 'UPCOMING') && eventDate) {
    if (eventDate.toDateString() === now.toDateString()) {
      return 'Your event is today!';
    }
    const diffMs = eventDate.getTime() - now.getTime();
    if (diffMs > 0) {
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays === 1 ? '' : 's'} until your event`;
    }
  }

  return null;
}

// ─── Pulsing dot for current step ────────────────────────

function PulsingDot() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1.6, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.3, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim, opacityAnim]);

  return (
    <View style={tl.currentCircle} accessibilityLabel="Current step">
      <Animated.View style={[tl.pulseRing, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]} />
      <View style={tl.currentDot} />
    </View>
  );
}

// ─── BookingTimeline component ───────────────────────────

function BookingTimeline({ booking }: { booking: any }) {
  const { colors: themeColors } = useTheme();
  const steps = useMemo(() => buildTimelineSteps(booking), [booking]);
  const countdown = useMemo(() => getCountdownMessage(booking), [booking]);

  return (
    <View style={[tl.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]} accessibilityRole="summary" accessibilityLabel="Booking progress timeline">
      <Text style={[tl.cardTitle, { color: themeColors.text }]}>Booking Progress</Text>

      {countdown && (
        <View style={tl.countdownRow}>
          <ClockIcon size={14} color={colors.primary} />
          <Text style={tl.countdownText}>{countdown}</Text>
        </View>
      )}

      <View style={tl.stepsContainer}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const lineColor = step.state === 'completed' ? colors.success : colors.border;

          return (
            <View key={index} style={tl.stepRow} accessibilityLabel={`${step.label}, ${step.state === 'completed' ? 'complete' : step.state === 'current' ? 'in progress' : step.state === 'cancelled' ? 'cancelled' : 'upcoming'}${step.timestamp ? `, ${step.timestamp}` : ''}`}>
              {/* Left column: circle + connecting line */}
              <View style={tl.leftCol}>
                {step.state === 'completed' && (
                  <View style={tl.completedCircle}>
                    <CheckIcon size={14} color={colors.white} strokeWidth={2.5} />
                  </View>
                )}
                {step.state === 'current' && <PulsingDot />}
                {step.state === 'future' && <View style={tl.futureCircle} />}
                {step.state === 'cancelled' && (
                  <View style={tl.cancelledCircle}>
                    <XIcon size={14} color={colors.white} strokeWidth={2.5} />
                  </View>
                )}

                {!isLast && (
                  <View style={[tl.connectingLine, { backgroundColor: lineColor }]} />
                )}
              </View>

              {/* Right column: label + timestamp */}
              <View style={tl.rightCol}>
                <Text style={[
                  tl.stepLabel,
                  { color: themeColors.text },
                  step.state === 'future' && { color: themeColors.textSecondary },
                  step.state === 'cancelled' && tl.stepLabelCancelled,
                ]}>{step.label}</Text>
                {step.timestamp ? (
                  <Text style={[
                    tl.stepTimestamp,
                    { color: themeColors.textSecondary },
                    step.state === 'cancelled' && tl.stepTimestampCancelled,
                  ]}>{step.timestamp}</Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function BookingDetailScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const booking = route.params?.booking as any;
  const vendor = booking?.vendor;
  const vendorName = vendor?.businessName ?? 'Unknown Vendor';
  const coverPhoto = vendor?.coverPhoto ?? null;
  const category = vendor?.category?.replace(/_/g, ' ') ?? '';
  const rating = Number(vendor?.averageRating ?? 0);
  const reviews = Number(vendor?.totalReviews ?? 0);
  const amount = Number(booking?.totalAmount ?? 0).toFixed(2);
  const eventDate = booking?.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const startTime = booking?.eventStartTime ? new Date(booking.eventStartTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
  const endTime = booking?.eventEndTime ? new Date(booking.eventEndTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

  const status = booking?.status?.toUpperCase?.() ?? '';
  const isUpcoming = status === 'CONFIRMED' || status === 'UPCOMING';

  const details = [
    { label: 'Date', value: eventDate },
    { label: 'Time', value: startTime && endTime ? `${startTime} – ${endTime}` : 'N/A' },
    { label: 'Location', value: booking?.eventLocation ?? 'N/A' },
    { label: 'Service', value: booking?.eventType ?? 'N/A' },
    { label: 'Duration', value: startTime && endTime ? 'See time above' : 'N/A' },
    { label: 'Amount Paid', value: `$${amount}` },
  ];

  async function handleAddToCalendar() {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Calendar access is needed to add this event. Please enable it in your device settings.',
        );
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar =
        Platform.OS === 'ios'
          ? await Calendar.getDefaultCalendarAsync()
          : calendars.find((c) => c.accessLevel === Calendar.CalendarAccessLevel.OWNER) ?? calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar found on this device.');
        return;
      }

      const eventStart = booking?.eventStartTime
        ? new Date(booking.eventStartTime)
        : booking?.eventDate
          ? new Date(booking.eventDate)
          : new Date();

      const eventEnd = booking?.eventEndTime
        ? new Date(booking.eventEndTime)
        : new Date(eventStart.getTime() + 2 * 60 * 60 * 1000);

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `ConnectMe: ${vendorName}`,
        startDate: eventStart,
        endDate: eventEnd,
        location: booking?.eventLocation ?? undefined,
        notes: 'Booked via ConnectMe',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      Alert.alert('Event added to your calendar!');
    } catch (error) {
      Alert.alert('Error', 'Could not add the event to your calendar. Please try again.');
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        title: `Booking with ${vendorName}`,
        message: `I just booked ${vendorName} for my event through ConnectMe!`,
        url: `https://connectmeapp.services/vendor/${vendor?.id}`,
      });
    } catch {
      // User cancelled share
    }
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
            <Text style={[s.backText, { color: themeColors.text }]}>{'\u2190'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Share this booking" accessibilityRole="button">
            <Text style={s.backText}>{'\u2197'}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} style={s.heroBanner} accessibilityLabel={`${vendorName} banner photo`} accessibilityRole="image" />
          ) : (
            <View style={[s.heroBanner, { backgroundColor: colors.accent }]} />
          )}
          <View style={s.heroAvatarWrap}>
            {coverPhoto ? (
              <Image source={{ uri: coverPhoto }} style={[s.heroAvatar, { borderColor: themeColors.background }]} accessibilityLabel={`${vendorName} avatar`} accessibilityRole="image" />
            ) : (
              <View style={[s.heroAvatarFallback, { borderColor: themeColors.background }]}><Text style={s.heroAvatarText}>{vendorName[0]}</Text></View>
            )}
          </View>
        </View>

        {/* Vendor info */}
        <View style={s.vendorInfo}>
          <Text style={[s.vendorName, { color: themeColors.text }]}>{vendorName}</Text>
          <Text style={[s.vendorCategory, { color: themeColors.textSecondary }]}>{category}</Text>
          <View style={s.ratingRow}>
            <StarIcon size={16} color={colors.star} />
            <Text style={[s.ratingText, { color: themeColors.text }]}>{rating > 0 ? rating.toFixed(1) : 'New'}</Text>
            {reviews > 0 && <Text style={[s.reviewCount, { color: themeColors.textSecondary }]}>({reviews} reviews)</Text>}
          </View>
        </View>

        {/* Booking Details card */}
        <View style={[s.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Text style={[s.cardTitle, { color: themeColors.text }]}>Booking Details</Text>
          {details.map((d) => (
            <View key={d.label} style={[s.detailRow, { borderBottomColor: themeColors.border }]}>
              <Text style={[s.detailLabel, { color: themeColors.textSecondary }]}>{d.label}</Text>
              <Text style={[s.detailValue, { color: themeColors.text }]}>{d.value}</Text>
            </View>
          ))}
          {isUpcoming && (
            <TouchableOpacity
              style={s.calendarBtn}
              onPress={handleAddToCalendar}
              activeOpacity={0.7}
              accessibilityLabel="Add to Calendar"
              accessibilityRole="button"
              accessibilityHint={`Adds your booking with ${vendorName} to your device calendar`}
            >
              <CalendarIcon size={16} color={colors.white} />
              <Text style={s.calendarBtnText}>Add to Calendar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Vendor Information card */}
        <View style={[s.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Text style={[s.cardTitle, { color: themeColors.text }]}>Vendor Information</Text>
          <View style={[s.detailRow, { borderBottomColor: themeColors.border }]}><Text style={[s.detailLabel, { color: themeColors.textSecondary }]}>Name</Text><Text style={[s.detailValue, { color: themeColors.text }]}>{vendorName}</Text></View>
          <TouchableOpacity style={s.viewProfileBtn} activeOpacity={0.7} onPress={() => navigation.navigate('VendorDetail', { vendor })} accessibilityLabel="View Vendor Profile" accessibilityRole="button" accessibilityHint={`View ${vendorName}'s full profile`}>
            <Text style={s.viewProfileText}>View Vendor Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Booking Progress Timeline */}
        <BookingTimeline booking={booking} />

        {/* Action buttons */}
        <View style={s.actions}>
          {isUpcoming ? (
            <>
              <TouchableOpacity
                style={s.actionBtnPrimary}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ModifyBooking', { booking })}
                accessibilityLabel="Modify Booking"
                accessibilityRole="button"
                accessibilityHint={`Modify your upcoming booking with ${vendorName}`}
              >
                <Text style={s.actionBtnPrimaryText}>Modify Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.actionBtnCancel}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('CancelBooking', { booking })}
                accessibilityLabel="Cancel Booking"
                accessibilityRole="button"
                accessibilityHint={`Cancel your booking with ${vendorName}`}
              >
                <Text style={s.actionBtnCancelText}>Cancel Booking</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={[s.actionBtnOutline, { borderColor: themeColors.text }]} activeOpacity={0.7} onPress={() => navigation.navigate('LeaveReview', { vendor: booking.vendor, bookingDate: booking.eventDate, bookingId: booking.id })} accessibilityLabel="Leave a Review" accessibilityRole="button" accessibilityHint={`Leave a review for ${vendorName}`}>
                <Text style={[s.actionBtnOutlineText, { color: themeColors.text }]}>Leave a Review</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtnTip} activeOpacity={0.7} onPress={() => navigation.navigate('Tip', { booking })} accessibilityLabel="Leave a Tip" accessibilityRole="button" accessibilityHint={`Leave a tip for ${vendorName}`}>
                <Text style={s.actionBtnTipText}>Leave a Tip</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Book Again — only for completed bookings */}
        {!isUpcoming && (
          <View style={s.bookAgainWrap}>
            <TouchableOpacity style={s.actionBtnPrimary} activeOpacity={0.7} accessibilityLabel="Book Again" accessibilityRole="button" accessibilityHint={`Book ${vendorName} again`}>
              <Text style={s.actionBtnPrimaryText}>Book Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* View Receipt — only for completed bookings */}
        {!isUpcoming && (
          <View style={s.receiptBtnWrap}>
            <TouchableOpacity
              style={s.receiptBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Receipt', { booking })}
              accessibilityLabel="View Receipt"
              accessibilityRole="button"
              accessibilityHint={`View the receipt for your booking with ${vendorName}`}
            >
              <Text style={s.receiptBtnText}>View Receipt</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  hero: { height: 180, position: 'relative', marginBottom: 50 },
  heroBanner: { width: '100%', height: 180 },
  heroAvatarWrap: { position: 'absolute', bottom: -40, alignSelf: 'center' },
  heroAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.white },
  heroAvatarFallback: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.white },
  heroAvatarText: { fontFamily: fonts.bold, fontSize: 28, color: colors.white },
  vendorInfo: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  vendorName: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  vendorCategory: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ratingStar: { fontSize: 16, color: colors.star, marginRight: 4 },
  ratingText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  reviewCount: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginLeft: 4 },
  card: { marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.white, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  cardTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  detailValue: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  calendarBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.accent, gap: 8 },
  calendarBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.white },
  viewProfileBtn: { marginTop: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
  viewProfileText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 8 },
  actionBtnOutline: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.text, alignItems: 'center' },
  actionBtnOutlineText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  actionBtnPrimary: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center' },
  actionBtnPrimaryText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },
  actionBtnCancel: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: colors.error, alignItems: 'center' },
  actionBtnCancelText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },
  actionBtnTip: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center' },
  actionBtnTipText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },
  bookAgainWrap: { paddingHorizontal: 20, marginTop: 12 },
  receiptBtnWrap: { paddingHorizontal: 20, marginTop: 16 },
  receiptBtn: { paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.accent, alignItems: 'center' },
  receiptBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.accent },
});

// ─── Timeline styles ─────────────────────────────────────

const CIRCLE_SIZE = 24;
const CURRENT_CIRCLE_SIZE = 28;
const LINE_WIDTH = 2;

const tl = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 4,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.backgroundWarm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  countdownText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.primary,
  },
  stepsContainer: {
    paddingTop: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 48,
  },
  leftCol: {
    width: CURRENT_CIRCLE_SIZE,
    alignItems: 'center',
  },
  completedCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentCircle: {
    width: CURRENT_CIRCLE_SIZE,
    height: CURRENT_CIRCLE_SIZE,
    borderRadius: CURRENT_CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: CURRENT_CIRCLE_SIZE - 4,
    height: CURRENT_CIRCLE_SIZE - 4,
    borderRadius: (CURRENT_CIRCLE_SIZE - 4) / 2,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  currentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  futureCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  cancelledCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectingLine: {
    width: LINE_WIDTH,
    flex: 1,
    minHeight: 20,
    marginVertical: 4,
  },
  rightCol: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
    justifyContent: 'center',
  },
  stepLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  stepLabelFuture: {
    color: colors.textMuted,
  },
  stepLabelCancelled: {
    color: colors.error,
  },
  stepTimestamp: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  stepTimestampCancelled: {
    color: colors.error,
  },
});
