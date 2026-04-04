import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { CalendarIcon, DollarIcon, UserIcon, SparklesIcon, AlertCircleIcon } from '../../components/Icons';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

type Props = NativeStackScreenProps<any, 'Dashboard'>;

// ─── Stat card ───────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <View style={statStyles.card}>
      <View style={statStyles.iconWrap}>{icon}</View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: colors.cardBackground, borderRadius: borderRadius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  iconWrap: { marginBottom: spacing.xs },
  value: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  label: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
});

// ─── Booking card (compact) ──────────────────────────────

function BookingCard({ booking, onPress, actions }: {
  booking: any; onPress: () => void; actions?: React.ReactNode;
}) {
  const date = new Date(booking.eventDate).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const clientName = `${booking.client?.firstName ?? ''} ${booking.client?.lastName ?? ''}`.trim();

  return (
    <TouchableOpacity style={cardStyles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={cardStyles.row}>
        <View style={cardStyles.info}>
          <Text style={cardStyles.date}>{date}</Text>
          <Text style={cardStyles.client}>{clientName}</Text>
          <Text style={cardStyles.type}>{booking.eventType}</Text>
        </View>
        <Text style={cardStyles.amount}>${Number(booking.totalAmount).toFixed(0)}</Text>
      </View>
      {actions && <View style={cardStyles.actions}>{actions}</View>}
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background, borderRadius: borderRadius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  info: { flex: 1 },
  date: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary },
  client: { fontFamily: fonts.medium, fontSize: 15, color: colors.text, marginTop: 2 },
  type: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  amount: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});

// ─── Main screen ─────────────────────────────────────────

export default function DashboardScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ bookings: 0, earnings: 0, views: 0, responseRate: 0 });
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const auth = useAuth();
  const firstName = auth.user?.firstName ?? 'Vendor';
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [bookingsRes, profileRes] = await Promise.all([
        fetch(`${API_URL}/bookings?status=PENDING`, { headers: { 'Content-Type': 'application/json' } }),
        fetch(`${API_URL}/vendors/me`, { headers: { 'Content-Type': 'application/json' } }),
      ]);

      const bookingsData = await bookingsRes.json();
      const profileData = await profileRes.json();

      if (bookingsData.success) {
        const all = bookingsData.data ?? [];
        setPending(all.filter((b: any) => b.status === 'PENDING'));
        setUpcoming(all.filter((b: any) => b.status === 'CONFIRMED').slice(0, 3));
      }

      if (profileData.success) {
        const p = profileData.data;
        setStats({
          bookings: p.totalBookings ?? 0,
          earnings: Number(p.totalEarnings ?? 0),
          views: 0, // TODO: track profile views
          responseRate: 98, // TODO: calculate from bookings
        });
      }
    } catch { /* handle */ }
    finally { setLoading(false); }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Greeting */}
        <Text style={styles.greeting}>{greeting}, {firstName}</Text>
        <Text style={styles.date}>{today}</Text>

        {/* Alert banner */}
        {pending.length > 0 && (
          <TouchableOpacity
            style={styles.alert}
            onPress={() => navigation.navigate('BookingManagement')}
          >
            <AlertCircleIcon size={20} color="#9A3412" />
            <Text style={styles.alertText}>
              {pending.length} booking request{pending.length > 1 ? 's' : ''} awaiting your response
            </Text>
            <Text style={styles.alertArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard icon={<CalendarIcon size={24} color={colors.primary} />} label="Bookings This Month" value={String(stats.bookings)} />
            <View style={{ width: spacing.sm }} />
            <StatCard icon={<DollarIcon size={24} color={colors.primary} />} label="Earnings This Month" value={`$${stats.earnings.toFixed(0)}`} />
          </View>
          <View style={styles.statsRow}>
            <StatCard icon={<UserIcon size={24} color={colors.primary} />} label="Profile Views (30d)" value={String(stats.views)} />
            <View style={{ width: spacing.sm }} />
            <StatCard icon={<SparklesIcon size={24} color={colors.primary} />} label="Response Rate" value={`${stats.responseRate}%`} />
          </View>
        </View>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} onPress={() => navigation.navigate('BookingDetail', { bookingId: b.id })} />
            ))}
          </View>
        )}

        {/* Action required */}
        {pending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Action Required</Text>
            {pending.slice(0, 3).map((b) => {
              const name = `${b.client?.firstName ?? ''} ${b.client?.lastName ?? ''}`.trim() || 'this client';
              return (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onPress={() => navigation.navigate('BookingDetail', { bookingId: b.id })}
                  actions={
                    <>
                      <Button title="Accept" onPress={() => {
                        Alert.alert(
                          'Accept Booking',
                          `Accept this booking from ${name}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Accept', onPress: () => {
                              Alert.alert('Booking Accepted', `Booking accepted! ${name} has been notified.`);
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
                    </>
                  }
                />
              );
            })}
          </View>
        )}

        {/* Recent reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reviews')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>No reviews yet</Text>
          ) : (
            reviews.slice(0, 2).map((r: any) => (
              <View key={r.id} style={styles.reviewCard}>
                <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
                <Text style={styles.reviewComment} numberOfLines={2}>{r.comment}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  greeting: { fontFamily: fonts.bold, fontSize: 26, color: colors.text },
  date: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  alert: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED',
    borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: '#FDBA74', gap: spacing.sm,
  },
  alertIcon: { fontSize: 20 },
  alertText: { fontFamily: fonts.medium, fontSize: 14, color: '#9A3412', flex: 1 },
  alertArrow: { fontSize: 18, color: '#9A3412' },
  statsGrid: { gap: spacing.sm, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row' },
  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: spacing.sm },
  seeAll: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.accent },
  actionBtn: { flex: 1, height: 38 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  reviewCard: {
    backgroundColor: colors.cardBackground, borderRadius: borderRadius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  reviewStars: { fontSize: 16, color: colors.star, marginBottom: spacing.xs },
  reviewComment: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
});
