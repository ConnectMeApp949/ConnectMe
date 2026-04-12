import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeftIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'ModifyBooking'>;

export default function ModifyBookingScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const { token } = useAuth();
  const booking = (route.params as any)?.booking;
  const vendor = booking?.vendor;
  const vendorName = vendor?.businessName ?? 'Unknown Vendor';

  // Original values
  const originalDate = booking?.eventDate ? new Date(booking.eventDate) : new Date();
  const originalGuestCount = String(booking?.guestCount ?? '');
  const originalLocation = booking?.eventLocation ?? '';
  const originalNotes = booking?.notes ?? '';

  const originalDateLabel = originalDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const originalTimeLabel = booking?.eventStartTime
    ? `${new Date(booking.eventStartTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}${booking?.eventEndTime ? ` – ${new Date(booking.eventEndTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}`
    : 'N/A';

  // Editable state
  const [eventDate, setEventDate] = useState<Date>(originalDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guestCount, setGuestCount] = useState(originalGuestCount);
  const [location, setLocation] = useState(originalLocation);
  const [notes, setNotes] = useState(originalNotes);
  const [loading, setLoading] = useState(false);

  function formatDate(d: Date): string {
    return d.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  // Determine what changed
  const changes = useMemo(() => {
    const list: { field: string; from: string; to: string }[] = [];
    if (formatDate(eventDate) !== formatDate(originalDate)) {
      list.push({ field: 'Event Date', from: formatDate(originalDate), to: formatDate(eventDate) });
    }
    if (guestCount.trim() !== originalGuestCount.trim() && guestCount.trim() !== '') {
      list.push({ field: 'Guest Count', from: originalGuestCount || 'Not set', to: guestCount });
    }
    if (location.trim() !== originalLocation.trim()) {
      list.push({ field: 'Location', from: originalLocation || 'Not set', to: location });
    }
    if (notes.trim() !== originalNotes.trim()) {
      list.push({ field: 'Special Requests', from: originalNotes || 'None', to: notes || 'None' });
    }
    return list;
  }, [eventDate, guestCount, location, notes]);

  const hasChanges = changes.length > 0;

  async function handleSubmit() {
    if (!hasChanges) return;
    setLoading(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
      const res = await fetch(`${API_URL}/bookings/${booking?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          eventDate: eventDate.toISOString(),
          guestCount: parseInt(guestCount, 10) || undefined,
          eventLocation: location,
          notes,
        }),
      });
      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Modification failed');
      }
      Alert.alert(
        'Modification Request Sent',
        'The vendor will review your changes and respond within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Modify Booking</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Current booking summary */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Current Booking</Text>
          <Text style={s.summaryVendor}>{vendorName}</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Date</Text>
            <Text style={s.summaryValue}>{originalDateLabel}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Time</Text>
            <Text style={s.summaryValue}>{originalTimeLabel}</Text>
          </View>
          {originalLocation ? (
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Location</Text>
              <Text style={s.summaryValue}>{originalLocation}</Text>
            </View>
          ) : null}
          {originalGuestCount ? (
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Guests</Text>
              <Text style={s.summaryValue}>{originalGuestCount}</Text>
            </View>
          ) : null}
        </View>

        {/* Editable fields */}
        <Text style={s.sectionHeader}>Make Changes</Text>

        {/* Event date */}
        <Text style={s.label}>Event date</Text>
        <TouchableOpacity
          style={s.inputBtn}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.6}
          accessibilityLabel={`Event date: ${formatDate(eventDate)}`}
          accessibilityRole="button"
          accessibilityHint="Opens a date picker to change the event date"
        >
          <Text style={s.inputBtnText}>{formatDate(eventDate)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={eventDate}
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
          placeholder="Number of guests"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          accessibilityLabel="Guest count"
          accessibilityHint="Enter the updated number of guests"
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
          accessibilityHint="Enter the updated address where the event will take place"
        />

        {/* Notes */}
        <Text style={s.label}>Special requests / notes</Text>
        <TextInput
          style={[s.input, s.inputMulti]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything the vendor should know?"
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Special requests"
          accessibilityHint="Optional notes for the vendor about your changes"
        />

        {/* Change summary */}
        {hasChanges && (
          <View style={s.changesCard}>
            <Text style={s.changesTitle}>Changes Summary</Text>
            {changes.map((c) => (
              <View key={c.field} style={s.changeRow}>
                <Text style={s.changeField}>{c.field}</Text>
                <Text style={s.changeFrom}>{c.from}</Text>
                <Text style={s.changeArrow}>→</Text>
                <Text style={s.changeTo}>{c.to}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Note text */}
        <Text style={s.note}>
          Changes are subject to vendor approval. You'll be notified when the vendor confirms your modifications.
        </Text>

        {/* Submit button */}
        <TouchableOpacity
          style={[s.submitBtn, (!hasChanges || loading) && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!hasChanges || loading}
          activeOpacity={0.7}
          accessibilityLabel={loading ? 'Sending modification request' : 'Request changes'}
          accessibilityRole="button"
          accessibilityState={{ disabled: !hasChanges || loading }}
          accessibilityHint="Sends your booking modification request to the vendor"
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={s.submitBtnText}>Request Changes</Text>
          )}
        </TouchableOpacity>

        {/* Cancel link */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.6}
          style={s.cancelLink}
          accessibilityLabel="Never mind, go back"
          accessibilityRole="button"
          accessibilityHint="Cancels modification and returns to booking details"
        >
          <Text style={s.cancelLinkText}>Never mind</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  scroll: { padding: 20, paddingBottom: 40 },

  // Current booking summary
  summaryCard: {
    backgroundColor: colors.cardBackground, borderRadius: borderRadius.md, padding: spacing.md,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  summaryTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginBottom: 4 },
  summaryVendor: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.accent, marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  summaryLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  summaryValue: { fontFamily: fonts.medium, fontSize: 13, color: colors.text, flexShrink: 1, textAlign: 'right' },

  // Section
  sectionHeader: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 4, marginTop: 4 },

  // Form fields
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginBottom: 8, marginTop: 16 },
  inputBtn: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md,
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.cardBackground,
  },
  inputBtnText: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  input: {
    fontFamily: fonts.regular, fontSize: 15, color: colors.text,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md,
    paddingHorizontal: 16, height: 48, backgroundColor: colors.cardBackground,
  },
  inputMulti: { height: 100, paddingVertical: 12, textAlignVertical: 'top' },

  // Change summary
  changesCard: {
    backgroundColor: colors.lightBlue, borderRadius: borderRadius.md, padding: spacing.md,
    marginTop: spacing.lg, borderWidth: 1, borderColor: colors.accent,
  },
  changesTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.accent, marginBottom: 12 },
  changeRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    paddingVertical: 6, gap: 6,
  },
  changeField: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, width: '100%' },
  changeFrom: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, flexShrink: 1 },
  changeArrow: { fontFamily: fonts.bold, fontSize: 13, color: colors.accent },
  changeTo: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.accent, flexShrink: 1 },

  // Note
  note: {
    fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted,
    textAlign: 'center', marginTop: spacing.lg, lineHeight: 18,
  },

  // Submit
  submitBtn: {
    backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 16,
    alignItems: 'center', marginTop: spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },

  // Cancel link
  cancelLink: { alignItems: 'center', marginTop: spacing.md, paddingVertical: 8 },
  cancelLinkText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
