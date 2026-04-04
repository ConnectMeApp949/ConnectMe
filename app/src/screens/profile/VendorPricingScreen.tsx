import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'VendorPricing'>;

const UNITS = [
  { id: 'PER_HOUR', label: 'Per hour' },
  { id: 'PER_EVENT', label: 'Per event' },
  { id: 'CUSTOM', label: 'Custom quote' },
];

export default function VendorPricingScreen({ navigation }: Props) {
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('PER_EVENT');

  const numPrice = parseFloat(price);
  const isValid = !isNaN(numPrice) && numPrice > 0;
  const unitLabel = UNITS.find((u) => u.id === unit)?.label?.toLowerCase() ?? '';

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        <Text style={s.title}>Now, set your price</Text>
        <Text style={s.subtitle}>You can change it anytime.</Text>

        <View style={s.priceRow}>
          <Text style={s.dollar}>$</Text>
          <TextInput
            style={s.priceInput}
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            maxLength={8}
            accessibilityLabel="Price amount"
            accessibilityRole="text"
            accessibilityHint="Enter your price in dollars"
          />
        </View>

        <View style={s.unitRow}>
          {UNITS.map((u) => (
            <TouchableOpacity
              key={u.id}
              style={[s.unitBtn, unit === u.id && s.unitBtnActive]}
              onPress={() => setUnit(u.id)}
              activeOpacity={0.7}
              accessibilityLabel={`${u.label} pricing`}
              accessibilityRole="button"
              accessibilityState={{ selected: unit === u.id }}
            >
              <Text style={[s.unitText, unit === u.id && s.unitTextActive]}>{u.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isValid && (
          <View style={s.preview}>
            <Text style={s.previewLabel}>Clients will see</Text>
            <Text style={s.previewPrice}>Starting at ${numPrice.toFixed(0)} <Text style={s.previewUnit}>{unitLabel}</Text></Text>
          </View>
        )}
      </View>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.nextBtn, !isValid && s.nextBtnDisabled]}
          activeOpacity={0.7}
          disabled={!isValid}
          onPress={() => navigation.navigate('VendorReviewPublish')}
          accessibilityLabel="Next"
          accessibilityRole="button"
          accessibilityHint="Proceed to review and publish your listing"
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
  subtitle: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, marginBottom: 32 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  dollar: { fontFamily: fonts.bold, fontSize: 44, color: colors.text, marginRight: 4 },
  priceInput: { fontFamily: fonts.bold, fontSize: 44, color: colors.text, flex: 1, borderBottomWidth: 2, borderBottomColor: colors.text, paddingVertical: 4 },
  unitRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  unitBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  unitBtnActive: { borderColor: colors.text, backgroundColor: colors.lightBlue },
  unitText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted },
  unitTextActive: { color: colors.text, fontFamily: fonts.semiBold },
  preview: { backgroundColor: colors.cardBackground, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  previewLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  previewPrice: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  previewUnit: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border },
  nextBtn: { backgroundColor: colors.text, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.3 },
  nextBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
