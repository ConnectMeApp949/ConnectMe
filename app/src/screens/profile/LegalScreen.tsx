import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'Legal'>;

const ITEMS = ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Open Source Licenses', 'Accessibility Statement'];

export default function LegalScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Legal</Text>
        <View style={s.backBtn} />
      </View>
      <View style={s.list}>
        {ITEMS.map((label, i) => (
          <TouchableOpacity key={label} style={[s.row, i < ITEMS.length - 1 && s.rowBorder]} activeOpacity={0.6} onPress={() => navigation.navigate('LegalDoc', { doc: label })} accessibilityLabel={label} accessibilityRole="link">
            <Text style={s.rowLabel}>{label}</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.footer}>ConnectMe Inc. All rights reserved.{'\n'}San Antonio, TX · Version 1.0.0</Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  list: { paddingHorizontal: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 52 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  chevron: { fontSize: 22, color: colors.textMuted },
  footer: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 'auto', paddingBottom: 30, lineHeight: 18 },
});
