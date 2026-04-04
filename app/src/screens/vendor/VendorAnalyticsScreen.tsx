import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import {
  ChevronLeftIcon, EyeIcon, SearchIcon, CalendarIcon, CheckIcon,
  ClockIcon, TrendingUpIcon, TrendingDownIcon, BarChartIcon,
  SparklesIcon, AwardIcon,
} from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'VendorAnalytics'>;

type Period = 'week' | 'month' | 'year';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

// Mock data by period
const METRICS: Record<Period, { profileViews: number; profileTrend: number; searchAppearances: number; searchTrend: number; bookingRequests: number; bookingTrend: number; conversionRate: number; conversionTrend: number; avgResponseTime: string; avgResponseHours: number; responseRate: number; funnelViews: number; funnelInquiries: number; funnelBookings: number }> = {
  week: {
    profileViews: 245, profileTrend: 12,
    searchAppearances: 1430, searchTrend: 8,
    bookingRequests: 12, bookingTrend: -3,
    conversionRate: 67, conversionTrend: 5,
    avgResponseTime: '1.5 hours', avgResponseHours: 1.5,
    responseRate: 98,
    funnelViews: 245, funnelInquiries: 18, funnelBookings: 12,
  },
  month: {
    profileViews: 980, profileTrend: 15,
    searchAppearances: 5720, searchTrend: 10,
    bookingRequests: 48, bookingTrend: 7,
    conversionRate: 71, conversionTrend: 3,
    avgResponseTime: '1.2 hours', avgResponseHours: 1.2,
    responseRate: 99,
    funnelViews: 980, funnelInquiries: 68, funnelBookings: 48,
  },
  year: {
    profileViews: 11760, profileTrend: 22,
    searchAppearances: 68640, searchTrend: 18,
    bookingRequests: 576, bookingTrend: 12,
    conversionRate: 65, conversionTrend: 2,
    avgResponseTime: '1.8 hours', avgResponseHours: 1.8,
    responseRate: 96,
    funnelViews: 11760, funnelInquiries: 886, funnelBookings: 576,
  },
};

const TIPS = [
  'Respond within 1 hour to boost your ranking',
  'Add 2 more photos to increase views by 20%',
  'Update your pricing to stay competitive',
];

function formatNumber(n: number): string {
  if (n >= 1000) {
    return n.toLocaleString();
  }
  return String(n);
}

export default function VendorAnalyticsScreen({ navigation }: Props) {
  const [period, setPeriod] = useState<Period>('week');
  const data = METRICS[period];

  const metricCards = [
    {
      label: 'Profile Views',
      value: formatNumber(data.profileViews),
      trend: data.profileTrend,
      Icon: EyeIcon,
    },
    {
      label: 'Search Appearances',
      value: formatNumber(data.searchAppearances),
      trend: data.searchTrend,
      Icon: SearchIcon,
    },
    {
      label: 'Booking Requests',
      value: formatNumber(data.bookingRequests),
      trend: data.bookingTrend,
      Icon: CalendarIcon,
    },
    {
      label: 'Conversion Rate',
      value: `${data.conversionRate}%`,
      trend: data.conversionTrend,
      Icon: CheckIcon,
    },
  ];

  const maxFunnel = data.funnelViews;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.6}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Analytics</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Period toggle */}
        <View style={s.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[s.periodBtn, period === p.id && s.periodBtnActive]}
              onPress={() => setPeriod(p.id)}
              activeOpacity={0.7}
              accessibilityLabel={`${p.label} period`}
              accessibilityRole="button"
              accessibilityState={{ selected: period === p.id }}
            >
              <Text style={[s.periodText, period === p.id && s.periodTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key metrics cards - 2x2 grid */}
        <View style={s.metricsGrid}>
          {metricCards.map((metric) => {
            const MetricIcon = metric.Icon;
            const isPositive = metric.trend >= 0;
            return (
              <View key={metric.label} style={s.metricCard}>
                <View style={s.metricHeader}>
                  <View style={s.metricIconBox}>
                    <MetricIcon size={16} color={colors.text} />
                  </View>
                  <View style={[s.trendBadge, isPositive ? s.trendBadgeUp : s.trendBadgeDown]}>
                    {isPositive ? (
                      <TrendingUpIcon size={12} color={colors.success} strokeWidth={2} />
                    ) : (
                      <TrendingDownIcon size={12} color={colors.error} strokeWidth={2} />
                    )}
                    <Text style={[s.trendText, isPositive ? s.trendTextUp : s.trendTextDown]}>
                      {isPositive ? '+' : ''}{metric.trend}%
                    </Text>
                  </View>
                </View>
                <Text style={s.metricValue}>{metric.value}</Text>
                <Text style={s.metricLabel}>{metric.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Response metrics section */}
        <Text style={s.sectionTitle}>Response Metrics</Text>
        <View style={s.responseCard}>
          <View style={s.responseRow}>
            <View style={s.responseLeft}>
              <ClockIcon size={18} color={colors.text} />
              <View style={s.responseInfo}>
                <Text style={s.responseLabel}>Average Response Time</Text>
                <Text style={s.responseValue}>{data.avgResponseTime}</Text>
              </View>
            </View>
          </View>
          <View style={s.progressBarBg}>
            <View
              style={[
                s.progressBarFill,
                {
                  width: `${Math.min((data.avgResponseHours / 4) * 100, 100)}%`,
                  backgroundColor: data.avgResponseHours < 2 ? colors.success : colors.warning,
                },
              ]}
            />
          </View>

          <View style={s.responseDivider} />

          <View style={s.responseRow}>
            <View style={s.responseLeft}>
              <CheckIcon size={18} color={colors.text} />
              <View style={s.responseInfo}>
                <Text style={s.responseLabel}>Response Rate</Text>
                <Text style={s.responseValue}>{data.responseRate}%</Text>
              </View>
            </View>
          </View>
          <View style={s.progressBarBg}>
            <View
              style={[
                s.progressBarFill,
                {
                  width: `${data.responseRate}%`,
                  backgroundColor: data.responseRate >= 95 ? colors.success : colors.warning,
                },
              ]}
            />
          </View>

          {data.responseRate > 95 && (
            <View style={s.badgeRow}>
              <View style={s.badge}>
                <AwardIcon size={14} color={colors.primary} strokeWidth={2} />
                <Text style={s.badgeText}>Top 10% of vendors in your area</Text>
              </View>
            </View>
          )}
        </View>

        {/* Booking funnel */}
        <Text style={s.sectionTitle}>Booking Funnel</Text>
        <View style={s.funnelCard}>
          {[
            { label: 'Views', value: data.funnelViews },
            { label: 'Inquiries', value: data.funnelInquiries },
            { label: 'Bookings', value: data.funnelBookings },
          ].map((step, idx, arr) => (
            <View key={step.label}>
              <View style={s.funnelRow}>
                <Text style={s.funnelLabel}>{step.label}</Text>
                <Text style={s.funnelValue}>{formatNumber(step.value)}</Text>
              </View>
              <View style={s.funnelBarBg}>
                <View
                  style={[
                    s.funnelBarFill,
                    { width: `${Math.max((step.value / maxFunnel) * 100, 5)}%` },
                  ]}
                />
              </View>
              {idx < arr.length - 1 && (
                <View style={s.funnelArrowRow}>
                  <BarChartIcon size={12} color={colors.textMuted} />
                  <Text style={s.funnelArrowText}>
                    {((arr[idx + 1].value / step.value) * 100).toFixed(0)}% conversion
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Performance tips */}
        <Text style={s.sectionTitle}>Performance Tips</Text>
        <View style={s.tipsCard}>
          {TIPS.map((tip, idx) => (
            <View key={idx} style={[s.tipRow, idx < TIPS.length - 1 && s.tipRowBorder]}>
              <View style={s.tipIconBox}>
                <SparklesIcon size={14} color={colors.text} />
              </View>
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  // Period toggle
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  periodBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  periodBtnActive: { borderColor: colors.text, backgroundColor: colors.lightBlue },
  periodText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  periodTextActive: { color: colors.text, fontFamily: fonts.semiBold },

  // Metrics grid
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  metricCard: {
    width: '48%', backgroundColor: colors.cardBackground, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  metricHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
  },
  metricIconBox: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6,
  },
  trendBadgeUp: { backgroundColor: '#DCFCE7' },
  trendBadgeDown: { backgroundColor: '#FEE2E2' },
  trendText: { fontFamily: fonts.semiBold, fontSize: 11 },
  trendTextUp: { color: colors.success },
  trendTextDown: { color: colors.error },
  metricValue: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  metricLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },

  // Section title
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 12 },

  // Response metrics
  responseCard: {
    backgroundColor: colors.cardBackground, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 28,
  },
  responseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  responseLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  responseInfo: {},
  responseLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  responseValue: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginTop: 2 },
  progressBarBg: {
    height: 6, backgroundColor: colors.border, borderRadius: 3, marginTop: 10, overflow: 'hidden',
  },
  progressBarFill: { height: 6, borderRadius: 3 },
  responseDivider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  badgeRow: { marginTop: 14 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEF2E4', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: '#E8D5B8',
    alignSelf: 'flex-start',
  },
  badgeText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.primary },

  // Funnel
  funnelCard: {
    backgroundColor: colors.cardBackground, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 28,
  },
  funnelRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
  },
  funnelLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  funnelValue: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  funnelBarBg: {
    height: 24, backgroundColor: colors.border, borderRadius: 6, overflow: 'hidden',
  },
  funnelBarFill: {
    height: 24, backgroundColor: colors.primary, borderRadius: 6,
  },
  funnelArrowRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 8, justifyContent: 'center',
  },
  funnelArrowText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },

  // Tips
  tipsCard: {
    backgroundColor: colors.lightBlue, borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: colors.primary,
  },
  tipRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
  },
  tipRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.primary },
  tipIconBox: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: colors.cardBackground,
    alignItems: 'center', justifyContent: 'center',
  },
  tipText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 19 },
});
