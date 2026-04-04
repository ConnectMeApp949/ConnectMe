import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius, spacing } from '../../theme';
import { ChevronLeftIcon, ShareIcon, CheckIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'ReferVendor'>;

const REFERRAL_CODE = 'CONNECT-SA2024';
const STEPS = [
  { num: '1', title: 'Share your referral code', desc: 'Send your unique code to a vendor you know' },
  { num: '2', title: 'They sign up', desc: 'They sign up and complete their first booking' },
  { num: '3', title: 'You earn a reward', desc: 'You earn a reward added to your account' },
];

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CONNECT-${code}`;
}

export default function ReferVendorScreen({ navigation }: Props) {
  const inviteCode = useMemo(() => generateInviteCode(), []);

  function copyCode() {
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  }

  function copyInviteCode() {
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  }

  async function shareCode() {
    await Share.share({ message: `Join ConnectMe as a vendor! Use my referral code: ${REFERRAL_CODE}` });
  }

  async function shareApp() {
    await Share.share({
      message: 'I\'m using ConnectMe to find amazing event vendors in San Antonio! Download it here: https://connectmeapp.services',
    });
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={s.headerTitle}>Refer a Vendor</Text>
        <View style={s.backBtn} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={s.heroSection}>
          <Text style={s.heroIcon}>🎁</Text>
          <Text style={s.heroTitle}>Know a great vendor?</Text>
          <Text style={s.heroSub}>Refer them to ConnectMe and earn rewards when they complete their first booking</Text>
        </View>

        <View style={s.codeCard}>
          <Text style={s.codeLabel}>Your referral code</Text>
          <Text style={s.codeText}>{REFERRAL_CODE}</Text>
          <View style={s.codeButtons}>
            <TouchableOpacity style={s.copyBtn} onPress={copyCode} activeOpacity={0.7} accessibilityLabel="Copy referral code" accessibilityRole="button"><Text style={s.copyBtnText}>Copy Code</Text></TouchableOpacity>
            <TouchableOpacity style={s.shareBtn} onPress={shareCode} activeOpacity={0.7} accessibilityLabel="Share referral code" accessibilityRole="button" accessibilityHint="Opens the share dialog"><Text style={s.shareBtnText}>Share</Text></TouchableOpacity>
          </View>
        </View>

        <Text style={s.sectionTitle}>How It Works</Text>
        {STEPS.map(step => (
          <View key={step.num} style={s.stepRow}>
            <View style={s.stepCircle}><Text style={s.stepNum}>{step.num}</Text></View>
            <View style={s.stepContent}><Text style={s.stepTitle}>{step.title}</Text><Text style={s.stepDesc}>{step.desc}</Text></View>
          </View>
        ))}

        <Text style={[s.sectionTitle, { marginTop: 24 }]}>Your Referrals</Text>
        <View style={s.statRow}>
          <View style={s.statBox}><Text style={s.statNum}>0</Text><Text style={s.statLabel}>Total Referrals</Text></View>
          <View style={s.statBox}><Text style={s.statNum}>$0</Text><Text style={s.statLabel}>Rewards Earned</Text></View>
        </View>
        <Text style={s.emptyText}>No referrals yet. Share your code to get started!</Text>

        {/* ─── Invite Friends section ─── */}
        <View style={s.divider} />

        <Text style={s.sectionTitle}>Invite Friends</Text>
        <View style={s.inviteCard}>
          <View style={s.inviteIconWrap}>
            <ShareIcon size={28} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={s.inviteTitle}>Share ConnectMe with friends and family</Text>
          <Text style={s.inviteSubtitle}>
            Help your friends and family discover the best event vendors in San Antonio.
          </Text>

          <TouchableOpacity
            style={s.shareAppBtn}
            onPress={shareApp}
            activeOpacity={0.7}
            accessibilityLabel="Share ConnectMe"
            accessibilityRole="button"
            accessibilityHint="Opens the share dialog to share ConnectMe with others"
          >
            <ShareIcon size={18} color={colors.white} strokeWidth={2} />
            <Text style={s.shareAppBtnText}>Share ConnectMe</Text>
          </TouchableOpacity>

          <View style={s.inviteCodeSection}>
            <Text style={s.inviteCodeLabel}>Your invite code</Text>
            <Text style={s.inviteCodeText}>{inviteCode}</Text>
            <TouchableOpacity
              style={s.copyInviteBtn}
              onPress={copyInviteCode}
              activeOpacity={0.7}
              accessibilityLabel="Copy invite code"
              accessibilityRole="button"
            >
              <CheckIcon size={16} color={colors.primary} strokeWidth={2} />
              <Text style={s.copyInviteBtnText}>Copy code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  heroSection: { alignItems: 'center', paddingVertical: 24 },
  heroIcon: { fontSize: 48, marginBottom: 12 },
  heroTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  heroSub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  codeCard: { backgroundColor: colors.cardBackground, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  codeLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  codeText: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary, letterSpacing: 2 },
  codeButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  copyBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.primary },
  copyBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary },
  shareBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.primary },
  shareBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.white },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontFamily: fonts.bold, fontSize: 14, color: colors.white },
  stepContent: { flex: 1 },
  stepTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  stepDesc: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  statRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: colors.cardBackground, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statNum: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  statLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center' },

  // Invite Friends section
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  inviteCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  inviteIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inviteTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  inviteSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  shareAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignSelf: 'stretch',
    marginBottom: spacing.lg,
  },
  shareAppBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  },
  inviteCodeSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignSelf: 'stretch',
  },
  inviteCodeLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  inviteCodeText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  copyInviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  copyInviteBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
});
