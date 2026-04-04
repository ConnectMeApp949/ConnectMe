import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api-production-dda7.up.railway.app';

type DateMarker = 'blocked' | 'confirmed' | 'pending';

type Props = NativeStackScreenProps<any, 'Availability'>;

export default function AvailabilityScreen({ navigation }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [markers, setMarkers] = useState<Record<string, DateMarker>>({});
  const [loading, setLoading] = useState(true);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);

    return days;
  }, [year, month]);

  useEffect(() => {
    loadBookings();
  }, [currentMonth]);

  async function loadBookings() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        const newMarkers: Record<string, DateMarker> = { ...markers };
        // Keep existing blocked dates
        Object.entries(markers).forEach(([k, v]) => {
          if (v === 'blocked') newMarkers[k] = 'blocked';
        });
        // Add booking markers
        (data.data ?? []).forEach((b: any) => {
          const key = new Date(b.eventDate).toISOString().split('T')[0];
          if (b.status === 'CONFIRMED') newMarkers[key] = 'confirmed';
          else if (b.status === 'PENDING') newMarkers[key] = 'pending';
        });
        setMarkers(newMarkers);
      }
    } catch { /* handle */ }
    finally { setLoading(false); }
  }

  function toggleDate(day: number) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const current = markers[key];

    // Can only toggle blocked status, not booking markers
    if (current === 'confirmed' || current === 'pending') return;

    setMarkers((prev) => {
      const next = { ...prev };
      if (current === 'blocked') delete next[key];
      else next[key] = 'blocked';
      return next;
    });
    // TODO: Save blocked dates to API
  }

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  function getMarker(day: number): DateMarker | undefined {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return markers[key];
  }

  const MARKER_COLORS: Record<DateMarker, string> = {
    blocked: colors.error,
    confirmed: colors.accent,
    pending: colors.warning,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Availability</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Month navigation */}
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthArrow}>
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthArrow}>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Weekday headers */}
        <View style={styles.weekRow}>
          {WEEKDAYS.map((d) => (
            <Text key={d} style={styles.weekDay}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <View style={styles.grid}>
            {calendarDays.map((day, i) => {
              if (day === null) return <View key={i} style={styles.dayCell} />;

              const marker = getMarker(day);
              const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dayCell,
                    isToday(day) && styles.dayCellToday,
                    marker && { backgroundColor: MARKER_COLORS[marker] + '20' },
                  ]}
                  onPress={() => !isPast && toggleDate(day)}
                  disabled={isPast}
                  activeOpacity={0.6}
                >
                  <Text style={[
                    styles.dayText,
                    isPast && styles.dayTextPast,
                    isToday(day) && styles.dayTextToday,
                  ]}>
                    {day}
                  </Text>
                  {marker && (
                    <View style={[styles.marker, { backgroundColor: MARKER_COLORS[marker] }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
            <Text style={styles.legendText}>Blocked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <Text style={styles.legendText}>Confirmed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.legendText}>Pending</Text>
          </View>
        </View>

        <Text style={styles.hint}>Tap any future date to block/unblock it.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  scroll: { paddingHorizontal: spacing.lg },

  monthRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginVertical: spacing.md,
  },
  monthArrow: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 28, color: colors.primary },
  monthLabel: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },

  weekRow: { flexDirection: 'row', marginBottom: spacing.sm },
  weekDay: {
    flex: 1, textAlign: 'center', fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: borderRadius.sm, position: 'relative',
  },
  dayCellToday: { borderWidth: 2, borderColor: colors.primary },
  dayText: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  dayTextPast: { color: colors.textMuted },
  dayTextToday: { color: colors.primary, fontFamily: fonts.bold },
  marker: {
    position: 'absolute', bottom: 4, width: 6, height: 6, borderRadius: 3,
  },

  legend: {
    flexDirection: 'row', justifyContent: 'center', gap: spacing.lg,
    marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  hint: {
    fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center',
    marginTop: spacing.sm,
  },
  loader: { paddingVertical: spacing.xxl },
});
