import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'BecomeVendor'>;

const STEPS = [
  {
    number: '1',
    title: 'Tell us about your business',
    description: 'Share some basic info, like your type of business and what you do.',
  },
  {
    number: '2',
    title: 'Make it stand out',
    description: 'Add 5 or more photos plus a title and description.',
  },
  {
    number: '3',
    title: 'Finish and publish',
    description: 'Choose a starting price, verify a few details, then publish your business.',
  },
];

export default function BecomeVendorScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        <Text style={s.title}>Get started on ConnectMe</Text>

        {STEPS.map((step, i) => (
          <View key={step.number} style={s.stepRow}>
            <View style={s.stepLeft}>
              <View style={s.stepCircle}>
                <Text style={s.stepNumber}>{step.number}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={s.stepLine} />}
            </View>
            <View style={s.stepContent}>
              <Text style={s.stepTitle}>{step.title}</Text>
              <Text style={s.stepDesc}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={s.footer}>
        <TouchableOpacity style={s.getStartedBtn} activeOpacity={0.7} onPress={() => navigation.navigate('VendorStep1')} accessibilityLabel="Get started" accessibilityRole="button" accessibilityHint="Begin the vendor registration process">
          <Text style={s.getStartedText}>Get started</Text>
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

  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.text, marginBottom: 40 },

  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepLeft: { alignItems: 'center', marginRight: 20 },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumber: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
  stepLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 6 },
  stepContent: { flex: 1, paddingBottom: 32 },
  stepTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 6 },
  stepDesc: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, lineHeight: 22 },

  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border },
  getStartedBtn: { backgroundColor: colors.text, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  getStartedText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
