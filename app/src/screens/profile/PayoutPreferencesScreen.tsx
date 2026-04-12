import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'PayoutPreferences'>;

export default function PayoutPreferencesScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Payouts</Text>
        <View style={s.backBtn} />
      </View>

      <View style={s.content}>
        <Text style={s.title}>How you'll get paid</Text>
        <Text style={s.message}>
          Add at least one payout method so we know where to send your money.
        </Text>

        <TouchableOpacity
          style={s.setupBtn}
          onPress={() => navigation.navigate('SetupPayouts')}
          activeOpacity={0.7}
          accessibilityLabel="Set up payouts"
          accessibilityRole="button"
          accessibilityHint="Configure how you receive payments"
        >
          <Text style={s.setupBtnText}>Set up payouts</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  content: { padding: 20 },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 12 },
  message: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: 28 },
  setupBtn: { backgroundColor: colors.text, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  setupBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
