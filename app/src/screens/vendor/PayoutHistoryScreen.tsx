import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import {
  ChevronLeftIcon,
  DollarIcon,
  CheckIcon,
  ClockIcon,
  TrendingUpIcon,
} from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<any, 'PayoutHistory'>;

type PayoutStatus = 'completed' | 'pending';

interface PayoutEntry {
  id: string;
  amount: number;
  grossEarnings: number;
  platformFee: number;
  netPayout: number;
  date: string;
  processingDate: string;
  expectedArrival: string;
  status: PayoutStatus;
  method: string;
  transactionId: string;
}

type FilterTab = 'all' | 'completed' | 'pending';

// ─── Demo Data ──────────────────────────────────────────

const DEMO_PAYOUTS: PayoutEntry[] = [
  {
    id: '1',
    amount: 1247.50,
    grossEarnings: 1497.50,
    platformFee: 250.00,
    netPayout: 1247.50,
    date: 'Mar 28, 2026',
    processingDate: 'Mar 28, 2026',
    expectedArrival: 'Mar 31, 2026',
    status: 'pending',
    method: 'Bank Account ····4521',
    transactionId: 'TXN-820491',
  },
  {
    id: '2',
    amount: 385.00,
    grossEarnings: 462.00,
    platformFee: 77.00,
    netPayout: 385.00,
    date: 'Mar 25, 2026',
    processingDate: 'Mar 25, 2026',
    expectedArrival: 'Mar 28, 2026',
    status: 'pending',
    method: 'Bank Account ····4521',
    transactionId: 'TXN-820372',
  },
  {
    id: '3',
    amount: 920.00,
    grossEarnings: 1104.00,
    platformFee: 184.00,
    netPayout: 920.00,
    date: 'Mar 21, 2026',
    processingDate: 'Mar 21, 2026',
    expectedArrival: 'Mar 24, 2026',
    status: 'completed',
    method: 'Bank Account ····4521',
    transactionId: 'TXN-819844',
  },
  {
    id: '4',
    amount: 1560.75,
    grossEarnings: 1872.90,
    platformFee: 312.15,
    netPayout: 1560.75,
    date: 'Mar 14, 2026',
    processingDate: 'Mar 14, 2026',
    expectedArrival: 'Mar 17, 2026',
    status: 'completed',
    method: 'Bank Account ····4521',
    transactionId: 'TXN-819205',
  },
  {
    id: '5',
    amount: 445.00,
    grossEarnings: 534.00,
    platformFee: 89.00,
    netPayout: 445.00,
    date: 'Mar 7, 2026',
    processingDate: 'Mar 7, 2026',
    expectedArrival: 'Mar 10, 2026',
    status: 'completed',
    method: 'Debit Card ····8923',
    transactionId: 'TXN-818601',
  },
  {
    id: '6',
    amount: 2100.00,
    grossEarnings: 2520.00,
    platformFee: 420.00,
    netPayout: 2100.00,
    date: 'Feb 28, 2026',
    processingDate: 'Feb 28, 2026',
    expectedArrival: 'Mar 3, 2026',
    status: 'completed',
    method: 'Bank Account ····4521',
    transactionId: 'TXN-817990',
  },
  {
    id: '7',
    amount: 675.25,
    grossEarnings: 810.30,
    platformFee: 135.05,
    netPayout: 675.25,
    date: 'Feb 21, 2026',
    processingDate: 'Feb 21, 2026',
    expectedArrival: 'Feb 24, 2026',
    status: 'completed',
    method: 'Bank Account ····4521',
    transactionId: 'TXN-817422',
  },
  {
    id: '8',
    amount: 1890.00,
    grossEarnings: 2268.00,
    platformFee: 378.00,
    netPayout: 1890.00,
    date: 'Feb 14, 2026',
    processingDate: 'Feb 14, 2026',
    expectedArrival: 'Feb 17, 2026',
    status: 'completed',
    method: 'Bank Account ····4521',
    transactionId: 'TXN-816855',
  },
  {
    id: '9',
    amount: 310.50,
    grossEarnings: 372.60,
    platformFee: 62.10,
    netPayout: 310.50,
    date: 'Feb 7, 2026',
    processingDate: 'Feb 7, 2026',
    expectedArrival: 'Feb 10, 2026',
    status: 'completed',
    method: 'Debit Card ····8923',
    transactionId: 'TXN-816301',
  },
  {
    id: '10',
    amount: 1425.00,
    grossEarnings: 1710.00,
    platformFee: 285.00,
    netPayout: 1425.00,
    date: 'Jan 31, 2026',
    processingDate: 'Jan 31, 2026',
    expectedArrival: 'Feb 3, 2026',
    status: 'completed',
    method: 'Bank Account ····4521',
    transactionId: 'TXN-815778',
  },
  {
    id: '11',
    amount: 560.00,
    grossEarnings: 672.00,
    platformFee: 112.00,
    netPayout: 560.00,
    date: 'Jan 24, 2026',
    processingDate: 'Jan 24, 2026',
    expectedArrival: 'Jan 27, 2026',
    status: 'completed',
    method: 'Bank Account ····4521',
    transactionId: 'TXN-815190',
  },
  {
    id: '12',
    amount: 2350.00,
    grossEarnings: 2820.00,
    platformFee: 470.00,
    netPayout: 2350.00,
    date: 'Jan 17, 2026',
    processingDate: 'Jan 17, 2026',
    expectedArrival: 'Jan 20, 2026',
    status: 'completed',
    method: 'Bank Account ····4521',
    transactionId: 'TXN-814622',
  },
  {
    id: '13',
    amount: 780.00,
    grossEarnings: 936.00,
    platformFee: 156.00,
    netPayout: 780.00,
    date: 'Jan 10, 2026',
    processingDate: 'Jan 10, 2026',
    expectedArrival: 'Jan 13, 2026',
    status: 'completed',
    method: 'Debit Card ····8923',
    transactionId: 'TXN-814055',
  },
];

// ─── Computed summary values from demo data ─────────────

const TOTAL_PAID_OUT = DEMO_PAYOUTS
  .filter((p) => p.status === 'completed')
  .reduce((sum, p) => sum + p.amount, 0);

const THIS_MONTH_TOTAL = DEMO_PAYOUTS
  .filter((p) => p.date.startsWith('Mar'))
  .reduce((sum, p) => sum + p.amount, 0);

const LAST_MONTH_TOTAL = DEMO_PAYOUTS
  .filter((p) => p.date.startsWith('Feb'))
  .reduce((sum, p) => sum + p.amount, 0);

const PAYOUTS_THIS_YEAR = DEMO_PAYOUTS.length;

// ─── Component ──────────────────────────────────────────

export default function PayoutHistoryScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredPayouts = DEMO_PAYOUTS.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.status === activeFilter;
  });

  const toggleExpand = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const trendUp = THIS_MONTH_TOTAL >= LAST_MONTH_TOTAL;

  const filters: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'completed', label: 'Completed' },
    { key: 'pending', label: 'Pending' },
  ];

  const renderPayout = ({ item }: { item: PayoutEntry }) => {
    const isExpanded = expandedId === item.id;
    const isCompleted = item.status === 'completed';
    const statusColor = isCompleted ? colors.success : colors.warning;

    return (
      <TouchableOpacity
        style={[s.payoutRow, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
        activeOpacity={0.7}
        onPress={() => toggleExpand(item.id)}
        accessibilityLabel={`Payout of ${formatCurrency(item.amount)}, ${item.status}, ${item.date}`}
        accessibilityRole="button"
        accessibilityHint="Tap to expand details"
      >
        <View style={s.payoutRowTop}>
          {/* Status icon */}
          <View style={[s.statusCircle, { backgroundColor: statusColor + '1A' }]}>
            {isCompleted ? (
              <CheckIcon size={18} color={statusColor} strokeWidth={2} />
            ) : (
              <ClockIcon size={18} color={statusColor} strokeWidth={2} />
            )}
          </View>

          {/* Middle info */}
          <View style={s.payoutInfo}>
            <Text style={[s.payoutAmount, { color: themeColors.text }]}>
              {formatCurrency(item.amount)}
            </Text>
            <Text style={[s.payoutDate, { color: themeColors.textMuted }]}>{item.date}</Text>
            <Text style={[s.payoutMethod, { color: themeColors.textMuted }]}>{item.method}</Text>
          </View>

          {/* Status badge */}
          <View style={[s.statusBadge, { backgroundColor: statusColor + '1A' }]}>
            <Text style={[s.statusBadgeText, { color: statusColor }]}>
              {isCompleted ? 'Completed' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Expanded details */}
        {isExpanded && (
          <View style={[s.expandedDetails, { borderTopColor: themeColors.border }]}>
            <View style={s.detailRow}>
              <Text style={[s.detailLabel, { color: themeColors.textMuted }]}>Transaction ID</Text>
              <Text style={[s.detailValue, { color: themeColors.text }]}>{item.transactionId}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={[s.detailLabel, { color: themeColors.textMuted }]}>Gross earnings</Text>
              <Text style={[s.detailValue, { color: themeColors.text }]}>{formatCurrency(item.grossEarnings)}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={[s.detailLabel, { color: themeColors.textMuted }]}>Platform fee</Text>
              <Text style={[s.detailValue, { color: colors.error }]}>-{formatCurrency(item.platformFee)}</Text>
            </View>
            <View style={[s.detailRow, s.detailRowNet]}>
              <Text style={[s.detailLabel, s.detailLabelBold, { color: themeColors.text }]}>Net payout</Text>
              <Text style={[s.detailValue, s.detailValueBold, { color: themeColors.text }]}>{formatCurrency(item.netPayout)}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={[s.detailLabel, { color: themeColors.textMuted }]}>Processing date</Text>
              <Text style={[s.detailValue, { color: themeColors.text }]}>{item.processingDate}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={[s.detailLabel, { color: themeColors.textMuted }]}>Expected arrival</Text>
              <Text style={[s.detailValue, { color: themeColors.text }]}>{item.expectedArrival}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {/* ─── Summary Card ─── */}
      <View style={[s.summaryCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
        <Text style={[s.summaryLabel, { color: themeColors.textMuted }]}>Total paid out</Text>
        <Text style={[s.summaryTotal, { color: themeColors.text }]}>
          {formatCurrency(TOTAL_PAID_OUT)}
        </Text>

        <View style={s.summaryRow}>
          <View style={s.summaryCol}>
            <Text style={[s.summaryStatLabel, { color: themeColors.textMuted }]}>This month</Text>
            <View style={s.summaryStatRow}>
              <Text style={[s.summaryStatValue, { color: themeColors.text }]}>
                {formatCurrency(THIS_MONTH_TOTAL)}
              </Text>
              <View style={[s.trendBadge, { backgroundColor: trendUp ? colors.success + '1A' : colors.error + '1A' }]}>
                <View style={{ transform: [{ rotate: trendUp ? '0deg' : '180deg' }] }}>
                  <TrendingUpIcon size={12} color={trendUp ? colors.success : colors.error} strokeWidth={2} />
                </View>
              </View>
            </View>
          </View>

          <View style={[s.summaryDivider, { backgroundColor: themeColors.border }]} />

          <View style={s.summaryCol}>
            <Text style={[s.summaryStatLabel, { color: themeColors.textMuted }]}>Last month</Text>
            <Text style={[s.summaryStatValue, { color: themeColors.text }]}>
              {formatCurrency(LAST_MONTH_TOTAL)}
            </Text>
          </View>

          <View style={[s.summaryDivider, { backgroundColor: themeColors.border }]} />

          <View style={s.summaryCol}>
            <Text style={[s.summaryStatLabel, { color: themeColors.textMuted }]}>This year</Text>
            <Text style={[s.summaryStatValue, { color: themeColors.text }]}>
              {PAYOUTS_THIS_YEAR} payouts
            </Text>
          </View>
        </View>
      </View>

      {/* ─── Filter Tabs ─── */}
      <View style={s.filterRow}>
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                s.filterPill,
                { borderColor: themeColors.border },
                isActive && { backgroundColor: themeColors.text, borderColor: themeColors.text },
              ]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
              accessibilityLabel={`Filter by ${f.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  s.filterPillText,
                  { color: themeColors.textMuted },
                  isActive && { color: themeColors.background },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={s.emptyState} accessibilityLabel="No payouts yet">
      <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
        <DollarIcon size={32} color={themeColors.textMuted} strokeWidth={1.5} />
      </View>
      <Text style={[s.emptyTitle, { color: themeColors.text }]}>No payouts yet</Text>
      <Text style={[s.emptySubtitle, { color: themeColors.textMuted }]}>
        Your payout history will appear here once you start receiving payments.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* ─── Header ─── */}
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.6}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Payout History</Text>
        <View style={s.backBtn} />
      </View>

      <FlatList
        data={filteredPayouts}
        renderItem={renderPayout}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // ─── Summary Card ───
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  summaryLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: 4,
  },
  summaryTotal: {
    fontFamily: fonts.bold,
    fontSize: 36,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryCol: {
    flex: 1,
  },
  summaryStatLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryStatValue: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 12,
  },
  trendBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Filter Tabs ───
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },

  // ─── Payout Row ───
  payoutRow: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  payoutRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  payoutInfo: {
    flex: 1,
  },
  payoutAmount: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  payoutDate: {
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },
  payoutMethod: {
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },

  // ─── Expanded Details ───
  expandedDetails: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailRowNet: {
    paddingTop: 10,
    marginTop: 4,
  },
  detailLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  detailLabelBold: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  detailValue: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  detailValueBold: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },

  // ─── Empty State ───
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
