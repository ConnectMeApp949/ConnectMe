import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'VendorDescription'>;
const MAX = 500;

export default function VendorDescriptionScreen({ navigation }: Props) {
  const [bio, setBio] = useState('');

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        <Text style={s.title}>Create your description</Text>
        <Text style={s.subtitle}>Share what makes your business unique. Mention your experience, specialties, and what clients can expect.</Text>

        <View style={s.inputWrap}>
          <TextInput
            style={s.input}
            value={bio}
            onChangeText={(t) => t.length <= MAX && setBio(t)}
            placeholder="Tell clients about your business..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            maxLength={MAX}
            accessibilityLabel="Business description"
            accessibilityRole="text"
            accessibilityHint="Describe your business, up to 500 characters"
          />
        </View>
        <Text style={[s.counter, bio.length >= MAX && s.counterMax]}>{bio.length}/{MAX}</Text>
      </View>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.nextBtn, !bio.trim() && s.nextBtnDisabled]}
          activeOpacity={0.7}
          disabled={!bio.trim()}
          onPress={() => navigation.navigate('VendorPhotos')}
          accessibilityLabel="Next"
          accessibilityRole="button"
          accessibilityHint="Proceed to add photos"
        >
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
  content: { flex: 1, paddingHorizontal: 24 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.text, marginBottom: 8 },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: 20 },
  inputWrap: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.cardBackground, minHeight: 180 },
  input: { fontFamily: fonts.regular, fontSize: 16, color: colors.text, padding: 16, minHeight: 180, lineHeight: 24 },
  counter: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, textAlign: 'right', marginTop: 6 },
  counterMax: { color: colors.error },
  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border },
  nextBtn: { backgroundColor: colors.text, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.3 },
  nextBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
