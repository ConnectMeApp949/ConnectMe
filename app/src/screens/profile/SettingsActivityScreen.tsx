import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  SettingsIcon, HelpCircleIcon, ShieldIcon, UsersIcon, FileTextIcon,
  LogOutIcon, ChevronRightIcon, ChevronLeftIcon,
} from '../../components/Icons';
import { colors, fonts, spacing } from '../../theme';

type Props = NativeStackScreenProps<any, 'SettingsActivity'>;

export default function SettingsActivityScreen({ navigation }: Props) {
  const auth = useAuth();
  const { colors: themeColors } = useTheme();
  const { t } = useLanguage();

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => auth.logout() },
    ]);
  }

  type IconComp = React.FC<{ size?: number; color?: string; strokeWidth?: number }>;

  const menuItems: { label: string; icon: IconComp; danger?: boolean; onPress: () => void }[] = [
    { label: t('accountSettings'), icon: SettingsIcon, onPress: () => navigation.navigate('AccountSettings') },
    { label: t('getHelp'), icon: HelpCircleIcon, onPress: () => navigation.navigate('GetHelp') },
    { label: t('privacy'), icon: ShieldIcon, onPress: () => navigation.navigate('Privacy') },
    { label: 'Refer a Vendor', icon: UsersIcon, onPress: () => navigation.navigate('ReferVendor') },
    { label: t('legal'), icon: FileTextIcon, onPress: () => navigation.navigate('Legal') },
    { label: t('logOut'), icon: LogOutIcon, danger: true, onPress: handleSignOut },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* ─── Header ─── */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeftIcon size={28} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Settings and activity</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ─── Menu list ─── */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, i) => {
            const IconComp = item.icon;
            const isLast = i === menuItems.length - 1;
            return (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuRow,
                  !isLast && styles.menuRowBorder,
                  !isLast && { borderBottomColor: themeColors.border },
                ]}
                onPress={item.onPress}
                activeOpacity={0.6}
                accessibilityLabel={item.label}
                accessibilityRole="button"
                accessibilityHint={item.danger ? 'Signs you out of your account' : `Navigate to ${item.label}`}
              >
                <View style={styles.menuRowLeft}>
                  <View style={[
                    styles.menuIconCircle,
                    { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border },
                    item.danger && styles.menuIconCircleDanger,
                  ]}>
                    <IconComp size={20} color={item.danger ? colors.error : colors.primary} strokeWidth={1.5} />
                  </View>
                  <Text style={[
                    styles.menuLabel,
                    { color: themeColors.text },
                    item.danger && styles.menuLabelDanger,
                  ]}>
                    {item.label}
                  </Text>
                </View>
                <ChevronRightIcon size={18} color={item.danger ? colors.error : themeColors.textSecondary} strokeWidth={1.5} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── Version ─── */}
        <Text style={[styles.version, { color: themeColors.textSecondary }]}>ConnectMe v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ─── Header ───
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 36,
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  // ─── Menu ───
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
  },
  menuIconCircleDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  menuLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  menuLabelDanger: {
    color: colors.error,
  },

  // ─── Version ───
  version: {
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
