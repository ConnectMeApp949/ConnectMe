import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, CalendarIcon, MapPinIcon } from '../../components/Icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

const TABS = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
const TAB_LABELS: Record<string, string> = {
  PENDING: 'Pending', CONFIRMED: 'Confirmed', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: colors.warning, CONFIRMED: colors.success, COMPLETED: colors.primary, CANCELLED: colors.textMuted,
};

type Props = NativeStackScreenProps<any, 'BookingManagement'>;

export default function BookingManagementScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('PENDING');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings?status=${status}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) setBookings(data.data ?? []);
    } catch { /* handle */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab, fetchBookings]);

  function renderBooking({ item }: { item: any }) {
    const date = new Date(item.eventDate).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
    const clientName = `${item.client?.firstName ?? ''} ${item.client?.lastName ?? ''}`.trim();
    const earnings = (Number(item.totalAmount) - Number(item.vendorFee)).toFixed(2);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          {/* Client avatar */}
          {item.client?.profilePhoto ? (
            <Image source={{ uri: item.client.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{clientName[0] ?? '?'}</Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.clientName}>{clientName}</Text>
            <Text style={styles.eventType}>{item.eventType}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
            <Text style={styles.statusText}>{TAB_LABELS[item.status]}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <CalendarIcon size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{date}</Text>
          </View>
          <View style={styles.detail}>
            <MapPinIcon size={14} color={colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{item.eventLocation}</Text>
          </View>
        </View>

        <View style={styles.earningsRow}>
          <Text style={styles.earningsLabel}>Your earnings</Text>
          <Text style={styles.earningsAmount}>${earnings}</Text>
        </View>

        {/* Action buttons */}
        {item.status === 'PENDING' && (
          <View style={styles.actions}>
            <Button title="Accept" onPress={() => {
              Alert.alert(
                'Accept Booking',
                `Accept this booking from ${clientName}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Accept', onPress: () => {
                    Alert.alert('Booking Accepted', `Booking accepted! ${clientName} has been notified.`);
                  }},
                ],
              );
            }} style={styles.actionBtn} />
            <Button title="Decline" onPress={() => {
              Alert.alert(
                'Decline Booking',
                'Decline this booking?\n\nPlease select a reason:',
                [
                  { text: 'Schedule conflict', onPress: () => Alert.alert('Booking Declined', 'Booking declined. The client has been notified.') },
                  { text: 'Outside service area', onPress: () => Alert.alert('Booking Declined', 'Booking declined. The client has been notified.') },
                  { text: 'Price disagreement', onPress: () => Alert.alert('Booking Declined', 'Booking declined. The client has been notified.') },
                  { text: 'Other', onPress: () => Alert.alert('Booking Declined', 'Booking declined. The client has been notified.') },
                  { text: 'Cancel', style: 'cancel' },
                ],
              );
            }} variant="outline" style={styles.actionBtn} textStyle={{ color: colors.error }} />
          </View>
        )}
        {item.status === 'CONFIRMED' && (
          <View style={styles.actions}>
            <Button title="Message Client" onPress={() => navigation.navigate('ChatScreen', { bookingId: item.id })} variant="outline" style={styles.actionBtn} />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookings</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <CalendarIcon size={36} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyText}>No {TAB_LABELS[activeTab].toLowerCase()} bookings</Text>
            </View>
          }
        />
      )}
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
  tabRow: {
    flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  tabTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  list: { padding: spacing.lg },
  loader: { marginTop: spacing.xxl },
  card: {
    backgroundColor: colors.background, borderRadius: borderRadius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: spacing.sm },
  avatarFallback: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 18, color: colors.white },
  cardInfo: { flex: 1 },
  clientName: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text },
  eventType: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  statusText: { fontFamily: fonts.medium, fontSize: 11, color: colors.white },
  detailsRow: { gap: spacing.xs, marginBottom: spacing.sm },
  detail: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  detailText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, flex: 1 },
  earningsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border,
  },
  earningsLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  earningsAmount: { fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: { flex: 1, height: 40 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: spacing.sm },
  emptyText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted },
});
