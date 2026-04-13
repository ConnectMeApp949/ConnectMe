import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import {
  CalendarIcon, CheckIcon, DollarIcon, StarIcon, SettingsIcon, SparklesIcon,
  ChevronRightIcon, BarChartIcon,
} from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'VendorDashboard'>;

export default function VendorDashboardScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const auth = useAuth();
  const firstName = auth.user?.firstName ?? 'Vendor';
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const [refreshing, setRefreshing] = useState(false);

  const stats = [
    { Icon: CalendarIcon, value: '0', label: 'Pending requests' },
    { Icon: CheckIcon, value: '0', label: 'Confirmed bookings' },
    { Icon: DollarIcon, value: '$0', label: 'This month' },
    { Icon: StarIcon, value: 'New', label: 'Rating' },
  ];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); /* Re-fetch dashboard data when API is connected */ setRefreshing(false); }} tintColor={themeColors.primary} />}
      >
        <Text style={[s.greeting, { color: themeColors.text }]}>{greeting}, {firstName}</Text>
        <Text style={[s.date, { color: themeColors.textMuted }]}>{today}</Text>

        {/* Stats grid */}
        <View style={s.statsGrid}>
          {stats.map((stat) => {
            const StatIcon = stat.Icon;
            return (
              <View key={stat.label} style={[s.statCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <View style={[s.statIconBox, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                  <StatIcon size={20} color={themeColors.primary} />
                </View>
                <Text style={[s.statValue, { color: themeColors.text }]}>{stat.value}</Text>
                <Text style={[s.statLabel, { color: themeColors.textMuted }]}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Quick actions */}
        <Text style={[s.sectionTitle, { color: themeColors.text }]}>Quick actions</Text>
        <TouchableOpacity style={[s.actionCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]} activeOpacity={0.7} onPress={() => navigation.navigate('VendorBookings')} accessibilityLabel="Manage bookings" accessibilityRole="button" accessibilityHint="View and respond to booking requests">
          <View style={s.actionLeft}>
            <View style={[s.actionIconBox, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <CalendarIcon size={20} color={themeColors.primary} />
            </View>
            <View>
              <Text style={[s.actionTitle, { color: themeColors.text }]}>Manage bookings</Text>
              <Text style={[s.actionSub, { color: themeColors.textSecondary }]}>View and respond to booking requests</Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.actionCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]} activeOpacity={0.7} onPress={() => navigation.navigate('VendorEarnings')} accessibilityLabel="Earnings" accessibilityRole="button" accessibilityHint="View your revenue and payouts">
          <View style={s.actionLeft}>
            <View style={[s.actionIconBox, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <DollarIcon size={20} color={themeColors.primary} />
            </View>
            <View>
              <Text style={[s.actionTitle, { color: themeColors.text }]}>Earnings</Text>
              <Text style={[s.actionSub, { color: themeColors.textSecondary }]}>View your revenue and payouts</Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.actionCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]} activeOpacity={0.7} onPress={() => navigation.navigate('VendorEditListing')} accessibilityLabel="Edit listing" accessibilityRole="button" accessibilityHint="Update photos, pricing, and description">
          <View style={s.actionLeft}>
            <View style={[s.actionIconBox, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <SettingsIcon size={20} color={themeColors.primary} />
            </View>
            <View>
              <Text style={[s.actionTitle, { color: themeColors.text }]}>Edit listing</Text>
              <Text style={[s.actionSub, { color: themeColors.textSecondary }]}>Update photos, pricing, and description</Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.actionCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]} activeOpacity={0.7} onPress={() => navigation.navigate('VendorCalendar')} accessibilityLabel="Availability" accessibilityRole="button" accessibilityHint="Set your schedule and block dates">
          <View style={s.actionLeft}>
            <View style={[s.actionIconBox, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <CalendarIcon size={20} color={themeColors.primary} />
            </View>
            <View>
              <Text style={[s.actionTitle, { color: themeColors.text }]}>Availability</Text>
              <Text style={[s.actionSub, { color: themeColors.textSecondary }]}>Set your schedule and block dates</Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.actionCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]} activeOpacity={0.7} onPress={() => navigation.navigate('VendorAnalytics')} accessibilityLabel="Analytics" accessibilityRole="button" accessibilityHint="View your performance insights and metrics">
          <View style={s.actionLeft}>
            <View style={[s.actionIconBox, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <BarChartIcon size={20} color={themeColors.primary} />
            </View>
            <View>
              <Text style={[s.actionTitle, { color: themeColors.text }]}>Analytics</Text>
              <Text style={[s.actionSub, { color: themeColors.textSecondary }]}>View your performance insights</Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>

        {/* Tips */}
        <View style={[s.tipCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.primary }]}>
          <View style={[s.tipIconBox, { backgroundColor: themeColors.background }]}>
            <SparklesIcon size={18} color={themeColors.primary} />
          </View>
          <View style={s.tipContent}>
            <Text style={[s.tipTitle, { color: themeColors.text }]}>Tip: Complete your profile</Text>
            <Text style={[s.tipText, { color: themeColors.textSecondary }]}>Vendors with complete profiles and photos get 3x more bookings. Make sure to add at least 5 photos!</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { paddingHorizontal: 20, paddingTop: 12 },
  greeting: { fontFamily: fonts.bold, fontSize: 26, color: colors.text },
  date: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 24 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  statCard: {
    width: '48%', backgroundColor: colors.cardBackground, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  statIconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.cardBackground,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  statValue: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  statLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 4, textAlign: 'center' },

  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 12 },

  actionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
    elevation: 1, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  actionIconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.cardBackground,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  actionTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  actionSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  actionArrow: { fontSize: 22, color: colors.textMuted },

  tipCard: {
    flexDirection: 'row', backgroundColor: colors.lightBlue, borderRadius: 12, padding: 16,
    marginTop: 20, borderWidth: 1, borderColor: colors.primary, gap: 12,
  },
  tipIconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.cardBackground,
    alignItems: 'center', justifyContent: 'center',
  },
  tipContent: { flex: 1 },
  tipTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  tipText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginTop: 4 },
});
