import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform, Share, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Calendar from 'expo-calendar';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import {
  CheckIcon, MessageIcon, CalendarIcon, ShareIcon, ChevronRightIcon, MapPinIcon, UserIcon, ClockIcon,
} from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'BookingConfirmation'>;

/** Generate a pseudo-random confirmation code in the form CM-XXXXXX. */
function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CM-${code}`;
}

// ─── Timeline step types ────────────────────────────────

type StepStatus = 'complete' | 'active' | 'upcoming';

interface TimelineStep {
  label: string;
  subtitle?: string;
  status: StepStatus;
}

function getInstantBookSteps(): TimelineStep[] {
  return [
    { label: 'Request submitted', status: 'complete' },
    { label: 'Payment confirmed', status: 'complete' },
    { label: 'Booking confirmed', status: 'complete' },
    { label: 'Day of event', status: 'upcoming' },
    { label: 'Complete', status: 'upcoming' },
  ];
}

function getRequestSteps(): TimelineStep[] {
  return [
    { label: 'Request submitted', status: 'complete' },
    { label: 'Payment authorized', status: 'complete' },
    { label: 'Awaiting vendor response', subtitle: 'Usually responds in 2 hours', status: 'active' },
    { label: 'Confirmed', status: 'upcoming' },
    { label: 'Day of event', status: 'upcoming' },
  ];
}

// ─── Component ──────────────────────────────────────────

export default function BookingConfirmationScreen({ navigation, route }: Props) {
  const params = route.params as any;
  const instantBook: boolean = params?.instantBook === true;
  const vendor = params?.vendor;
  const vendorName: string = vendor?.businessName ?? 'Vendor';
  const coverPhoto: string | null = vendor?.coverPhoto ?? null;
  const eventDate: string = params?.eventDate ?? '';
  const eventLocation: string = params?.eventLocation ?? '';
  const guestCount: string = params?.guestCount ?? '';
  const totalAmount: string = params?.totalAmount ?? '0.00';
  const eventType: string = params?.eventType ?? '';
  const confirmationCode = useRef(params?.confirmationCode ?? generateConfirmationCode()).current;

  // Animations
  const checkScale = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checkScale, contentFade]);

  const steps = instantBook ? getInstantBookSteps() : getRequestSteps();

  // ─── Calendar ───────────────────────────────────────

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

      const eventStart = eventDate ? new Date(eventDate) : new Date();
      const eventEnd = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000);

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `ConnectMe: ${vendorName}`,
        startDate: eventStart,
        endDate: eventEnd,
        location: eventLocation || undefined,
        notes: `Booking ${confirmationCode} via ConnectMe`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      Alert.alert('Added', 'Event has been added to your calendar.');
    } catch {
      Alert.alert('Error', 'Could not add the event to your calendar. Please try again.');
    }
  }

  // ─── Share ──────────────────────────────────────────

  async function handleShare() {
    try {
      await Share.share({
        title: `Booking with ${vendorName}`,
        message: `I just booked ${vendorName} for my event through ConnectMe! Confirmation: ${confirmationCode}`,
        url: `https://connectmeapp.com/vendor/${vendor?.id ?? ''}`,
      });
    } catch {
      // User cancelled share
    }
  }

  // ─── Navigation helpers ─────────────────────────────

  function handleMessageVendor() {
    navigation.navigate('Messages', {
      screen: 'ChatScreen',
      params: { vendor },
    });
  }

  function handleViewBookingDetails() {
    navigation.navigate('Profile', {
      screen: 'BookingDetail',
      params: {
        booking: {
          id: confirmationCode,
          vendor,
          eventDate,
          eventLocation,
          eventType,
          totalAmount: parseFloat(totalAmount),
          status: instantBook ? 'CONFIRMED' : 'PENDING',
        },
      },
    });
  }

  // ─── Formatted display values ───────────────────────

  const displayDate = eventDate
    ? new Date(eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date not set';

  // ─── Render ─────────────────────────────────────────

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── Success animation area ── */}
        <View style={s.heroSection} accessibilityRole="header">
          <Animated.View
            style={[s.checkCircle, { transform: [{ scale: checkScale }] }]}
            accessibilityLabel={instantBook ? 'Booking confirmed' : 'Request sent'}
          >
            <CheckIcon size={40} color={colors.white} strokeWidth={3} />
          </Animated.View>

          <Animated.View style={{ opacity: contentFade, alignItems: 'center' }}>
            <Text style={s.heroTitle}>
              {instantBook ? 'Booking Confirmed!' : 'Request Sent!'}
            </Text>
            <Text style={s.heroSubtitle}>
              {instantBook
                ? `Your booking with ${vendorName} is confirmed.`
                : `Your request has been sent to ${vendorName}.`}
            </Text>
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: contentFade }}>
          {/* ── Confirmation number ── */}
          <View style={s.confirmationBadge} accessibilityLabel={`Confirmation number ${confirmationCode}`}>
            <Text style={s.confirmationLabel}>Confirmation Number</Text>
            <Text style={s.confirmationCode}>{confirmationCode}</Text>
          </View>

          {/* ── Booking summary card ── */}
          <View style={s.card} accessibilityLabel="Booking summary">
            <Text style={s.cardTitle}>Booking Summary</Text>

            {/* Vendor row */}
            <View style={s.vendorRow}>
              {coverPhoto ? (
                <Image
                  source={{ uri: coverPhoto }}
                  style={s.vendorAvatar}
                  accessibilityLabel={`${vendorName} photo`}
                  accessibilityRole="image"
                />
              ) : (
                <View style={s.vendorAvatarFallback}>
                  <Text style={s.vendorAvatarText}>{vendorName[0]}</Text>
                </View>
              )}
              <View style={s.vendorInfo}>
                <Text style={s.vendorName}>{vendorName}</Text>
                {eventType ? <Text style={s.vendorCategory}>{eventType}</Text> : null}
              </View>
            </View>

            <View style={s.divider} />

            {/* Detail rows */}
            <View style={s.detailRow}>
              <CalendarIcon size={16} color={colors.textMuted} />
              <View style={s.detailContent}>
                <Text style={s.detailLabel}>Date</Text>
                <Text style={s.detailValue}>{displayDate}</Text>
              </View>
            </View>

            <View style={s.detailRow}>
              <MapPinIcon size={16} color={colors.textMuted} />
              <View style={s.detailContent}>
                <Text style={s.detailLabel}>Location</Text>
                <Text style={s.detailValue}>{eventLocation || 'Not specified'}</Text>
              </View>
            </View>

            {guestCount ? (
              <View style={s.detailRow}>
                <UserIcon size={16} color={colors.textMuted} />
                <View style={s.detailContent}>
                  <Text style={s.detailLabel}>Guests</Text>
                  <Text style={s.detailValue}>{guestCount}</Text>
                </View>
              </View>
            ) : null}

            <View style={s.divider} />

            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Total Paid</Text>
              <Text style={s.priceValue}>${totalAmount}</Text>
            </View>
          </View>

          {/* ── Status timeline ── */}
          <View style={s.card} accessibilityLabel="Booking status timeline">
            <Text style={s.cardTitle}>Status</Text>
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              return (
                <View key={step.label} style={s.timelineRow}>
                  {/* Connector line + dot */}
                  <View style={s.timelineLeft}>
                    <View
                      style={[
                        s.timelineDot,
                        step.status === 'complete' && s.timelineDotComplete,
                        step.status === 'active' && s.timelineDotActive,
                        step.status === 'upcoming' && s.timelineDotUpcoming,
                      ]}
                      accessibilityLabel={
                        step.status === 'complete'
                          ? `${step.label}, completed`
                          : step.status === 'active'
                            ? `${step.label}, in progress`
                            : `${step.label}, pending`
                      }
                    >
                      {step.status === 'complete' ? (
                        <CheckIcon size={12} color={colors.white} strokeWidth={3} />
                      ) : null}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          s.timelineLine,
                          step.status === 'complete' ? s.timelineLineComplete : s.timelineLineUpcoming,
                        ]}
                      />
                    )}
                  </View>

                  {/* Label */}
                  <View style={s.timelineContent}>
                    <Text
                      style={[
                        s.timelineLabel,
                        step.status === 'upcoming' && s.timelineLabelMuted,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {step.subtitle ? (
                      <View style={s.timelineSubtitleRow}>
                        <ClockIcon size={12} color={colors.textMuted} />
                        <Text style={s.timelineSubtitle}>{step.subtitle}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── What's Next section ── */}
          <View style={s.card} accessibilityLabel="What to expect next">
            <Text style={s.cardTitle}>What's Next</Text>
            {instantBook ? (
              <>
                <Text style={s.infoText}>
                  Your booking is confirmed and payment has been processed. You will receive a confirmation email shortly.
                </Text>
                <Text style={s.infoText}>
                  We recommend messaging your vendor to introduce yourself and discuss any specific details for your event.
                </Text>
              </>
            ) : (
              <>
                <Text style={s.infoText}>
                  Your booking request has been sent to {vendorName}. Your payment method has been authorized but will not be charged until the vendor confirms.
                </Text>
                <Text style={s.infoText}>
                  Most vendors respond within 2 hours. You will receive a notification as soon as they respond.
                </Text>
                <Text style={s.infoText}>
                  If the vendor does not respond within 48 hours, the authorization will be released automatically.
                </Text>
              </>
            )}
          </View>

          {/* ── Action buttons ── */}
          <View style={s.actionsSection}>
            <TouchableOpacity
              style={s.actionBtnPrimary}
              onPress={handleMessageVendor}
              activeOpacity={0.7}
              accessibilityLabel="Message vendor"
              accessibilityRole="button"
              accessibilityHint={`Opens a conversation with ${vendorName}`}
            >
              <MessageIcon size={18} color={colors.white} strokeWidth={2} />
              <Text style={s.actionBtnPrimaryText}>Message Vendor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.actionBtnOutline}
              onPress={handleAddToCalendar}
              activeOpacity={0.7}
              accessibilityLabel="Add to calendar"
              accessibilityRole="button"
              accessibilityHint="Adds this event to your device calendar"
            >
              <CalendarIcon size={18} color={colors.text} strokeWidth={2} />
              <Text style={s.actionBtnOutlineText}>Add to Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.actionBtnOutline}
              onPress={handleViewBookingDetails}
              activeOpacity={0.7}
              accessibilityLabel="View booking details"
              accessibilityRole="button"
              accessibilityHint="Navigate to full booking details"
            >
              <Text style={s.actionBtnOutlineText}>View Booking Details</Text>
              <ChevronRightIcon size={18} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* ── Share button ── */}
          <TouchableOpacity
            style={s.shareBtn}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityLabel="Share your booking"
            accessibilityRole="button"
            accessibilityHint="Opens the system share sheet to share your booking"
          >
            <ShareIcon size={18} color={colors.accent} strokeWidth={2} />
            <Text style={s.shareBtnText}>Share Your Booking</Text>
          </TouchableOpacity>

          {/* ── Done / back to home ── */}
          <TouchableOpacity
            style={s.doneBtn}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.7}
            accessibilityLabel="Done"
            accessibilityRole="button"
            accessibilityHint="Returns to the home screen"
          >
            <Text style={s.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    paddingBottom: 40,
  },

  // Hero / success area
  heroSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Confirmation badge
  confirmationBadge: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmationLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  confirmationCode: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.primary,
    letterSpacing: 2,
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
    marginBottom: spacing.sm,
  },

  // Vendor row inside summary
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  vendorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  vendorAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorAvatarText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.white,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  vendorCategory: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  detailValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginTop: 1,
  },

  // Price
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  priceValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },

  // Timeline
  timelineRow: {
    flexDirection: 'row',
    minHeight: 44,
  },
  timelineLeft: {
    width: 28,
    alignItems: 'center',
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotComplete: {
    backgroundColor: colors.success,
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  timelineDotUpcoming: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  timelineLineComplete: {
    backgroundColor: colors.success,
  },
  timelineLineUpcoming: {
    backgroundColor: colors.border,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: spacing.sm,
    paddingBottom: spacing.sm,
  },
  timelineLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  timelineLabelMuted: {
    color: colors.textMuted,
  },
  timelineSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timelineSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },

  // Info text (What's Next)
  infoText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },

  // Action buttons
  actionsSection: {
    paddingHorizontal: 20,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingVertical: 14,
  },
  actionBtnPrimaryText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.white,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
  },
  actionBtnOutlineText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },

  // Share button
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: 20,
    marginBottom: spacing.md,
    paddingVertical: 12,
  },
  shareBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.accent,
  },

  // Done button
  doneBtn: {
    marginHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.cardBackground,
  },
  doneBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textSecondary,
  },
});
