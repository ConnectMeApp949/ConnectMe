import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ShieldIcon, CheckIcon, ClockIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'RequestBooking'>;

const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Quinceañera', 'Festival', 'Private Party', 'Other'];

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 6; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const min = m.toString().padStart(2, '0');
      slots.push(`${hour12}:${min} ${ampm}`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

function parseTimeSlot(slot: string): { hours: number; minutes: number } {
  const [time, ampm] = slot.split(' ');
  const [hStr, mStr] = time.split(':');
  let hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDuration(startSlot: string, endSlot: string): string {
  const start = parseTimeSlot(startSlot);
  const end = parseTimeSlot(endSlot);
  let diffMin = (end.hours * 60 + end.minutes) - (start.hours * 60 + start.minutes);
  if (diffMin <= 0) return '--';
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

const PROMO_CODES: Record<string, { type: 'percent' | 'flat'; value: number; label: string }> = {
  WELCOME10: { type: 'percent', value: 10, label: 'WELCOME10 applied — 10% off!' },
  FIRST20: { type: 'percent', value: 20, label: 'FIRST20 applied — 20% off!' },
  CONNECT5: { type: 'flat', value: 5, label: 'CONNECT5 applied — $5 off!' },
};

export default function RequestBookingScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const { token } = useAuth();
  const { showAlert } = useAlert();
  const vendor = (route.params as any)?.vendor;
  const instantBook = (route.params as any)?.instantBook === true;
  const vendorName = vendor?.businessName ?? 'Vendor';
  const basePrice = Number(vendor?.basePrice ?? 0);

  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [guestCount, setGuestCount] = useState('50');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1); // Can book starting tomorrow
    return d;
  }, [today]);

  // Generate vendor blocked dates (same algorithm as AvailabilityCalendar)
  const blockedDates = useMemo(() => {
    const { year, month } = calendarMonth;
    const vId = vendor?.id ?? '';
    const blocked = new Set<number>();
    const daysInMonth = getDaysInMonth(year, month);
    let seed = 0;
    for (let i = 0; i < vId.length; i++) seed += vId.charCodeAt(i);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dow = date.getDay();
      if (dow === 3) blocked.add(day); // Wednesdays blocked
      if ((dow === 0 || dow === 6) && ((seed + day) % 3 === 0)) blocked.add(day); // Some weekends
    }
    return blocked;
  }, [calendarMonth, vendor?.id]);

  const [promoExpanded, setPromoExpanded] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [protectionEnabled, setProtectionEnabled] = useState(false);

  const PROTECTION_FLAT_FEE = 9.99;
  const priceUnit = vendor?.priceUnit || 'PER_EVENT';

  // Calculate duration in hours for per-hour pricing
  const durationHours = useMemo(() => {
    if (!startTime || !endTime) return 1;
    const start = parseTimeSlot(startTime);
    const end = parseTimeSlot(endTime);
    const diffMin = (end.hours * 60 + end.minutes) - (start.hours * 60 + start.minutes);
    return diffMin > 0 ? diffMin / 60 : 1;
  }, [startTime, endTime]);

  // For PER_HOUR vendors, multiply base price by duration
  const vendorFee = priceUnit === 'PER_HOUR' ? parseFloat((basePrice * durationHours).toFixed(2)) : basePrice;
  const serviceFee = parseFloat((vendorFee * 0.05).toFixed(2));
  const subtotal = vendorFee + serviceFee;

  const discount = (() => {
    if (!promoCode) return 0;
    const promo = PROMO_CODES[promoCode];
    if (!promo) return 0;
    if (promo.type === 'percent') return parseFloat((subtotal * (promo.value / 100)).toFixed(2));
    return Math.min(promo.value, subtotal);
  })();

  const protectionFee = protectionEnabled ? PROTECTION_FLAT_FEE : 0;
  const total = parseFloat((subtotal - discount + protectionFee).toFixed(2));
  const isValid = eventType && eventDate && startTime && endTime && location.trim();

  function handleApplyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setPromoCode(code);
      setPromoError(null);
    } else {
      setPromoCode(null);
      setPromoError('Invalid promo code');
    }
  }

  function handleRemovePromo() {
    setPromoCode(null);
    setPromoError(null);
    setPromoInput('');
  }

  function formatDate(d: Date | null): string {
    if (!d) return '';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  function buildISOTime(date: Date, timeSlot: string): string {
    const parsed = parseTimeSlot(timeSlot);
    const d = new Date(date);
    d.setHours(parsed.hours, parsed.minutes, 0, 0);
    return d.toISOString();
  }

  async function handleSubmit() {
    if (!isValid || !eventDate || !startTime || !endTime) return;
    setLoading(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
      const eventStartTime = buildISOTime(eventDate, startTime);
      const eventEndTime = buildISOTime(eventDate, endTime);

      const res = await fetch(API_URL + '/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) },
        body: JSON.stringify({
          vendorId: vendor?.id,
          instantBook,
          eventType,
          eventDate: eventDate.toISOString(),
          eventStartTime,
          eventEndTime,
          guestCount: parseInt(guestCount, 10) || 50,
          eventLocation: location,
          specialRequirements: notes || undefined,
          totalAmount: total,
          promoCode: promoCode || undefined,
          protectionEnabled,
        }),
      });
      if (!res.ok) {
        throw new Error(`Server error (${res.status}). Please try again.`);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Booking failed');
      }
      showAlert('bookingReceived', 'Booking Request Sent', `Your request to ${vendorName} has been submitted.`);
      navigation.replace('BookingConfirmation', {
        instantBook,
        vendor,
        eventDate: eventDate.toISOString(),
        eventLocation: location,
        guestCount,
        totalAmount: total.toFixed(2),
        eventType,
        confirmationCode: data.data?.confirmationCode || 'CM-' + Math.floor(100000 + Math.random() * 900000),
      });
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>{instantBook ? 'Confirm and Pay' : 'Request to book'}</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Vendor summary */}
        <View style={[s.vendorCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Text style={[s.vendorName, { color: themeColors.text }]}>{vendorName}</Text>
          <Text style={[s.vendorPrice, { color: themeColors.textMuted }]}>${basePrice.toFixed(0)} {vendor?.priceUnit?.replace(/_/g, ' ').toLowerCase()}</Text>
        </View>

        {/* Event type */}
        <Text style={[s.label, { color: themeColors.text }]}>Event type</Text>
        <View style={s.chipRow}>
          {EVENT_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.chip, { borderColor: themeColors.border }, eventType === t && [s.chipActive, { backgroundColor: themeColors.text, borderColor: themeColors.text }]]}
              onPress={() => setEventType(t)}
              activeOpacity={0.7}
              accessibilityLabel={t}
              accessibilityRole="button"
              accessibilityState={{ selected: eventType === t }}
            >
              <Text style={[s.chipText, { color: themeColors.text }, eventType === t && s.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date — mini calendar */}
        <Text style={[s.label, { color: themeColors.text }]}>Event date</Text>
        {(() => {
          const { year, month } = calendarMonth;
          const daysInMonth = getDaysInMonth(year, month);
          const firstDay = getFirstDayOfWeek(year, month);
          const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

          const canGoPrev = new Date(year, month) > new Date(today.getFullYear(), today.getMonth());

          const cells: (number | null)[] = [];
          for (let i = 0; i < firstDay; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);

          return (
            <View style={[s.calendarCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <View style={s.calendarHeader}>
                <TouchableOpacity onPress={() => { const prev = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }; if (canGoPrev) setCalendarMonth(prev); }} disabled={!canGoPrev} activeOpacity={0.6} accessibilityLabel="Previous month" accessibilityRole="button">
                  <ChevronLeftIcon size={20} color={canGoPrev ? themeColors.text : themeColors.border} strokeWidth={2} />
                </TouchableOpacity>
                <Text style={[s.calendarMonthLabel, { color: themeColors.text }]}>{monthLabel}</Text>
                <TouchableOpacity onPress={() => { const next = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }; setCalendarMonth(next); }} activeOpacity={0.6} accessibilityLabel="Next month" accessibilityRole="button">
                  <ChevronRightIcon size={20} color={themeColors.text} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <View style={s.calendarWeekRow}>
                {WEEKDAY_LABELS.map((w) => (
                  <Text key={w} style={[s.calendarWeekDay, { color: themeColors.textMuted }]}>{w}</Text>
                ))}
              </View>
              <View style={s.calendarGrid}>
                {cells.map((day, idx) => {
                  if (day === null) return <View key={`e-${idx}`} style={s.calendarCell} />;
                  const cellDate = new Date(year, month, day);
                  cellDate.setHours(0, 0, 0, 0);
                  const isPast = cellDate < minDate;
                  const isBlocked = blockedDates.has(day);
                  const isDisabled = isPast || isBlocked;
                  const isSelected = eventDate ? isSameDay(cellDate, eventDate) : false;
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        s.calendarCell,
                        isSelected && [s.calendarCellSelected, { backgroundColor: themeColors.primary }],
                        isBlocked && !isPast && s.calendarCellBlocked,
                      ]}
                      disabled={isDisabled}
                      onPress={() => setEventDate(cellDate)}
                      activeOpacity={0.6}
                      accessibilityLabel={`${monthLabel} ${day}${isPast ? ', past date' : isBlocked ? ', vendor unavailable' : ''}${isSelected ? ', selected' : ''}`}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: isDisabled, selected: isSelected }}
                    >
                      <Text style={[
                        s.calendarDayText,
                        { color: themeColors.text },
                        isPast && { color: themeColors.border },
                        isBlocked && !isPast && s.calendarDayBlocked,
                        isSelected && s.calendarDaySelected,
                      ]}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {/* Legend */}
              <View style={s.calendarLegend}>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: themeColors.success }]} />
                  <Text style={[s.legendText, { color: themeColors.textMuted }]}>Available</Text>
                </View>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: colors.error }]} />
                  <Text style={[s.legendText, { color: themeColors.textMuted }]}>Unavailable</Text>
                </View>
              </View>
            </View>
          );
        })()}
        {eventDate && (
          <Text style={[s.selectedDateText, { color: themeColors.text }]}>
            <CalendarIcon size={14} color={themeColors.text} /> {formatDate(eventDate)}
          </Text>
        )}

        {/* Start Time */}
        <Text style={[s.label, { color: themeColors.text }]}>Start time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.timeSlotRow}>
          {TIME_SLOTS.map((slot) => (
            <TouchableOpacity
              key={`start-${slot}`}
              style={[s.timeSlotChip, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }, startTime === slot && { backgroundColor: themeColors.text, borderColor: themeColors.text }]}
              onPress={() => {
                setStartTime(slot);
                if (endTime) {
                  const s1 = parseTimeSlot(slot);
                  const e1 = parseTimeSlot(endTime);
                  if (s1.hours * 60 + s1.minutes >= e1.hours * 60 + e1.minutes) setEndTime(null);
                }
              }}
              activeOpacity={0.7}
              accessibilityLabel={`Start time ${slot}`}
              accessibilityRole="button"
              accessibilityState={{ selected: startTime === slot }}
            >
              <Text style={[s.timeSlotText, { color: themeColors.text }, startTime === slot && s.timeSlotTextActive]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* End Time */}
        <Text style={[s.label, { color: themeColors.text }]}>End time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.timeSlotRow}>
          {TIME_SLOTS.filter((slot) => {
            if (!startTime) return true;
            const s1 = parseTimeSlot(startTime);
            const e1 = parseTimeSlot(slot);
            return e1.hours * 60 + e1.minutes > s1.hours * 60 + s1.minutes;
          }).map((slot) => (
            <TouchableOpacity
              key={`end-${slot}`}
              style={[s.timeSlotChip, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }, endTime === slot && { backgroundColor: themeColors.text, borderColor: themeColors.text }]}
              onPress={() => setEndTime(slot)}
              activeOpacity={0.7}
              accessibilityLabel={`End time ${slot}`}
              accessibilityRole="button"
              accessibilityState={{ selected: endTime === slot }}
            >
              <Text style={[s.timeSlotText, { color: themeColors.text }, endTime === slot && s.timeSlotTextActive]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Duration display */}
        {startTime && endTime && (
          <View style={s.durationRow}>
            <ClockIcon size={16} color={themeColors.primary} strokeWidth={1.5} />
            <Text style={s.durationText}>Duration: {formatDuration(startTime, endTime)}</Text>
          </View>
        )}

        {/* Guest count */}
        <Text style={[s.label, { color: themeColors.text }]}>Guest count</Text>
        <TextInput
          style={[s.input, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
          value={guestCount}
          onChangeText={setGuestCount}
          placeholder="50"
          placeholderTextColor={themeColors.textMuted}
          keyboardType="number-pad"
          accessibilityLabel="Guest count"
          accessibilityHint="Enter the number of guests"
        />

        {/* Location */}
        <Text style={[s.label, { color: themeColors.text }]}>Event location</Text>
        <TextInput
          style={[s.input, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter the event address"
          placeholderTextColor={themeColors.textMuted}
          accessibilityLabel="Event location"
          accessibilityHint="Enter the address where the event will take place"
        />

        {/* Notes */}
        <Text style={[s.label, { color: themeColors.text }]}>Special requests (optional)</Text>
        <TextInput
          style={[s.input, s.inputMulti, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything the vendor should know?"
          placeholderTextColor={themeColors.textMuted}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Special requests"
          accessibilityHint="Optional notes for the vendor"
        />

        {/* Price breakdown */}
        <View style={[s.priceCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Text style={[s.priceTitle, { color: themeColors.text }]}>Price details</Text>
          <View style={s.priceRow}>
            <Text style={[s.priceLabel, { color: themeColors.textMuted }]}>
              {vendorName}{priceUnit === 'PER_HOUR' && startTime && endTime ? ' ($' + basePrice.toFixed(0) + '/hr x ' + durationHours.toFixed(durationHours % 1 === 0 ? 0 : 1) + ' hrs)' : ''}
            </Text>
            <Text style={[s.priceValue, { color: themeColors.text }]}>${vendorFee.toFixed(2)}</Text>
          </View>
          <View style={s.priceRow}>
            <Text style={[s.priceLabel, { color: themeColors.textMuted }]}>ConnectMe service fee</Text>
            <Text style={[s.priceValue, { color: themeColors.text }]}>${serviceFee.toFixed(2)}</Text>
          </View>

          {/* Promo code section */}
          <View style={s.priceDivider} />
          {!promoCode && (
            <TouchableOpacity
              onPress={() => setPromoExpanded(!promoExpanded)}
              activeOpacity={0.6}
              accessibilityLabel="Have a promo code?"
              accessibilityRole="button"
              accessibilityState={{ expanded: promoExpanded }}
              accessibilityHint="Expands promo code input field"
            >
              <Text style={s.promoToggle}>{promoExpanded ? 'Hide promo code' : 'Have a promo code?'}</Text>
            </TouchableOpacity>
          )}

          {promoExpanded && !promoCode && (
            <View style={s.promoRow}>
              <TextInput
                style={[s.promoInput, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}
                value={promoInput}
                onChangeText={setPromoInput}
                placeholder="Enter code"
                placeholderTextColor={themeColors.textMuted}
                autoCapitalize="characters"
                accessibilityLabel="Promo code input"
                accessibilityHint="Enter your promo code"
              />
              <TouchableOpacity
                style={s.promoApplyBtn}
                onPress={handleApplyPromo}
                activeOpacity={0.7}
                accessibilityLabel="Apply promo code"
                accessibilityRole="button"
              >
                <Text style={s.promoApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}

          {promoError && (
            <Text style={s.promoError} accessibilityLabel={promoError} accessibilityRole="alert">{promoError}</Text>
          )}

          {promoCode && (
            <View style={s.promoAppliedRow}>
              <Text style={s.promoSuccess} accessibilityLabel={PROMO_CODES[promoCode].label} accessibilityRole="alert">
                {PROMO_CODES[promoCode].label}
              </Text>
              <TouchableOpacity
                onPress={handleRemovePromo}
                activeOpacity={0.6}
                accessibilityLabel="Remove promo code"
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.promoRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {discount > 0 && (
            <View style={s.priceRow}>
              <Text style={[s.priceLabel, { color: colors.success }]}>Promo discount</Text>
              <Text style={[s.priceValue, { color: colors.success }]}>-${discount.toFixed(2)}</Text>
            </View>
          )}

          <View style={s.priceDivider} />

          {/* Booking Protection Upsell */}
          <TouchableOpacity
            style={[s.protectionCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }, protectionEnabled && { borderColor: colors.success, backgroundColor: themeColors.background }]}
            onPress={() => setProtectionEnabled(!protectionEnabled)}
            activeOpacity={0.7}
            accessibilityLabel={`ConnectMe Protection, ${PROTECTION_FLAT_FEE} dollars. ${protectionEnabled ? 'Enabled' : 'Disabled'}`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: protectionEnabled }}
            accessibilityHint="Double tap to toggle booking protection"
          >
            <View style={s.protectionBadgeRow}>
              <View style={s.protectionBadge}>
                <Text style={s.protectionBadgeText}>Most popular</Text>
              </View>
            </View>
            <View style={s.protectionHeader}>
              <ShieldIcon size={22} color={protectionEnabled ? colors.success : colors.primary} strokeWidth={2} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[s.protectionTitle, { color: themeColors.text }]}>ConnectMe Protection</Text>
                <Text style={[s.protectionDesc, { color: themeColors.textSecondary }]}>
                  Get a full refund for any reason up to 24 hours before your event, plus coverage for vendor no-shows and service quality issues.
                </Text>
              </View>
              <View style={[s.protectionToggle, protectionEnabled && s.protectionToggleActive]}>
                {protectionEnabled && <CheckIcon size={14} color={colors.white} strokeWidth={3} />}
              </View>
            </View>
            <Text style={s.protectionPrice}>${PROTECTION_FLAT_FEE.toFixed(2)} flat fee</Text>
            {protectionEnabled && (
              <View style={s.protectionBullets}>
                {[
                  'Full refund for any cancellation reason',
                  'Vendor no-show guarantee',
                  'Service quality protection',
                  '24/7 priority support',
                ].map((item) => (
                  <View key={item} style={s.protectionBulletRow}>
                    <CheckIcon size={14} color={colors.success} strokeWidth={2.5} />
                    <Text style={[s.protectionBulletText, { color: themeColors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>

          {protectionEnabled && (
            <View style={[s.priceRow, { marginTop: 8 }]}>
              <Text style={[s.priceLabel, { color: themeColors.textMuted }]}>ConnectMe Protection</Text>
              <Text style={[s.priceValue, { color: themeColors.text }]}>${protectionFee.toFixed(2)}</Text>
            </View>
          )}

          <View style={[s.priceDivider, { backgroundColor: themeColors.border }]} />
          <View style={s.priceRow}>
            <Text style={[s.priceTotalLabel, { color: themeColors.text }]}>Total</Text>
            <Text style={[s.priceTotalValue, { color: themeColors.text }]}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={s.note}>
          {instantBook
            ? 'Your booking will be confirmed immediately upon payment.'
            : "You won't be charged until the vendor confirms your booking."}
        </Text>
      </ScrollView>

      <View style={[s.footer, { borderTopColor: themeColors.border }]}>
        <TouchableOpacity
          style={[s.submitBtn, (!isValid || loading) && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || loading}
          activeOpacity={0.7}
          accessibilityLabel={loading
            ? (instantBook ? 'Confirming booking' : 'Sending booking request')
            : (instantBook ? 'Confirm Booking' : 'Request to book')}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isValid || loading }}
          accessibilityHint={instantBook
            ? `Confirms your booking with ${vendorName}`
            : `Sends a booking request to ${vendorName}`}
        >
          <Text style={s.submitBtnText}>
            {loading
              ? (instantBook ? 'Confirming booking...' : 'Sending request...')
              : (instantBook ? 'Confirm Booking' : 'Request to book')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  scroll: { padding: 20, paddingBottom: 100 },

  vendorCard: { backgroundColor: colors.cardBackground, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  vendorName: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  vendorPrice: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 4 },

  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginBottom: 8, marginTop: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.white },

  inputBtn: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.cardBackground },
  inputBtnText: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  inputBtnPlaceholder: { color: colors.textMuted },

  input: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: 16, height: 48, backgroundColor: colors.cardBackground },
  inputMulti: { height: 100, paddingVertical: 12, textAlignVertical: 'top' },

  // Mini calendar
  calendarCard: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: 16, backgroundColor: colors.cardBackground },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calendarMonthLabel: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text },
  calendarWeekRow: { flexDirection: 'row', marginBottom: 6 },
  calendarWeekDay: { width: '14.28%', textAlign: 'center', fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  calendarCellSelected: { backgroundColor: colors.text, borderRadius: 20 },
  calendarDayText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  calendarDayDisabled: { color: colors.border },
  calendarDaySelected: { color: colors.white, fontFamily: fonts.bold },
  calendarCellBlocked: { backgroundColor: '#FEE2E2', borderRadius: 6 },
  calendarDayBlocked: { color: colors.error, textDecorationLine: 'line-through' as const },
  calendarLegend: { flexDirection: 'row', gap: 16, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: fonts.regular, fontSize: 11 },
  selectedDateText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text, marginTop: 8 },

  // Time slot pickers
  timeSlotRow: { paddingVertical: 4, gap: 8 },
  timeSlotChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.cardBackground },
  timeSlotChipActive: { backgroundColor: colors.text, borderColor: colors.text },
  timeSlotText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  timeSlotTextActive: { color: colors.white },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.backgroundWarm ?? colors.cardBackground, borderRadius: borderRadius.sm },
  durationText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary },

  priceCard: { backgroundColor: colors.cardBackground, borderRadius: 12, padding: 16, marginTop: 24, borderWidth: 1, borderColor: colors.border },
  priceTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  priceValue: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  priceDivider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  priceTotalLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  priceTotalValue: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },

  promoToggle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.accent, paddingVertical: 4 },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  promoInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: 12, height: 40, backgroundColor: colors.white },
  promoApplyBtn: { backgroundColor: colors.accent, borderRadius: borderRadius.sm, paddingHorizontal: 16, height: 40, alignItems: 'center', justifyContent: 'center' },
  promoApplyText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.white },
  promoError: { fontFamily: fonts.medium, fontSize: 13, color: colors.error, marginTop: 6 },
  promoSuccess: { fontFamily: fonts.medium, fontSize: 13, color: colors.success, flex: 1 },
  promoAppliedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 },
  promoRemove: { fontFamily: fonts.bold, fontSize: 16, color: colors.textMuted, paddingHorizontal: 8 },

  protectionCard: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, padding: 14, marginVertical: 8, backgroundColor: colors.white },
  protectionCardActive: { borderColor: colors.success, backgroundColor: '#F0FDF4' },
  protectionBadgeRow: { flexDirection: 'row', marginBottom: 8 },
  protectionBadge: { backgroundColor: colors.warning, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  protectionBadgeText: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
  protectionHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  protectionTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, marginBottom: 4 },
  protectionDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  protectionToggle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginLeft: 8, marginTop: 2 },
  protectionToggleActive: { backgroundColor: colors.success, borderColor: colors.success },
  protectionPrice: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary, marginTop: 8, marginLeft: 32 },
  protectionBullets: { marginTop: 10, marginLeft: 32, gap: 6 },
  protectionBulletRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  protectionBulletText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },

  note: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 18 },

  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
