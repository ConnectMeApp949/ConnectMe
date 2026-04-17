import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'EditRadius'>;

const RADIUS_OPTIONS = [10, 25, 50, 75, 100];

export default function EditRadiusScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const [radius, setRadius] = useState(25);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Service Radius</Text>
        <TouchableOpacity onPress={() => { Alert.alert('Saved', `Service radius set to ${radius} miles!`); navigation.goBack(); }} activeOpacity={0.6} accessibilityLabel="Save changes" accessibilityRole="button"><Text style={[s.saveText, { color: themeColors.primary }]}>Save</Text></TouchableOpacity>
      </View>
      <View style={s.content}>
        <Text style={[s.label, { color: themeColors.text }]}>How far are you willing to travel?</Text>
        <View style={s.options}>
          {RADIUS_OPTIONS.map((r) => (
            <TouchableOpacity key={r} style={[s.option, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }, radius === r && { borderColor: themeColors.primary, backgroundColor: themeColors.primary }]} onPress={() => setRadius(r)} activeOpacity={0.7} accessibilityLabel={`${r} miles radius`} accessibilityRole="button" accessibilityState={{ selected: radius === r }}>
              <Text style={[s.optionText, { color: themeColors.textMuted }, radius === r && { color: '#fff', fontFamily: fonts.semiBold }]}>{r} miles</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[s.preview, { color: themeColors.textMuted }]}>Clients within {radius} miles of your location will see your listing</Text>
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
  saveText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.primary },
  content: { padding: 24 },
  label: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, marginBottom: 20 },
  options: { gap: 10 },
  option: { paddingVertical: 16, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  optionActive: { borderColor: colors.text, backgroundColor: colors.lightBlue },
  optionText: { fontFamily: fonts.medium, fontSize: 16, color: colors.textMuted },
  optionTextActive: { color: colors.text, fontFamily: fonts.semiBold },
  preview: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 24, lineHeight: 20 },
});
