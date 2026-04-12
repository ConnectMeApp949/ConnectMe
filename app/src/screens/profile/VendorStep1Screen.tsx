import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'VendorStep1'>;

export default function VendorStep1Screen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        <Text style={s.step}>Step 1</Text>
        <Text style={s.title}>Tell us about your business</Text>
        <Text style={s.description}>
          In this step, we'll ask you which type of business you have. Then let us know the location of your business.
        </Text>
      </View>

      <View style={s.footer}>
        <TouchableOpacity style={s.nextBtn} activeOpacity={0.7} onPress={() => navigation.navigate('VendorBusinessType')} accessibilityLabel="Next" accessibilityRole="button" accessibilityHint="Proceed to select your business type">
          <Text style={s.nextBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: 20, paddingVertical: 8 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  step: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.textMuted, marginBottom: 12 },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.text, marginBottom: 16 },
  description: { fontFamily: fonts.regular, fontSize: 17, color: colors.textSecondary, lineHeight: 26 },
  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border },
  nextBtn: { backgroundColor: colors.text, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
