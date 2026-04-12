import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, CalendarIcon } from '../../components/Icons';
import Skeleton from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

type Props = NativeStackScreenProps<any, 'PastBookings'>;

export default function PastBookingsScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await fetch(`${API_URL}/bookings?status=COMPLETED`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.data ?? []);
      }
    } catch {
      Alert.alert('Error', 'Unable to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function renderBooking({ item }: { item: any }) {
    const vendorName = item.vendor?.businessName ?? 'Unknown Vendor';
    const vendorPhoto = item.vendor?.coverPhoto ?? null;
    const amount = Number(item.totalAmount ?? 0).toFixed(2);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('BookingDetail', { booking: item })}
        accessibilityLabel={`Booking with ${vendorName}, ${item.eventType}, $${amount}`}
        accessibilityRole="button"
        accessibilityHint="View booking details"
      >
        {/* Vendor photo */}
        {vendorPhoto ? (
          <Image source={{ uri: vendorPhoto }} style={styles.vendorPhoto} accessibilityLabel={`${vendorName} photo`} accessibilityRole="image" />
        ) : (
          <View style={styles.vendorPhotoFallback}>
            <Text style={styles.vendorPhotoText}>{vendorName[0]}</Text>
          </View>
        )}

        {/* Booking info */}
        <View style={styles.cardContent}>
          <Text style={[styles.vendorName, { color: themeColors.text }]} numberOfLines={1}>{vendorName}</Text>
          <Text style={[styles.serviceType, { color: themeColors.textMuted }]}>{item.eventType}</Text>
          <Text style={[styles.bookingDate, { color: themeColors.textMuted }]}>{formatDate(item.eventDate)}</Text>
        </View>

        {/* Amount */}
        <Text style={[styles.amount, { color: themeColors.text }]}>${amount}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Past Bookings</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={{ padding: 20 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.card}>
              <Skeleton width={48} height={48} borderRadius={24} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="70%" height={14} />
                <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
                <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
              </View>
              <Skeleton width={50} height={16} style={{ marginLeft: 12 }} />
            </View>
          ))}
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <CalendarIcon size={36} color={themeColors.textMuted} strokeWidth={1.5} />
          </View>
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No past bookings yet</Text>
          <Text style={[styles.emptySub, { color: themeColors.textMuted }]}>Start discovering vendors on ConnectMe</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
  },

  // List
  list: {
    padding: 20,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  vendorPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  vendorPhotoFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorPhotoText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.white,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  vendorName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  serviceType: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  bookingDate: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  amount: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
