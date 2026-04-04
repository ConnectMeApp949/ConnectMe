import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, DollarIcon, CalendarIcon, CheckIcon, ClockIcon, ChevronRightIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'VendorEarnings'>;

const PAYOUT_HISTORY = [
  { id: '1', amount: 450.00, date: 'Mar 15, 2026', status: 'completed', method: 'Bank Account ••4521' },
  { id: '2', amount: 320.00, date: 'Feb 28, 2026', status: 'completed', method: 'Bank Account ••4521' },
  { id: '3', amount: 180.50, date: 'Feb 14, 2026', status: 'completed', method: 'Bank Account ••4521' },
  { id: '4', amount: 275.00, date: 'Jan 31, 2026', status: 'completed', method: 'Bank Account ••4521' },
];

const EARNINGS_BREAKDOWN = [
  { label: 'Completed bookings', amount: 1425.50, count: 8 },
  { label: 'Tips received', amount: 125.00, count: 5 },
  { label: 'Platform fees', amount: -77.53, count: null },
];

export default function VendorEarningsScreen({ navigation }: Props) {
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const availableBalance = 387.50;
  const pendingBalance = 150.00;
  const totalEarnings = 1472.97;

  const handleRequestPayout = () => {
    Alert.alert(
      'Request Payout',
      `Transfer $${availableBalance.toFixed(2)} to your bank account?\n\nBank Account ending in 4521\nEstimated arrival: 2-3 business days`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer Now',
          onPress: () => {
            setPayoutLoading(true);
            setTimeout(() => {
              setPayoutLoading(false);
              Alert.alert(
                'Payout Initiated',
                `$${availableBalance.toFixed(2)} is on its way to your bank account. You'll receive it within 2-3 business days.\n\nTransaction ID: TXN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                [{ text: 'Done' }]
              );
            }, 2000);
          },
        },
      ]
    );
  };

  const handleSetupFastPay = () => {
    Alert.alert(
      'Fast Pay',
      'Get your earnings deposited within 30 minutes for a small fee of $1.99 per transfer.\n\nRequires a debit card on file.',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Set Up Fast Pay', onPress: () => Alert.alert('Coming Soon', 'Fast Pay will be available in a future update.') },
      ]
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Earnings</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ─── Balance Card ─── */}
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Available Balance</Text>
          <Text style={s.balanceAmount}>${availableBalance.toFixed(2)}</Text>
          <View style={s.balanceRow}>
            <View style={s.balanceStat}>
              <View style={s.balanceStatIconWrap}>
                <ClockIcon size={14} color={colors.white} strokeWidth={2} />
              </View>
              <Text style={s.balanceStatText}>${pendingBalance.toFixed(2)} pending</Text>
            </View>
            <View style={s.balanceDivider} />
            <View style={s.balanceStat}>
              <View style={s.balanceStatIconWrap}>
                <CheckIcon size={14} color={colors.white} strokeWidth={2} />
              </View>
              <Text style={s.balanceStatText}>${totalEarnings.toFixed(2)} total</Text>
            </View>
          </View>

          {/* Payout Button */}
          <TouchableOpacity
            style={[s.payoutBtn, availableBalance <= 0 && s.payoutBtnDisabled]}
            activeOpacity={0.8}
            onPress={handleRequestPayout}
            disabled={availableBalance <= 0 || payoutLoading}
            accessibilityLabel="Request payout"
            accessibilityRole="button"
            accessibilityHint={`Transfer ${availableBalance.toFixed(2)} dollars to your bank account`}
          >
            {payoutLoading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <>
                <DollarIcon size={18} color={colors.primary} strokeWidth={2} />
                <Text style={s.payoutBtnText}>Transfer to Bank</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ─── Fast Pay Banner ─── */}
        <TouchableOpacity style={s.fastPayBanner} activeOpacity={0.7} onPress={handleSetupFastPay} accessibilityLabel="Set up Fast Pay" accessibilityRole="button">
          <View style={s.fastPayLeft}>
            <View style={s.fastPayIconWrap}>
              <ClockIcon size={18} color={colors.success} strokeWidth={2} />
            </View>
            <View>
              <Text style={s.fastPayTitle}>Fast Pay</Text>
              <Text style={s.fastPaySub}>Get paid in 30 minutes · $1.99 fee</Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color={colors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>

        {/* ─── Period Toggle ─── */}
        <View style={s.periodRow}>
          {(['week', 'month', 'year'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[s.periodBtn, selectedPeriod === p && s.periodBtnActive]}
              onPress={() => setSelectedPeriod(p)}
              activeOpacity={0.7}
              accessibilityLabel={`View ${p}ly earnings`}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedPeriod === p }}
            >
              <Text style={[s.periodText, selectedPeriod === p && s.periodTextActive]}>
                {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Year'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Earnings Breakdown ─── */}
        <Text style={s.sectionTitle}>Earnings Breakdown</Text>
        <View style={s.breakdownCard}>
          {EARNINGS_BREAKDOWN.map((item, i) => (
            <View key={item.label} style={[s.breakdownRow, i < EARNINGS_BREAKDOWN.length - 1 && s.breakdownRowBorder]}>
              <View style={s.breakdownLeft}>
                <Text style={s.breakdownLabel}>{item.label}</Text>
                {item.count !== null && <Text style={s.breakdownCount}>{item.count} transactions</Text>}
              </View>
              <Text style={[s.breakdownAmount, item.amount < 0 && s.breakdownAmountNeg]}>
                {item.amount < 0 ? '-' : ''}${Math.abs(item.amount).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={s.breakdownTotal}>
            <Text style={s.breakdownTotalLabel}>Net earnings</Text>
            <Text style={s.breakdownTotalAmount}>${totalEarnings.toFixed(2)}</Text>
          </View>
        </View>

        {/* ─── Payout History ─── */}
        <Text style={s.sectionTitle}>Payout History</Text>
        {PAYOUT_HISTORY.map((payout) => (
          <TouchableOpacity key={payout.id} style={s.payoutRow} activeOpacity={0.6} onPress={() => Alert.alert('Payout Details', `Amount: $${payout.amount.toFixed(2)}\nDate: ${payout.date}\nMethod: ${payout.method}\nStatus: Completed\n\nTransaction ID: TXN-${payout.id.padStart(6, '0')}`)}>
            <View style={s.payoutIconWrap}>
              <CheckIcon size={18} color={colors.success} strokeWidth={2} />
            </View>
            <View style={s.payoutInfo}>
              <Text style={s.payoutAmount}>${payout.amount.toFixed(2)}</Text>
              <Text style={s.payoutDate}>{payout.date} · {payout.method}</Text>
            </View>
            <ChevronRightIcon size={16} color={colors.textMuted} strokeWidth={1.5} />
          </TouchableOpacity>
        ))}

        {/* ─── Payout Settings ─── */}
        <TouchableOpacity style={s.settingsRow} activeOpacity={0.6} onPress={() => navigation.navigate('VendorPayoutSettings')} accessibilityLabel="Payout settings" accessibilityRole="button">
          <Text style={s.settingsText}>Payout Settings</Text>
          <ChevronRightIcon size={18} color={colors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  scroll: { padding: 20 },

  // Balance card
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceLabel: { fontFamily: fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  balanceAmount: { fontFamily: fonts.bold, fontSize: 44, color: colors.white, marginVertical: 4 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  balanceStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceStatIconWrap: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  balanceStatText: { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  balanceDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 14 },
  payoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 20,
    alignSelf: 'stretch',
    gap: 8,
  },
  payoutBtnDisabled: { opacity: 0.5 },
  payoutBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.primary },

  // Fast Pay
  fastPayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fastPayLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fastPayIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0FFF4', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BBF7D0' },
  fastPayTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  fastPaySub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },

  // Period toggle
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  periodBtnActive: { backgroundColor: colors.text, borderColor: colors.text },
  periodText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  periodTextActive: { color: colors.white, fontFamily: fonts.semiBold },

  // Breakdown
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 12 },
  breakdownCard: { backgroundColor: colors.cardBackground, borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  breakdownRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  breakdownLeft: { flex: 1 },
  breakdownLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  breakdownCount: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  breakdownAmount: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  breakdownAmountNeg: { color: colors.error },
  breakdownTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, marginTop: 4, borderTopWidth: 2, borderTopColor: colors.text },
  breakdownTotalLabel: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  breakdownTotalAmount: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },

  // Payout history
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  payoutIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0FFF4', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#BBF7D0' },
  payoutInfo: { flex: 1 },
  payoutAmount: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  payoutDate: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },

  // Settings
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  settingsText: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
});
