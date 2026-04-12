import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Calendar from 'expo-calendar';
import { colors, fonts, borderRadius } from '../../theme';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, RefreshCwIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'VendorCalendar'>;
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatSyncTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 60000) return 'just now';
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function VendorCalendarScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [syncedBusyDates, setSyncedBusyDates] = useState<Set<string>>(new Set());
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) arr.push(i);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [year, month]);

  function dateKey(y: number, m: number, d: number): string {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function toggleDate(day: number) {
    const key = dateKey(year, month, day);
    setBlockedDates((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }

  function isBlocked(day: number) {
    return blockedDates.has(dateKey(year, month, day));
  }

  function isSyncedBusy(day: number) {
    return syncedBusyDates.has(dateKey(year, month, day));
  }

  function isToday(day: number) {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  }

  const requestCalendarPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Calendar access is needed to sync your availability. Please enable it in your device settings.',
      );
      return false;
    }
    return true;
  }, []);

  const handleImportFromCalendar = useCallback(async () => {
    const granted = await requestCalendarPermission();
    if (!granted) return;

    setSyncing(true);
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      const events = await Calendar.getEventsAsync(
        calendars.map((c) => c.id),
        startDate,
        endDate,
      );

      const busyDates = new Set<string>();
      for (const event of events) {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const cursor = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
        const endDay = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());

        while (cursor <= endDay) {
          busyDates.add(dateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
          cursor.setDate(cursor.getDate() + 1);
        }
      }

      setSyncedBusyDates(busyDates);
      setLastSyncTime(new Date());
      Alert.alert('Import Complete', `Marked ${busyDates.size} date(s) as busy from your device calendar.`);
    } catch (error) {
      Alert.alert('Sync Failed', 'Could not read calendar events. Please try again.');
    } finally {
      setSyncing(false);
    }
  }, [requestCalendarPermission]);

  const handleExportBlockedDates = useCallback(async () => {
    const granted = await requestCalendarPermission();
    if (!granted) return;

    if (blockedDates.size === 0) {
      Alert.alert('No Blocked Dates', 'You have no blocked dates to export.');
      return;
    }

    setSyncing(true);
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const writableCalendar = calendars.find((c) => c.allowsModifications);

      let calendarId: string;
      if (writableCalendar) {
        calendarId = writableCalendar.id;
      } else {
        calendarId = await Calendar.createCalendarAsync({
          title: 'ConnectMe',
          color: colors.primary,
          entityType: Calendar.EntityTypes.EVENT,
          source: Platform.OS === 'ios'
            ? { isLocalAccount: true, name: 'ConnectMe', type: Calendar.CalendarType.LOCAL as any }
            : { isLocalAccount: true, name: 'ConnectMe' } as any,
          name: 'ConnectMe',
          ownerAccount: 'ConnectMe',
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });
      }

      let created = 0;
      for (const dateStr of blockedDates) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const startDate = new Date(y, m - 1, d, 0, 0, 0);
        const endDate = new Date(y, m - 1, d, 23, 59, 59);
        await Calendar.createEventAsync(calendarId, {
          title: 'ConnectMe - Blocked',
          startDate,
          endDate,
          allDay: true,
          notes: 'Blocked date exported from ConnectMe vendor calendar.',
        });
        created++;
      }

      setLastSyncTime(new Date());
      Alert.alert('Export Complete', `Created ${created} event(s) in your device calendar.`);
    } catch (error) {
      Alert.alert('Export Failed', 'Could not create calendar events. Please try again.');
    } finally {
      setSyncing(false);
    }
  }, [blockedDates, requestCalendarPermission]);

  function handleSyncPress() {
    Alert.alert(
      'Sync with Calendar',
      'Choose a sync direction:',
      [
        {
          text: 'Import from Device Calendar',
          onPress: handleImportFromCalendar,
        },
        {
          text: 'Export Blocked Dates',
          onPress: handleExportBlockedDates,
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Availability</Text>
        <View style={s.backBtn} />
      </View>

      <View style={s.content}>
        {/* Sync with Calendar button */}
        <TouchableOpacity
          style={s.syncButton}
          onPress={handleSyncPress}
          activeOpacity={0.7}
          disabled={syncing}
          accessibilityLabel="Sync with Calendar"
          accessibilityRole="button"
          accessibilityHint="Opens options to import or export calendar events"
        >
          <CalendarIcon size={18} color={colors.white} strokeWidth={2} />
          <Text style={s.syncButtonText}>{syncing ? 'Syncing...' : 'Sync with Calendar'}</Text>
        </TouchableOpacity>

        {/* Sync status indicator */}
        {lastSyncTime && (
          <View style={s.syncStatusRow}>
            <Text style={s.syncStatusText}>Last synced: {formatSyncTime(lastSyncTime)}</Text>
            <TouchableOpacity
              onPress={handleImportFromCalendar}
              activeOpacity={0.6}
              disabled={syncing}
              accessibilityLabel="Re-sync calendar"
              accessibilityRole="button"
              accessibilityHint="Imports calendar events again"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RefreshCwIcon size={14} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        <View style={s.monthRow}>
          <TouchableOpacity onPress={() => setCurrentMonth(new Date(year, month - 1, 1))} accessibilityLabel="Previous month" accessibilityRole="button"><ChevronLeftIcon size={28} color={colors.primary} strokeWidth={1.5} /></TouchableOpacity>
          <Text style={s.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={() => setCurrentMonth(new Date(year, month + 1, 1))} accessibilityLabel="Next month" accessibilityRole="button"><ChevronRightIcon size={28} color={colors.primary} strokeWidth={1.5} /></TouchableOpacity>
        </View>

        <View style={s.weekRow}>
          {WEEKDAYS.map((d) => <Text key={d} style={s.weekDay}>{d}</Text>)}
        </View>

        <View style={s.grid}>
          {days.map((day, i) => {
            if (day === null) return <View key={i} style={s.cell} />;
            const blocked = isBlocked(day);
            const busy = isSyncedBusy(day) && !blocked;
            const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return (
              <TouchableOpacity
                key={i}
                style={[s.cell, isToday(day) && s.cellToday, blocked && s.cellBlocked, busy && s.cellBusy]}
                onPress={() => !isPast && toggleDate(day)}
                disabled={isPast}
                activeOpacity={0.6}
                accessibilityLabel={`${new Date(year, month, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}${blocked ? ', blocked' : ''}${busy ? ', busy from calendar' : ''}${isToday(day) ? ', today' : ''}${isPast ? ', past date' : ''}`}
                accessibilityRole="button"
                accessibilityHint={isPast ? 'Past date, cannot be changed' : blocked ? 'Double tap to unblock this date' : 'Double tap to block this date'}
              >
                <Text style={[s.dayText, isPast && s.dayPast, blocked && s.dayBlocked, busy && s.dayBusy, isToday(day) && !blocked && !busy && s.dayToday]}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.legend}>
          <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: colors.error }]} /><Text style={s.legendText}>Blocked</Text></View>
          <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: colors.warning }]} /><Text style={s.legendText}>Calendar busy</Text></View>
          <View style={s.legendItem}><View style={[s.legendDot, { borderWidth: 1.5, borderColor: colors.primary }]} /><Text style={s.legendText}>Today</Text></View>
        </View>
        <Text style={s.hint}>Tap any future date to block/unblock</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  content: { paddingHorizontal: 20, paddingTop: 16 },

  syncButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: 12, paddingHorizontal: 20, gap: 8, marginBottom: 8 },
  syncButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.white },
  syncStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  syncStatusText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },

  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  arrow: { fontSize: 28, color: colors.primary, paddingHorizontal: 8 },
  monthLabel: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekDay: { flex: 1, textAlign: 'center', fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  cellToday: { borderWidth: 1.5, borderColor: colors.primary },
  cellBlocked: { backgroundColor: '#FEE2E2' },
  cellBusy: { backgroundColor: '#FEF3C7' },
  dayText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  dayPast: { color: colors.border },
  dayBlocked: { color: colors.error, fontFamily: fonts.bold },
  dayBusy: { color: '#B45309', fontFamily: fonts.bold },
  dayToday: { color: colors.primary, fontFamily: fonts.bold },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  hint: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
});
