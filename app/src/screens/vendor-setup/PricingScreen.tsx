import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import { VendorSetupParamList, PriceUnitOption } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const UNITS: PriceUnitOption[] = [
  { id: 'PER_HOUR', label: 'Per Hour' },
  { id: 'PER_EVENT', label: 'Per Event' },
  { id: 'CUSTOM', label: 'Custom Quote' },
];

type Props = NativeStackScreenProps<VendorSetupParamList, 'Pricing'>;

export default function PricingScreen({ navigation, route }: Props) {
  const draft = route.params.draft;
  const [price, setPrice] = useState(draft.basePrice ?? '');
  const [unit, setUnit] = useState(draft.priceUnit ?? 'PER_HOUR');

  const numericPrice = parseFloat(price);
  const isValid = !isNaN(numericPrice) && numericPrice > 0;
  const unitLabel = UNITS.find((u) => u.id === unit)?.label?.toLowerCase() ?? '';

  return (
    <ProfileSetupLayout
      step={4}
      totalSteps={7}
      title="Set your pricing"
      subtitle="You can always adjust this later."
      onBack={() => navigation.goBack()}
      onContinue={() =>
        navigation.navigate('Location', {
          draft: { ...draft, basePrice: price, priceUnit: unit },
        })
      }
      continueDisabled={!isValid}
    >
      {/* Price input */}
      <View style={styles.priceRow}>
        <Text style={styles.dollar}>$</Text>
        <RNTextInput
          style={styles.priceInput}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          maxLength={8}
        />
      </View>

      {/* Unit toggle */}
      <View style={styles.unitRow}>
        {UNITS.map((u) => (
          <TouchableOpacity
            key={u.id}
            style={[styles.unitButton, unit === u.id && styles.unitActive]}
            onPress={() => setUnit(u.id)}
          >
            <Text style={[styles.unitText, unit === u.id && styles.unitTextActive]}>
              {u.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Preview card */}
      {isValid && (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Clients will see</Text>
          <Text style={styles.previewPrice}>
            Starting at ${numericPrice.toFixed(0)}{' '}
            <Text style={styles.previewUnit}>{unitLabel}</Text>
          </Text>
        </View>
      )}
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dollar: {
    fontFamily: fonts.bold,
    fontSize: 40,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  priceInput: {
    fontFamily: fonts.bold,
    fontSize: 40,
    color: colors.text,
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: spacing.sm,
  },
  unitRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  unitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  unitActive: {
    borderColor: colors.primary,
    backgroundColor: colors.lightBlue,
  },
  unitText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  unitTextActive: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  preview: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  previewPrice: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.primary,
  },
  previewUnit: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
