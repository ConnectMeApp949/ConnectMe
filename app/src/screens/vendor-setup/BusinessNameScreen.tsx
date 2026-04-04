import React, { useState } from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import { VendorSetupParamList } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<VendorSetupParamList, 'BusinessName'>;

export default function BusinessNameScreen({ navigation, route }: Props) {
  const [name, setName] = useState(route.params?.draft?.businessName ?? '');

  return (
    <ProfileSetupLayout
      step={1}
      totalSteps={7}
      title="What's your business name?"
      subtitle="This is how clients will find you."
      onBack={() => navigation.goBack()}
      onContinue={() =>
        navigation.navigate('Category', {
          draft: { ...route.params?.draft, businessName: name.trim() },
        })
      }
      continueDisabled={!name.trim()}
    >
      <RNTextInput
        style={styles.input}
        placeholder="e.g. DJ Martinez SA"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
        maxLength={80}
      />
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: fonts.regular,
    fontSize: 22,
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: spacing.md,
  },
});
