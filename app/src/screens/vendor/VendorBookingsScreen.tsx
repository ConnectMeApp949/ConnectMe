import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { CalendarIcon, CheckIcon, ClockIcon, ChevronLeftIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'VendorBookings'>;

const TABS = ['Pending', 'Confirmed', 'Completed'] as const;

// Placeholder bookings for demonstration; in production these come from an API
const DEMO_BOOKINGS: any[] = [];

export default function VendorBookingsScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Pending');

  const filteredBookings = DEMO_BOOKINGS.filter(
    (b) => b.status?.toUpperCase() === activeTab.toUpperCase(),
  );

  function renderBookingCard({ item: booking }: { item: any }) {
    const clientName = booking.client?.name ?? booking.client?.displayName ?? 'Client';
    const clientAvatar = booking.client?.avatar ?? booking.client?.profilePhoto ?? null;
    const eventDate = booking.date
      ? new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';
    const isCompleted = activeTab === 'Completed';

    return (
      <View style={[s.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
        <View style={s.cardRow}>
          {clientAvatar ? (
            <Image source={{ uri: clientAvatar }} style={s.avatar} accessibilityLabel={`${clientName} photo`} accessibilityRole="image" />
          ) : (
            <View style={s.avatarFallback}>
              <Text style={s.avatarText}>{clientName[0]}</Text>
            </View>
          )}
          <View style={s.cardInfo}>
            <Text style={[s.cardName, { color: themeColors.text }]}>{clientName}</Text>
            {eventDate !== '' && <Text style={[s.cardDate, { color: themeColors.textSecondary }]}>{eventDate}</Text>}
            {booking.eventType && <Text style={[s.cardService, { color: themeColors.textMuted }]}>{booking.eventType}</Text>}
          </View>
        </View>
        {isCompleted && (
          <TouchableOpacity
            style={s.reviewBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ReviewClient', { client: booking.client, bookingDate: booking.date })}
            accessibilityLabel={`Review client ${clientName}`}
            accessibilityRole="button"
            accessibilityHint={`Leave a review for ${clientName}`}
          >
            <Text style={[s.reviewBtnText]}>Review Client</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Manage Bookings</Text>
        <View style={s.backBtn} />
      </View>
      <View style={[s.tabRow, { borderBottomColor: themeColors.border }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              s.tab,
              { borderBottomColor: 'transparent' },
              activeTab === tab && { borderBottomColor: themeColors.primary },
            ]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
            accessibilityLabel={`${tab} bookings`}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text style={[s.tabText, { color: themeColors.textMuted }, activeTab === tab && { color: themeColors.text, fontFamily: fonts.semiBold }]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={s.empty}>
          <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            {activeTab === 'Pending' ? <ClockIcon size={36} color={themeColors.textMuted} strokeWidth={1.5} /> : activeTab === 'Confirmed' ? <CalendarIcon size={36} color={themeColors.textMuted} strokeWidth={1.5} /> : <CheckIcon size={36} color={themeColors.textMuted} strokeWidth={1.5} />}
          </View>
          <Text style={[s.emptyTitle, { color: themeColors.text }]}>No {activeTab.toLowerCase()} bookings</Text>
          <Text style={[s.emptySub, { color: themeColors.textMuted }]}>When clients book your services, they'll appear here</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2 },
  tabText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted },
  listContent: { paddingHorizontal: 20, paddingBottom: spacing.xl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 8 },
  emptySub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },

  // Booking card
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 18, color: colors.white },
  cardInfo: { marginLeft: spacing.sm, flex: 1 },
  cardName: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  cardDate: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  cardService: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  reviewBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  reviewBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary },
});
