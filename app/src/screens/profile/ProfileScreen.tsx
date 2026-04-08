import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SettingsIcon, UserIcon, HelpCircleIcon, ShieldIcon, UsersIcon, FileTextIcon, LogOutIcon, ChevronRightIcon, CalendarIcon } from '../../components/Icons';
import { colors, fonts, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<any, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const auth = useAuth();
  const { t } = useLanguage();
  const user = auth.user;
  const firstName = user?.firstName ?? 'User';
  const lastName = user?.lastName ?? '';
  const city = user?.city ?? '';

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => auth.logout() },
    ]);
  }

  // ─── Menu items ────────────────────────────────────────

  type IconComp = React.FC<{ size?: number; color?: string; strokeWidth?: number }>;

  const menuItems: { label: string; icon: IconComp; danger?: boolean; onPress: () => void }[] = [
    { label: t('accountSettings'), icon: SettingsIcon, onPress: () => navigation.navigate('AccountSettings') },
    { label: t('getHelp'), icon: HelpCircleIcon, onPress: () => navigation.navigate('GetHelp') },
    { label: t('viewProfile'), icon: UserIcon, onPress: () => navigation.navigate('ViewProfile') },
    { label: t('privacy'), icon: ShieldIcon, onPress: () => navigation.navigate('Privacy') },
    { label: 'Refer a Vendor', icon: UsersIcon, onPress: () => navigation.navigate('ReferVendor') },
    { label: t('legal'), icon: FileTextIcon, onPress: () => navigation.navigate('Legal') },
    { label: t('logOut'), icon: LogOutIcon, danger: true, onPress: handleSignOut },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ─── Profile header ─── */}
        <View style={styles.profileHeader}>
          {user?.profilePhoto ? (
            <Image source={{ uri: user.profilePhoto }} style={styles.avatar} accessibilityLabel={`${firstName} ${lastName} profile photo`} accessibilityRole="image" />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{firstName[0]}{lastName?.[0] ?? ''}</Text>
            </View>
          )}
          <Text style={styles.fullName}>{firstName} {lastName}</Text>
          {city !== '' && <Text style={styles.location}>{city}</Text>}
        </View>

        {/* ─── Stats row ─── */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>{user?.bookingCount ?? 0}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>{user?.reviewCount ?? 0}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>{user?.memberYears ?? '<1'}</Text>
            <Text style={styles.statLabel}>Years on{'\n'}ConnectMe</Text>
          </View>
        </View>

        {/* ─── Activity cards ─── */}
        <View style={styles.activityRow}>
          <TouchableOpacity style={styles.activityCard} activeOpacity={0.7} onPress={() => navigation.navigate('PastBookings')} accessibilityLabel="Past Bookings" accessibilityRole="button" accessibilityHint="View your past bookings">
            <View style={styles.activityIconWrap}>
              <CalendarIcon size={28} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.activityLabel}>Past Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.activityCard} activeOpacity={0.7} onPress={() => navigation.navigate('Connections')} accessibilityLabel="Connections" accessibilityRole="button" accessibilityHint="View your vendor connections">
            <View style={styles.activityIconWrap}>
              <UsersIcon size={28} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.activityLabel}>Connections</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Vendor mode banner ─── */}
        {auth.isVendorMode ? (
          <TouchableOpacity style={styles.vendorBanner} activeOpacity={0.8} onPress={() => auth.toggleVendorMode()} accessibilityLabel="Switch to Booking" accessibilityRole="button" accessibilityHint="Browse and book vendors for your events">
            <View style={styles.vendorBannerLeft}>
              <Text style={styles.vendorBannerTitle}>Switch to Booking</Text>
              <Text style={styles.vendorBannerSub}>Browse and book vendors for your events</Text>
            </View>
            <ChevronRightIcon size={24} color={colors.primary} strokeWidth={1.5} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.vendorBanner} activeOpacity={0.8} onPress={() => auth.toggleVendorMode()} accessibilityLabel="Switch to hosting" accessibilityRole="button" accessibilityHint="Manage your vendor business">
            <View style={styles.vendorBannerLeft}>
              <Text style={styles.vendorBannerTitle}>Switch to hosting</Text>
              <Text style={styles.vendorBannerSub}>Manage your vendor business</Text>
            </View>
            <ChevronRightIcon size={24} color={colors.primary} strokeWidth={1.5} />
          </TouchableOpacity>
        )}

        {/* ─── Menu list ─── */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, i) => {
            const IconComp = item.icon;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuRow, i < menuItems.length - 1 && styles.menuRowBorder]}
                onPress={item.onPress}
                activeOpacity={0.6}
                accessibilityLabel={item.label}
                accessibilityRole="button"
                accessibilityHint={item.danger ? 'Signs you out of your account' : `Navigate to ${item.label}`}
              >
                <View style={styles.menuRowLeft}>
                  <View style={[styles.menuIconCircle, item.danger && styles.menuIconCircleDanger]}>
                    <IconComp size={20} color={item.danger ? colors.error : colors.primary} strokeWidth={1.5} />
                  </View>
                  <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                    {item.label}
                  </Text>
                </View>
                <ChevronRightIcon size={18} color={item.danger ? colors.error : colors.textMuted} strokeWidth={1.5} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── Version ─── */}
        <Text style={styles.version}>ConnectMe v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    paddingHorizontal: 24,
  },

  // Close
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarInitials: {
    fontFamily: fonts.bold,
    fontSize: 30,
    color: colors.white,
  },
  fullName: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
    marginTop: spacing.md,
  },
  location: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statNumber: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 16,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },

  // Activity cards
  activityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  activityCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  activityIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  activityLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },

  // Vendor banner
  vendorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundWarm,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  vendorBannerLeft: {
    flex: 1,
  },
  vendorBannerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  vendorBannerSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  vendorBannerArrow: {
    fontSize: 28,
    color: colors.primary,
    marginLeft: spacing.md,
  },

  // Menu
  menuContainer: {
    marginBottom: spacing.lg,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIconCircleDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  menuLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.text,
  },
  menuLabelDanger: {
    color: colors.error,
  },

  // Version
  version: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
