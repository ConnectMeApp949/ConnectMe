import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import { VendorSetupParamList } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const MAX_LENGTH = 300;

type Props = NativeStackScreenProps<VendorSetupParamList, 'Bio'>;

export default function BioScreen({ navigation, route }: Props) {
  const draft = route.params.draft;
  const [bio, setBio] = useState(draft.bio ?? '');

  return (
    <ProfileSetupLayout
      step={3}
      totalSteps={7}
      title="Describe your services"
      subtitle="Help clients understand what makes you special."
      onBack={() => navigation.goBack()}
      onContinue={() =>
        navigation.navigate('Pricing', { draft: { ...draft, bio: bio.trim() } })
      }
      continueDisabled={!bio.trim()}
    >
      <View style={styles.inputWrapper}>
        <RNTextInput
          style={styles.input}
          placeholder="Tell clients what makes your services special, how long you've been operating, and what types of events you love most."
          placeholderTextColor={colors.textMuted}
          value={bio}
          onChangeText={(t) => t.length <= MAX_LENGTH && setBio(t)}
          multiline
          textAlignVertical="top"
          maxLength={MAX_LENGTH}
        />
      </View>
      <Text style={[styles.counter, bio.length >= MAX_LENGTH && styles.counterMax]}>
        {bio.length}/{MAX_LENGTH}
      </Text>
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
    minHeight: 160,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    padding: spacing.md,
    minHeight: 160,
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
});
