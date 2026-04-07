import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, AlertCircleIcon, FileTextIcon } from '../../components/Icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

interface TierInfo {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  features: string[];
  highlight?: boolean;
}

const TIERS: TierInfo[] = [
  {
    id: 'SPARK',
    name: 'Spark',
    price: 0,
    priceLabel: 'Free',
    features: [
      '5 bookings per month',
      'Basic vendor profile',
      'Standard search placement',
      'Email support',
      'ConnectMe branding on profile',
    ],
  },
  {
    id: 'IGNITE',
    name: 'Ignite',
    price: 49,
    priceLabel: '$49/mo',
    highlight: true,
    features: [
      'Unlimited bookings',
      'Priority search listing',
      'Analytics dashboard',
      'Priority support',
      'Custom profile URL',
    ],
  },
  {
    id: 'AMPLIFY',
    name: 'Amplify',
    price: 99,
    priceLabel: '$99/mo',
    features: [
      'Everything in Ignite',
      'Featured placement in search',
      'Promoted in category pages',
      'Dedicated account manager',
      'Marketing tools & insights',
    ],
  },
];

type Props = NativeStackScreenProps<any, 'Subscription'>;

export default function SubscriptionScreen({ navigation }: Props) {
  const [currentTier, setCurrentTier] = useState('SPARK');
  const [monthlyBookings, setMonthlyBookings] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(5);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  async function loadSubscription() {
    try {
      const res = await fetch(`${API_URL}/subscriptions/me`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setCurrentTier(data.data.tier);
        setMonthlyBookings(data.data.monthlyBookings);
        setMonthlyLimit(data.data.monthlyLimit);
      }
    } catch { /* handle */ }
    finally { setLoading(false); }
  }

  async function handleSubscribe(tier: string) {
    setActionLoading(tier);
    try {
      const endpoint = currentTier !== 'SPARK' && tier === 'AMPLIFY'
        ? '/subscriptions/upgrade'
        : '/subscriptions/create';

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();

      if (!data.success) {
        Alert.alert('Error', data.error?.message || 'Failed to update subscription');
        return;
      }

      setCurrentTier(tier);
      setMonthlyLimit(null);
      Alert.alert('Success', `You're now on the ${tier === 'IGNITE' ? 'Ignite' : 'Amplify'} plan!`);
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel() {
    Alert.alert(
      'Cancel Subscription',
      'Your plan will remain active until the end of the billing period. Are you sure?',
      [
        { text: 'Keep Plan', style: 'cancel' },
        {
          text: 'Cancel Plan',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/subscriptions/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              });
              const data = await res.json();
              if (data.success) {
                Alert.alert('Cancelled', 'Your subscription will end at the current billing period.');
              }
            } catch { /* handle */ }
          },
        },
      ]
    );
  }

  const hitLimit = currentTier === 'SPARK' && monthlyLimit !== null && monthlyBookings >= monthlyLimit;
  // Estimate lost revenue: avg booking ~$300, missed bookings
  const missedBookings = Math.max(0, monthlyBookings - (monthlyLimit ?? 0));

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Limit banner */}
        {hitLimit && (
          <View style={styles.limitBanner}>
            <AlertCircleIcon size={24} color="#9A3412" />
            <View style={styles.limitContent}>
              <Text style={styles.limitTitle}>You've hit your 5-booking limit this month</Text>
              <Text style={styles.limitSub}>
                Upgrade to Ignite to unlock unlimited bookings. You could be earning an estimated
                <Text style={styles.limitAmount}> ${missedBookings * 300}+</Text> more this month.
              </Text>
            </View>
          </View>
        )}

        {/* Tier cards */}
        {TIERS.map((tier) => {
          const isCurrent = tier.id === currentTier;
          const canUpgrade = !isCurrent && TIERS.findIndex((t) => t.id === tier.id) > TIERS.findIndex((t) => t.id === currentTier);

          return (
            <View
              key={tier.id}
              style={[
                styles.tierCard,
                tier.highlight && styles.tierCardHighlight,
                isCurrent && styles.tierCardCurrent,
              ]}
            >
              {/* Current badge */}
              {isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Your Plan</Text>
                </View>
              )}

              {tier.highlight && !isCurrent && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}

              <Text style={styles.tierName}>{tier.name}</Text>
              <Text style={styles.tierPrice}>{tier.priceLabel}</Text>

              <View style={styles.featuresList}>
                {tier.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Text style={styles.featureCheck}>✓</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              {canUpgrade && (
                <Button
                  title={currentTier === 'SPARK' ? `Subscribe — ${tier.priceLabel}` : `Upgrade — ${tier.priceLabel}`}
                  onPress={() => handleSubscribe(tier.id)}
                  loading={actionLoading === tier.id}
                  style={styles.tierBtn}
                />
              )}

              {isCurrent && currentTier !== 'SPARK' && (
                <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel subscription</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Manage billing */}
        {currentTier !== 'SPARK' && (
          <TouchableOpacity
            style={styles.billingBtn}
            onPress={() => {
              Alert.alert('Manage Subscription', 'To manage your subscription, visit your account settings or contact support at support@connectmeapp.services', [{ text: 'OK' }]);
            }}
          >
            <FileTextIcon size={24} color={colors.textSecondary} />
            <View style={styles.billingInfo}>
              <Text style={styles.billingTitle}>Manage Billing</Text>
              <Text style={styles.billingSub}>View invoices and update payment method</Text>
            </View>
            <Text style={styles.billingArrow}>→</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },

  // Limit banner
  limitBanner: {
    flexDirection: 'row', backgroundColor: '#FFF7ED', borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: '#FDBA74',
    gap: spacing.sm,
  },
  limitContent: { flex: 1 },
  limitTitle: { fontFamily: fonts.bold, fontSize: 15, color: '#9A3412' },
  limitSub: { fontFamily: fonts.regular, fontSize: 13, color: '#9A3412', marginTop: spacing.xs, lineHeight: 20 },
  limitAmount: { fontFamily: fonts.bold },

  // Tier cards
  tierCard: {
    borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background,
    position: 'relative',
  },
  tierCardHighlight: { borderColor: colors.primary },
  tierCardCurrent: { backgroundColor: colors.lightBlue, borderColor: colors.primary },
  currentBadge: {
    position: 'absolute', top: -12, right: spacing.md,
    backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  currentBadgeText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.white },
  popularBadge: {
    position: 'absolute', top: -12, right: spacing.md,
    backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  popularBadgeText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.white },
  tierName: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  tierPrice: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.primary, marginTop: spacing.xs, marginBottom: spacing.md },
  featuresList: { gap: spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  featureCheck: { fontSize: 14, color: colors.success, marginTop: 1 },
  featureText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, flex: 1 },
  tierBtn: { marginTop: spacing.lg },
  cancelBtn: { alignItems: 'center', marginTop: spacing.md },
  cancelText: { fontFamily: fonts.medium, fontSize: 14, color: colors.error },

  // Billing
  billingBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    gap: spacing.md, marginTop: spacing.md,
  },
  billingIcon: { fontSize: 24 },
  billingInfo: { flex: 1 },
  billingTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  billingSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  billingArrow: { fontSize: 18, color: colors.textMuted },
});
