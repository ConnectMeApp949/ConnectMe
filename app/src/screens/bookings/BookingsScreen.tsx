import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarIcon, CheckIcon, XIcon, SearchIcon } from '../../components/Icons';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import Skeleton from '../../components/Skeleton';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

type Props = NativeStackScreenProps<any, 'Bookings'>;

const TAB_KEYS = ['upcoming', 'completed', 'cancelled'] as const;
type TabKey = typeof TAB_KEYS[number];

export default function BookingsScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const { t } = useLanguage();
  const auth = useAuth();
  const { token } = auth;
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [activeTab, token]);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  async function fetchBookings() {
    setLoading(true);
    try {
      const statusMap: Record<TabKey, string> = {
        upcoming: 'CONFIRMED,PENDING',
        completed: 'COMPLETED',
        cancelled: 'CANCELLED',
      };
      const res = await fetch(`${API_URL}/bookings?status=${statusMap[activeTab]}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }
      const data = await res.json();
      if (data.success) setBookings(data.data ?? []);
      else setBookings([]);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  function renderBooking({ item }: { item: any }) {
    const vendorName = item.vendor?.businessName ?? 'Unknown Vendor';
    const vendorPhoto = item.vendor?.coverPhoto ?? null;
    const date = new Date(item.eventDate).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={[s.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('BookingDetail', { booking: item })}
        accessibilityLabel={`Booking with ${vendorName}, ${date}, $${Number(item.totalAmount).toFixed(0)}`}
        accessibilityRole="button"
        accessibilityHint="Opens booking details"
      >
        {vendorPhoto ? (
          <Image source={{ uri: vendorPhoto }} style={s.cardImage} accessibilityLabel={`${vendorName} photo`} accessibilityRole="image" />
        ) : (
          <View style={[s.cardImage, s.cardImageFallback]}>
            <Text style={s.cardImageText}>{vendorName[0]}</Text>
          </View>
        )}
        <View style={s.cardContent}>
          <Text style={[s.cardVendor, { color: themeColors.text }]} numberOfLines={1}>{vendorName}</Text>
          <Text style={[s.cardType, { color: themeColors.textSecondary }]}>{item.eventType}</Text>
          <Text style={[s.cardDate, { color: themeColors.textSecondary }]}>{date}</Text>
        </View>
        <Text style={[s.cardAmount, { color: themeColors.text }]}>${Number(item.totalAmount).toFixed(0)}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <Text style={[s.header, { color: themeColors.text }]}>{t('bookings')}</Text>

      {/* Tabs */}
      <View style={s.tabRow}>
        {TAB_KEYS.map((tabKey) => (
          <TouchableOpacity
            key={tabKey}
            style={[s.tab, { borderColor: themeColors.border }, activeTab === tabKey && s.tabActive, activeTab === tabKey && { backgroundColor: themeColors.text, borderColor: themeColors.text }]}
            onPress={() => setActiveTab(tabKey)}
            activeOpacity={0.7}
            accessibilityLabel={`${t(tabKey)} ${t('bookings')}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tabKey }}
          >
            <Text style={[s.tabText, { color: themeColors.text }, activeTab === tabKey && { color: themeColors.background }]}>{t(tabKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!auth.user ? (
        <View style={s.empty}>
          <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <CalendarIcon size={36} color={themeColors.textSecondary} strokeWidth={1.5} />
          </View>
          <Text style={[s.emptyTitle, { color: themeColors.text }]}>Sign in to view your bookings</Text>
          <Text style={[s.emptySub, { color: themeColors.textSecondary }]}>Create an account to book vendors and manage your events</Text>
          <TouchableOpacity style={s.exploreBtn} onPress={() => navigation.navigate('Onboarding')} activeOpacity={0.7} accessibilityLabel="Sign In" accessibilityRole="button">
            <Text style={s.exploreBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={{ padding: 20 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={s.card}>
              <Skeleton width={56} height={56} borderRadius={10} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="65%" height={14} />
                <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
                <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
              </View>
              <Skeleton width={44} height={16} style={{ marginLeft: 8 }} />
            </View>
          ))}
        </View>
      ) : bookings.length === 0 ? (
        <View style={s.empty}>
          <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            {activeTab === 'upcoming' ? <CalendarIcon size={36} color={themeColors.textSecondary} strokeWidth={1.5} /> : activeTab === 'completed' ? <CheckIcon size={36} color={themeColors.textSecondary} strokeWidth={1.5} /> : <XIcon size={36} color={themeColors.textSecondary} strokeWidth={1.5} />}
          </View>
          <Text style={[s.emptyTitle, { color: themeColors.text }]}>{t('noResults')}</Text>
          <Text style={[s.emptySub, { color: themeColors.textSecondary }]}>
            {activeTab === 'upcoming'
              ? 'When you book a vendor, your upcoming events will appear here'
              : activeTab === 'completed'
                ? 'Your completed bookings will show here'
                : 'Cancelled bookings will appear here'}
          </Text>
          {activeTab === 'upcoming' && (
            <TouchableOpacity style={s.exploreBtn} onPress={() => (navigation as any).navigate('Explore')} activeOpacity={0.7} accessibilityLabel="Start exploring" accessibilityRole="button" accessibilityHint="Browse vendors to book">
              <Text style={s.exploreBtnText}>Start exploring</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { fontFamily: fonts.bold, fontSize: 28, color: colors.text, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.text, borderColor: colors.text },
  tabText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  tabTextActive: { color: colors.white },
  list: { padding: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12,
    padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  cardImage: { width: 56, height: 56, borderRadius: 12 },
  cardImageFallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  cardImageText: { fontFamily: fonts.bold, fontSize: 20, color: colors.white },
  cardContent: { flex: 1, marginLeft: 12 },
  cardVendor: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  cardType: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  cardDate: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  cardAmount: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginLeft: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 8 },
  emptySub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  exploreBtn: { marginTop: 20, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32 },
  exploreBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },
});
