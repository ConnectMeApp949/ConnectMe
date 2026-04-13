import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from '../../components/Icons';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Generate deterministic blocked dates for demo purposes.
 * Blocks every Wednesday plus some random weekends seeded by vendorId + month.
 */
function generateBlockedDates(year: number, month: number, vendorId: string): Set<number> {
  const blocked = new Set<number>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Simple seed from vendorId string
  let seed = 0;
  for (let i = 0; i < (vendorId?.length ?? 0); i++) {
    seed += vendorId.charCodeAt(i);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dow = date.getDay();

    // Block every Wednesday
    if (dow === 3) {
      blocked.add(day);
    }

    // Block some weekends based on seed
    if ((dow === 0 || dow === 6) && ((seed + day) % 3 === 0)) {
      blocked.add(day);
    }
  }

  return blocked;
}

interface AvailabilityCalendarProps {
  vendorId: string;
}

export default function AvailabilityCalendar({ vendorId }: AvailabilityCalendarProps) {
  const { colors: themeColors } = useTheme();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const blockedDates = useMemo(
    () => generateBlockedDates(viewYear, viewMonth, vendorId),
    [viewYear, viewMonth, vendorId],
  );

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const todayDate = today.getDate();

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Can't go before current month
  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  // Build grid cells: leading blanks + day numbers
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View accessibilityRole="none" accessibilityLabel={`Availability calendar for ${monthLabel}`}>
      {/* Month navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity
          onPress={goToPrevMonth}
          disabled={!canGoPrev}
          style={styles.navButton}
          accessibilityLabel="Previous month"
          accessibilityRole="button"
        >
          <ChevronLeftIcon size={28} color={canGoPrev ? themeColors.primary : themeColors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: themeColors.text }]}>{monthLabel}</Text>
        <TouchableOpacity
          onPress={goToNextMonth}
          style={styles.navButton}
          accessibilityLabel="Next month"
          accessibilityRole="button"
        >
          <ChevronRightIcon size={28} color={themeColors.primary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Day-of-week headers */}
      <View style={styles.weekRow}>
        {DAY_LABELS.map((d) => (
          <View key={d} style={styles.dayCell}>
            <Text style={[styles.dayHeader, { color: themeColors.textMuted }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <View key={`blank-${idx}`} style={styles.dayCell} />;
          }

          const isPast = isCurrentMonth && day < todayDate;
          const isToday = isCurrentMonth && day === todayDate;
          const isBlocked = blockedDates.has(day);

          const cellBg = isBlocked && !isPast ? '#FEE2E2' : 'transparent';

          return (
            <View
              key={`day-${day}`}
              style={[
                styles.dayCell,
                { backgroundColor: cellBg },
                isToday && [styles.todayCell, { borderColor: themeColors.primary }],
              ]}
              accessibilityLabel={`${monthLabel.split(' ')[0]} ${day}${isBlocked ? ', unavailable' : isPast ? ', past date' : ', available'}`}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: themeColors.text },
                  isPast && { color: themeColors.textMuted },
                  isBlocked && !isPast && { color: colors.error, textDecorationLine: 'line-through' as const },
                ]}
              >
                {day}
              </Text>
              {isBlocked && !isPast && <View style={styles.blockedX}><XIcon size={8} color={colors.error} strokeWidth={2} /></View>}
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: themeColors.success }]} />
          <Text style={[styles.legendText, { color: themeColors.textMuted }]}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: themeColors.error }]} />
          <Text style={[styles.legendText, { color: themeColors.textMuted }]}>Unavailable</Text>
        </View>
      </View>

      {/* Request text */}
      <Text style={[styles.requestText, { color: themeColors.textSecondary }]}>
        Don't see your date? Request availability from the vendor.
      </Text>
    </View>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navButton: {
    padding: spacing.sm,
  },
  navArrow: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '600',
  },
  navDisabled: {
    color: colors.textMuted,
  },
  monthLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  dayHeader: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  dayText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  blockedX: {
    position: 'absolute',
    fontSize: 8,
    color: colors.error,
    bottom: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  requestText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
});
