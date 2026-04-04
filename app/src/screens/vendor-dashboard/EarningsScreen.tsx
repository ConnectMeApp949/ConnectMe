import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarChart } from 'react-native-chart-kit';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api-production-dda7.up.railway.app';

type Props = NativeStackScreenProps<any, 'Earnings'>;

export default function EarningsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [pendingPayout, setPendingPayout] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Mock chart data — TODO: fetch from API
  const chartData = {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    datasets: [{ data: [1200, 1800, 950, 2100, 1650, monthlyEarnings || 0] }],
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  async function loadEarnings() {
    try {
      const res = await fetch(`${API_URL}/vendors/me`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setMonthlyEarnings(Number(data.data.totalEarnings ?? 0));
        setPendingPayout(0); // TODO: calculate from pending payments
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Earnings</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Main earnings card */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>This Month</Text>
          <Text style={styles.earningsAmount}>${monthlyEarnings.toFixed(2)}</Text>
          <View style={styles.pendingRow}>
            <Text style={styles.pendingLabel}>Pending payout:</Text>
            <Text style={styles.pendingAmount}>${pendingPayout.toFixed(2)}</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Earnings</Text>
          <BarChart
            data={chartData}
            width={SCREEN_WIDTH - spacing.lg * 2}
            height={200}
            yAxisLabel="$"
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: colors.background,
              backgroundGradientFrom: colors.background,
              backgroundGradientTo: colors.background,
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => colors.textMuted,
              barPercentage: 0.6,
              propsForBackgroundLines: { stroke: colors.border },
            }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>

        {/* Transaction history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet</Text>
          ) : (
            transactions.map((tx: any, i: number) => (
              <View key={i} style={styles.txRow}>
                <View style={styles.txInfo}>
                  <Text style={styles.txDate}>
                    {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.txClient}>{tx.clientName}</Text>
                </View>
                <View style={styles.txAmounts}>
                  <Text style={styles.txGross}>${tx.gross.toFixed(2)}</Text>
                  <Text style={styles.txFee}>-${tx.fee.toFixed(2)} fee</Text>
                  <Text style={styles.txNet}>${tx.net.toFixed(2)}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Payout settings */}
        <TouchableOpacity style={styles.payoutBtn}>
          <Text style={styles.payoutIcon}>🏦</Text>
          <View style={styles.payoutInfo}>
            <Text style={styles.payoutTitle}>Payout Settings</Text>
            <Text style={styles.payoutSub}>Connect your bank account via Stripe</Text>
          </View>
          <Text style={styles.payoutArrow}>→</Text>
        </TouchableOpacity>

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

  earningsCard: {
    backgroundColor: colors.primary, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.lg, alignItems: 'center',
  },
  earningsLabel: { fontFamily: fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  earningsAmount: { fontFamily: fonts.bold, fontSize: 40, color: colors.white, marginVertical: spacing.xs },
  pendingRow: { flexDirection: 'row', gap: spacing.xs },
  pendingLabel: { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  pendingAmount: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.white },

  section: { marginBottom: spacing.lg },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: spacing.md },
  chart: { borderRadius: borderRadius.md },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },

  txRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  txInfo: {},
  txDate: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  txClient: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, marginTop: 2 },
  txAmounts: { alignItems: 'flex-end' },
  txGross: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  txFee: { fontFamily: fonts.regular, fontSize: 12, color: colors.error },
  txNet: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary, marginTop: 2 },

  payoutBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    gap: spacing.md,
  },
  payoutIcon: { fontSize: 24 },
  payoutInfo: { flex: 1 },
  payoutTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  payoutSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  payoutArrow: { fontSize: 18, color: colors.textMuted },
});
