import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import TextInput from '../../components/TextInput';
import { BookingFlowParamList } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<BookingFlowParamList, 'Location'>;

export default function LocationScreen({ navigation, route }: Props) {
  const { vendor, draft } = route.params;
  const [location, setLocation] = useState(draft.eventLocation ?? '');
  const [notes, setNotes] = useState(draft.locationNotes ?? '');

  return (
    <ProfileSetupLayout
      step={2}
      totalSteps={6}
      title="Event location"
      subtitle="Where will the event take place?"
      onBack={() => navigation.goBack()}
      onContinue={() =>
        navigation.navigate('SpecialRequests', {
          vendor,
          draft: { ...draft, eventLocation: location.trim(), locationNotes: notes.trim() },
        })
      }
      continueDisabled={!location.trim()}
    >
      <TextInput
        label="Event address"
        placeholder="123 Main St, San Antonio, TX"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Special location instructions (optional)</Text>
      <View style={styles.notesWrapper}>
        <RNTextInput
          style={styles.notesInput}
          placeholder="e.g. Park in the back lot, enter through side gate..."
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
          maxLength={200}
        />
      </View>
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  notesWrapper: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
    minHeight: 100,
  },
  notesInput: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    padding: spacing.md,
    minHeight: 100,
    lineHeight: 22,
  },
});
