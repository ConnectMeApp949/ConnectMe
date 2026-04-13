import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, DollarIcon, ClockIcon, CameraIcon, XIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'VendorPayoutSettings'>;

export default function VendorPayoutSettingsScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const [autoPayouts, setAutoPayouts] = useState(true);
  const [payoutSchedule, setPayoutSchedule] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const handleAddMethod = () => {
    Alert.alert(
      'Add Payout Method',
      'Choose how you want to receive your earnings',
      [
        { text: 'Bank Account (ACH)', onPress: () => Alert.alert('Bank Account', 'Enter your routing and account number to receive direct deposits.\n\nProcessing time: 2-3 business days\nNo fees', [{ text: 'Set Up', onPress: () => Alert.alert('Saved', 'Bank account added successfully!') }, { text: 'Cancel', style: 'cancel' }]) },
        { text: 'Debit Card (Fast Pay)', onPress: () => Alert.alert('Debit Card', 'Link a debit card for instant payouts.\n\nProcessing time: Within 30 minutes\nFee: $1.99 per transfer', [{ text: 'Set Up', onPress: () => Alert.alert('Saved', 'Debit card added for Fast Pay!') }, { text: 'Cancel', style: 'cancel' }]) },
        { text: 'PayPal', onPress: () => Alert.alert('PayPal', 'Link your PayPal account to receive payouts.\n\nProcessing time: 1 business day\nNo fees', [{ text: 'Set Up', onPress: () => Alert.alert('Saved', 'PayPal account linked!') }, { text: 'Cancel', style: 'cancel' }]) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleRemoveMethod = (method: string) => {
    Alert.alert('Remove Payout Method', `Are you sure you want to remove ${method}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => Alert.alert('Removed', `${method} has been removed.`) },
    ]);
  };

  const handleScheduleChange = () => {
    Alert.alert(
      'Payout Schedule',
      'How often should we send your earnings?',
      [
        { text: 'Daily', onPress: () => setPayoutSchedule('daily') },
        { text: 'Weekly (Recommended)', onPress: () => setPayoutSchedule('weekly') },
        { text: 'Monthly', onPress: () => setPayoutSchedule('monthly') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Payout Settings</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ─── Payout Methods ─── */}
        <Text style={[s.sectionTitle, { color: themeColors.text }]}>Payout Methods</Text>
        <Text style={[s.sectionSub, { color: themeColors.textSecondary }]}>Add and manage how you get paid</Text>

        {/* Primary method */}
        <View style={[s.methodCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <View style={s.methodHeader}>
            <View style={[s.methodIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <DollarIcon size={20} color={themeColors.primary} strokeWidth={1.5} />
            </View>
            <View style={s.methodInfo}>
              <Text style={[s.methodTitle, { color: themeColors.text }]}>Bank Account</Text>
              <Text style={[s.methodDetail, { color: themeColors.textMuted }]}>Chase ••••4521</Text>
            </View>
            <View style={s.defaultBadge}>
              <Text style={s.defaultBadgeText}>Default</Text>
            </View>
          </View>
          <View style={[s.methodMeta, { borderTopColor: themeColors.border }]}>
            <Text style={[s.methodMetaText, { color: themeColors.textMuted }]}>2-3 business days · No fees</Text>
          </View>
          <View style={s.methodActions}>
            <TouchableOpacity style={s.methodActionBtn} onPress={() => Alert.alert('Edit', 'Edit bank account details')} accessibilityLabel="Edit bank account" accessibilityRole="button">
              <Text style={[s.methodActionText, { color: themeColors.primary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.methodActionBtn} onPress={() => handleRemoveMethod('Bank Account ••••4521')} accessibilityLabel="Remove bank account" accessibilityRole="button">
              <Text style={[s.methodActionText, { color: colors.error }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fast Pay method */}
        <View style={[s.methodCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <View style={s.methodHeader}>
            <View style={[s.methodIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <ClockIcon size={20} color={colors.success} strokeWidth={1.5} />
            </View>
            <View style={s.methodInfo}>
              <Text style={[s.methodTitle, { color: themeColors.text }]}>Fast Pay (Debit Card)</Text>
              <Text style={[s.methodDetail, { color: themeColors.textMuted }]}>Visa ••••8923</Text>
            </View>
          </View>
          <View style={[s.methodMeta, { borderTopColor: themeColors.border }]}>
            <Text style={[s.methodMetaText, { color: themeColors.textMuted }]}>Within 30 minutes · $1.99 per transfer</Text>
          </View>
          <View style={s.methodActions}>
            <TouchableOpacity style={s.methodActionBtn} onPress={() => Alert.alert('Edit', 'Edit debit card details')} accessibilityLabel="Edit debit card" accessibilityRole="button">
              <Text style={[s.methodActionText, { color: themeColors.primary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.methodActionBtn} onPress={() => handleRemoveMethod('Debit Card ••••8923')} accessibilityLabel="Remove debit card" accessibilityRole="button">
              <Text style={[s.methodActionText, { color: colors.error }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add method button */}
        <TouchableOpacity style={[s.addMethodBtn, { borderColor: themeColors.primary }]} activeOpacity={0.7} onPress={handleAddMethod} accessibilityLabel="Add payout method" accessibilityRole="button">
          <Text style={[s.addMethodText, { color: themeColors.primary }]}>+ Add Payout Method</Text>
        </TouchableOpacity>

        {/* ─── Payout Schedule ─── */}
        <Text style={[s.sectionTitle, { marginTop: 28, color: themeColors.text }]}>Payout Schedule</Text>

        <TouchableOpacity style={[s.settingRow, { borderBottomColor: themeColors.border }]} activeOpacity={0.6} onPress={handleScheduleChange} accessibilityLabel="Change payout schedule" accessibilityRole="button">
          <View style={s.settingLeft}>
            <View style={[s.settingIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <ClockIcon size={20} color={themeColors.primary} strokeWidth={1.5} />
            </View>
            <View>
              <Text style={[s.settingLabel, { color: themeColors.text }]}>Frequency</Text>
              <Text style={[s.settingValue, { color: themeColors.textMuted }]}>
                {payoutSchedule === 'daily' ? 'Daily' : payoutSchedule === 'weekly' ? 'Every Monday' : '1st of each month'}
              </Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>

        <View style={[s.toggleRow, { borderBottomColor: themeColors.border }]}>
          <View style={s.settingLeft}>
            <View style={[s.settingIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <CheckIcon size={20} color={themeColors.primary} strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.settingLabel, { color: themeColors.text }]}>Automatic Payouts</Text>
              <Text style={[s.settingDesc, { color: themeColors.textMuted }]}>Automatically transfer your available balance on schedule</Text>
            </View>
          </View>
          <Switch
            value={autoPayouts}
            onValueChange={setAutoPayouts}
            trackColor={{ true: colors.primary }}
            accessibilityLabel="Automatic payouts"
            accessibilityRole="switch"
          />
        </View>

        {/* ─── Tax Info ─── */}
        <Text style={[s.sectionTitle, { marginTop: 28, color: themeColors.text }]}>Tax Information</Text>

        <TouchableOpacity style={[s.settingRow, { borderBottomColor: themeColors.border }]} activeOpacity={0.6} onPress={() => Alert.alert('Tax Documents', 'Your 1099-K form will be available for download in January for the previous tax year.\n\nConnectMe reports earnings over $600 to the IRS as required by law.')} accessibilityLabel="Tax documents" accessibilityRole="button">
          <View style={s.settingLeft}>
            <View style={[s.settingIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <CameraIcon size={20} color={themeColors.primary} strokeWidth={1.5} />
            </View>
            <View>
              <Text style={[s.settingLabel, { color: themeColors.text }]}>Tax Documents</Text>
              <Text style={[s.settingValue, { color: themeColors.textMuted }]}>1099-K available in January</Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.settingRow, { borderBottomColor: themeColors.border }]} activeOpacity={0.6} onPress={() => Alert.alert('Taxpayer Info', 'Your taxpayer information is on file.\n\nName: On file\nTIN: ••••1234\nType: Individual\n\nTo update, contact support.')} accessibilityLabel="Taxpayer information" accessibilityRole="button">
          <View style={s.settingLeft}>
            <View style={[s.settingIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <DollarIcon size={20} color={themeColors.primary} strokeWidth={1.5} />
            </View>
            <View>
              <Text style={[s.settingLabel, { color: themeColors.text }]}>Taxpayer Information</Text>
              <Text style={[s.settingValue, { color: themeColors.textMuted }]}>W-9 on file</Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>

        {/* ─── Help ─── */}
        <View style={[s.helpCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Text style={[s.helpTitle, { color: themeColors.text }]}>Need help with payouts?</Text>
          <Text style={[s.helpText, { color: themeColors.textMuted }]}>If you have questions about your earnings, payment methods, or tax information, our support team is here to help.</Text>
          <TouchableOpacity style={s.helpBtn} activeOpacity={0.7} onPress={() => Alert.alert('Support', 'Contact us at support@connectmeapp.services or through Live Chat in the Get Help section.')} accessibilityLabel="Contact support" accessibilityRole="button">
            <Text style={s.helpBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

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

  sectionTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.text, marginBottom: 4 },
  sectionSub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginBottom: 16 },

  // Method cards
  methodCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  methodHeader: { flexDirection: 'row', alignItems: 'center' },
  methodIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: colors.border },
  methodInfo: { flex: 1 },
  methodTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  methodDetail: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  defaultBadge: { backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  defaultBadgeText: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.white },
  methodMeta: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  methodMetaText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  methodActions: { flexDirection: 'row', gap: 16, marginTop: 12 },
  methodActionBtn: { paddingVertical: 4 },
  methodActionText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary },

  addMethodBtn: { paddingVertical: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', marginBottom: 8 },
  addMethodText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.primary },

  // Settings rows
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  settingIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  settingLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  settingValue: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  settingDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },

  // Help card
  helpCard: { backgroundColor: colors.cardBackground, borderRadius: 14, padding: 20, marginTop: 28, borderWidth: 1, borderColor: colors.border },
  helpTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginBottom: 8 },
  helpText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 16 },
  helpBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  helpBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },
});
