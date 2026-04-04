import React, { useState } from 'react';
import {
  View, Text, TextInput as RNTextInput, StyleSheet, TouchableOpacity, Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import { BookingFlowParamList, BookingDraft } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { CalendarIcon, ClockIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<BookingFlowParamList, 'EventDetails'>;

const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Festival', 'Private Party', 'Other'];

export default function EventDetailsScreen({ navigation, route }: Props) {
  const { vendor, draft } = route.params;

  const [eventType, setEventType] = useState(draft?.eventType ?? '');
  const [eventDate, setEventDate] = useState<Date | null>(
    draft?.eventDate ? new Date(draft.eventDate) : null
  );
  const [startTime, setStartTime] = useState<Date | null>(
    draft?.startTime ? new Date(draft.startTime) : null
  );
  const [endTime, setEndTime] = useState<Date | null>(
    draft?.endTime ? new Date(draft.endTime) : null
  );
  const [guestCount, setGuestCount] = useState(draft?.guestCount ?? 50);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const isValid = eventType.trim() && eventDate && startTime && endTime && guestCount > 0;

  const nextDraft: BookingDraft = {
    eventType,
    eventDate: eventDate?.toISOString(),
    startTime: startTime?.toISOString(),
    endTime: endTime?.toISOString(),
    guestCount,
  };

  function formatDate(d: Date | null): string {
    if (!d) return 'Select date';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatTime(d: Date | null): string {
    if (!d) return 'Select time';
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  return (
    <ProfileSetupLayout
      step={1}
      totalSteps={6}
      title="Event details"
      subtitle={`Booking with ${vendor.businessName}`}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('Location', { vendor, draft: nextDraft })}
      continueDisabled={!isValid}
    >
      {/* Event type */}
      <Text style={styles.label}>What type of event?</Text>
      <View style={styles.chipRow}>
        {EVENT_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, eventType === t && styles.chipActive]}
            onPress={() => setEventType(t)}
          >
            <Text style={[styles.chipText, eventType === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date picker */}
      <Text style={styles.label}>Event date</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <CalendarIcon size={18} color={eventDate ? colors.text : colors.textMuted} />
          <Text style={[styles.pickerText, !eventDate && styles.pickerPlaceholder]}>
            {formatDate(eventDate)}
          </Text>
        </View>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={eventDate || tomorrow}
          mode="date"
          minimumDate={tomorrow}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e: DateTimePickerEvent, d?: Date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (d) setEventDate(d);
          }}
        />
      )}

      {/* Time pickers */}
      <View style={styles.timeRow}>
        <View style={styles.timeCol}>
          <Text style={styles.label}>Start time</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStartPicker(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ClockIcon size={18} color={startTime ? colors.text : colors.textMuted} />
              <Text style={[styles.pickerText, !startTime && styles.pickerPlaceholder]}>
                {formatTime(startTime)}
              </Text>
            </View>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startTime || new Date()}
              mode="time"
              minuteInterval={15}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e: DateTimePickerEvent, d?: Date) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (d) setStartTime(d);
              }}
            />
          )}
        </View>
        <View style={styles.timeCol}>
          <Text style={styles.label}>End time</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowEndPicker(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ClockIcon size={18} color={endTime ? colors.text : colors.textMuted} />
              <Text style={[styles.pickerText, !endTime && styles.pickerPlaceholder]}>
                {formatTime(endTime)}
              </Text>
            </View>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endTime || new Date()}
              mode="time"
              minuteInterval={15}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e: DateTimePickerEvent, d?: Date) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (d) setEndTime(d);
              }}
            />
          )}
        </View>
      </View>

      {/* Guest count */}
      <Text style={styles.label}>Guest count</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => setGuestCount(Math.max(1, guestCount - 10))}
        >
          <Text style={styles.counterButtonText}>−</Text>
        </TouchableOpacity>
        <RNTextInput
          style={styles.counterInput}
          value={String(guestCount)}
          onChangeText={(t) => { const n = parseInt(t); if (!isNaN(n) && n > 0) setGuestCount(n); }}
          keyboardType="number-pad"
          textAlign="center"
        />
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => setGuestCount(guestCount + 10)}
        >
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.white,
  },
  pickerButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground,
  },
  pickerText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  pickerPlaceholder: {
    color: colors.textMuted,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timeCol: {
    flex: 1,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.primary,
  },
  counterInput: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
    width: 80,
    textAlign: 'center',
  },
});
