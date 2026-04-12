import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'EditDescription'>;
const MAX = 500;

export default function EditDescriptionScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const [bio, setBio] = useState('');

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Edit Description</Text>
        <TouchableOpacity onPress={() => { Alert.alert('Saved', 'Description updated!'); navigation.goBack(); }} activeOpacity={0.6} accessibilityLabel="Save changes" accessibilityRole="button"><Text style={s.saveText}>Save</Text></TouchableOpacity>
      </View>
      <View style={s.content}>
        <Text style={s.label}>Describe your business</Text>
        <View style={s.inputWrap}>
          <TextInput style={s.input} value={bio} onChangeText={(t) => t.length <= MAX && setBio(t)} placeholder="Tell clients what makes your business special..." placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" maxLength={MAX} autoFocus accessibilityLabel="Business description" accessibilityRole="text" accessibilityHint="Enter a description of your business, up to 500 characters" />
        </View>
        <Text style={[s.counter, bio.length >= MAX && s.counterMax]}>{bio.length}/{MAX}</Text>
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
  content: { padding: 20 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginBottom: 8 },
  inputWrap: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.cardBackground, minHeight: 200 },
  input: { fontFamily: fonts.regular, fontSize: 16, color: colors.text, padding: 16, minHeight: 200, lineHeight: 24 },
  counter: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, textAlign: 'right', marginTop: 6 },
  counterMax: { color: colors.error },
});
