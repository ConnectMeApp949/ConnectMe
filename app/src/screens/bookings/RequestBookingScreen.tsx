import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, CalendarIcon, ShieldIcon, CheckIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'RequestBooking'>;

const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Quinceañera', 'Festival', 'Private Party', 'Other'];

const PROMO_CODES: Record<string, { type: 'percent' | 'flat'; value: number; label: string }> = {
  WELCOME10: { type: 'percent', value: 10, label: 'WELCOME10 applied — 10% off!' },
  FIRST20: { type: 'percent', value: 20, label: 'FIRST20 applied — 20% off!' },
  CONNECT5: { type: 'flat', value: 5, label: 'CONNECT5 applied — $5 off!' },
};

export default function RequestBookingScreen({ navigation, route }: Props) {
  const vendor = (route.params as any)?.vendor;
  const instantBook = (route.params as any)?.instantBook === true;
  const vendorName = vendor?.businessName ?? 'Vendor';
  const basePrice = Number(vendor?.basePrice ?? 0);

  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guestCount, setGuestCount] = useState('50');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const [promoExpanded, setPromoExpanded] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [protectionEnabled, setProtectionEnabled] = useState(false);

  const PROTECTION_FLAT_FEE = 9.99;

  const serviceFee = parseFloat((basePrice * 0.05).toFixed(2));
  const subtotal = basePrice + serviceFee;

  const discount = (() => {
    if (!promoCode) return 0;
    const promo = PROMO_CODES[promoCode];
    if (!promo) return 0;
    if (promo.type === 'percent') return parseFloat((subtotal * (promo.value / 100)).toFixed(2));
    return Math.min(promo.value, subtotal);
  })();

  const protectionFee = protectionEnabled ? PROTECTION_FLAT_FEE : 0;
  const total = parseFloat((subtotal - discount + protectionFee).toFixed(2));
  const isValid = eventType && eventDate && location.trim();

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

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    // TODO: call POST /bookings API
    setTimeout(() => {
      setLoading(false);
      navigation.replace('BookingConfirmation', {
        instantBook,
        vendor,
        eventDate: eventDate?.toISOString() ?? '',
        eventLocation: location,
        guestCount,
        totalAmount: total.toFixed(2),
        eventType,
      });
    }, 1500);
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{instantBook ? 'Confirm and Pay' : 'Request to book'}</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Vendor summary */}
        <View style={s.vendorCard}>
          <Text style={s.vendorName}>{vendorName}</Text>
          <Text style={s.vendorPrice}>${basePrice.toFixed(0)} {vendor?.priceUnit?.replace(/_/g, ' ').toLowerCase()}</Text>
        </View>

        {/* Event type */}
        <Text style={s.label}>Event type</Text>
        <View style={s.chipRow}>
          {EVENT_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.chip, eventType === t && s.chipActive]}
              onPress={() => setEventType(t)}
              activeOpacity={0.7}
              accessibilityLabel={t}
              accessibilityRole="button"
              accessibilityState={{ selected: eventType === t }}
            >
              <Text style={[s.chipText, eventType === t && s.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date */}
        <Text style={s.label}>Event date</Text>
        <TouchableOpacity style={s.inputBtn} onPress={() => setShowDatePicker(true)} activeOpacity={0.6} accessibilityLabel={eventDate ? `Event date: ${formatDate(eventDate)}` : 'Select event date'} accessibilityRole="button" accessibilityHint="Opens a date picker">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <CalendarIcon size={18} color={eventDate ? colors.text : colors.textMuted} />
            <Text style={[s.inputBtnText, !eventDate && s.inputBtnPlaceholder]}>
              {eventDate ? formatDate(eventDate) : 'Select a date'}
            </Text>
          </View>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={eventDate || new Date()}
            mode="date"
            minimumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e: DateTimePickerEvent, d?: Date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (d) setEventDate(d);
            }}
          />
        )}

        {/* Guest count */}
        <Text style={s.label}>Guest count</Text>
        <TextInput
          style={s.input}
          value={guestCount}
          onChangeText={setGuestCount}
          placeholder="50"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          accessibilityLabel="Guest count"
          accessibilityHint="Enter the number of guests"
        />

        {/* Location */}
        <Text style={s.label}>Event location</Text>
        <TextInput
          style={s.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter the event address"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Event location"
          accessibilityHint="Enter the address where the event will take place"
        />

        {/* Notes */}
        <Text style={s.label}>Special requests (optional)</Text>
        <TextInput
          style={[s.input, s.inputMulti]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything the vendor should know?"
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Special requests"
          accessibilityHint="Optional notes for the vendor"
        />

        {/* Price breakdown */}
        <View style={s.priceCard}>
          <Text style={s.priceTitle}>Price details</Text>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>{vendorName}</Text>
            <Text style={s.priceValue}>${basePrice.toFixed(2)}</Text>
          </View>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>ConnectMe service fee</Text>
            <Text style={s.priceValue}>${serviceFee.toFixed(2)}</Text>
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
                style={s.promoInput}
                value={promoInput}
                onChangeText={setPromoInput}
                placeholder="Enter code"
                placeholderTextColor={colors.textMuted}
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
            style={[s.protectionCard, protectionEnabled && s.protectionCardActive]}
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
                <Text style={s.protectionTitle}>ConnectMe Protection</Text>
                <Text style={s.protectionDesc}>
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
                    <Text style={s.protectionBulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>

          {protectionEnabled && (
            <View style={[s.priceRow, { marginTop: 8 }]}>
              <Text style={s.priceLabel}>ConnectMe Protection</Text>
              <Text style={s.priceValue}>${protectionFee.toFixed(2)}</Text>
            </View>
          )}

          <View style={s.priceDivider} />
          <View style={s.priceRow}>
            <Text style={s.priceTotalLabel}>Total</Text>
            <Text style={s.priceTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={s.note}>
          {instantBook
            ? 'Your booking will be confirmed immediately upon payment.'
            : "You won't be charged until the vendor confirms your booking."}
        </Text>
      </ScrollView>

      <View style={s.footer}>
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
  submitBtn: { backgroundColor: colors.secondary, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
