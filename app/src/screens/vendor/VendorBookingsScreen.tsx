import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { CalendarIcon, CheckIcon, ClockIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'VendorBookings'>;

const TABS = ['Pending', 'Confirmed', 'Completed'] as const;

// Placeholder bookings for demonstration; in production these come from an API
const DEMO_BOOKINGS: any[] = [];

export default function VendorBookingsScreen({ navigation }: Props) {
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
      <View style={s.card}>
        <View style={s.cardRow}>
          {clientAvatar ? (
            <Image source={{ uri: clientAvatar }} style={s.avatar} accessibilityLabel={`${clientName} photo`} accessibilityRole="image" />
          ) : (
            <View style={s.avatarFallback}>
              <Text style={s.avatarText}>{clientName[0]}</Text>
            </View>
          )}
          <View style={s.cardInfo}>
            <Text style={s.cardName}>{clientName}</Text>
            {eventDate !== '' && <Text style={s.cardDate}>{eventDate}</Text>}
            {booking.eventType && <Text style={s.cardService}>{booking.eventType}</Text>}
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
            <Text style={s.reviewBtnText}>Review Client</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Text style={s.header}>Bookings</Text>
      <View style={s.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && s.tabActive]} onPress={() => setActiveTab(tab)} activeOpacity={0.7} accessibilityLabel={`${tab} bookings`} accessibilityRole="button" accessibilityState={{ selected: activeTab === tab }}>
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
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
          <View style={s.emptyIconWrap}>
            {activeTab === 'Pending' ? <ClockIcon size={36} color={colors.textMuted} strokeWidth={1.5} /> : activeTab === 'Confirmed' ? <CalendarIcon size={36} color={colors.textMuted} strokeWidth={1.5} /> : <CheckIcon size={36} color={colors.textMuted} strokeWidth={1.5} />}
          </View>
          <Text style={s.emptyTitle}>No {activeTab.toLowerCase()} bookings</Text>
          <Text style={s.emptySub}>When clients book your services, they'll appear here</Text>
        </View>
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
  listContent: { paddingHorizontal: 20, paddingBottom: spacing.xl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.border },
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
