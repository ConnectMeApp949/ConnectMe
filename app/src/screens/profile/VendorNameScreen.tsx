import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'VendorName'>;

export default function VendorNameScreen({ navigation }: Props) {
  const [name, setName] = useState('');

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        <Text style={s.title}>Now, let's give your business a name</Text>
        <Text style={s.subtitle}>Short names work best. Don't worry, you can always change it later.</Text>

        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. DJ Martinez SA"
          placeholderTextColor={colors.textMuted}
          maxLength={60}
          autoFocus
          accessibilityLabel="Business name"
          accessibilityRole="text"
          accessibilityHint="Enter your business name, up to 60 characters"
        />
        <Text style={s.counter}>{name.length}/60</Text>
      </View>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.nextBtn, !name.trim() && s.nextBtnDisabled]}
          activeOpacity={0.7}
          disabled={!name.trim()}
          onPress={() => navigation.navigate('VendorDescription', { businessName: name.trim() })}
          accessibilityLabel="Next"
          accessibilityRole="button"
          accessibilityHint="Proceed to write your business description"
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
  subtitle: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: 28 },
  input: {
    fontFamily: fonts.regular, fontSize: 20, color: colors.text,
    borderBottomWidth: 2, borderBottomColor: colors.text, paddingVertical: 12,
  },
  counter: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 8, textAlign: 'right' },
  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border },
  nextBtn: { backgroundColor: colors.text, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.3 },
  nextBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
