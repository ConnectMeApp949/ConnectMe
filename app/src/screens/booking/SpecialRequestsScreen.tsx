import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import { BookingFlowParamList } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const MAX_LENGTH = 500;

type Props = NativeStackScreenProps<BookingFlowParamList, 'SpecialRequests'>;

export default function SpecialRequestsScreen({ navigation, route }: Props) {
  const { vendor, draft } = route.params;
  const [text, setText] = useState(draft.specialRequirements ?? '');

  return (
    <ProfileSetupLayout
      step={3}
      totalSteps={6}
      title="Anything else?"
      subtitle="Let the vendor know about any special requirements."
      onBack={() => navigation.goBack()}
      onContinue={() =>
        navigation.navigate('PricingReview', {
          vendor,
          draft: { ...draft, specialRequirements: text.trim() },
        })
      }
      continueLabel="Review Booking"
    >
      <View style={styles.inputWrapper}>
        <RNTextInput
          style={styles.input}
          placeholder="Anything the vendor should know? Dietary needs, setup preferences, timeline details..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={(t) => t.length <= MAX_LENGTH && setText(t)}
          multiline
          textAlignVertical="top"
          maxLength={MAX_LENGTH}
        />
      </View>
      <Text style={[styles.counter, text.length >= MAX_LENGTH && styles.counterMax]}>
        {text.length}/{MAX_LENGTH}
      </Text>
      <Text style={styles.hint}>This step is optional. You can continue without entering anything.</Text>
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
    minHeight: 180,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    padding: spacing.md,
    minHeight: 180,
    lineHeight: 24,
  },
  counter: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  counterMax: {
    color: colors.error,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
