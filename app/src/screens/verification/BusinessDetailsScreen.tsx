import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import TextInput from '../../components/TextInput';
import { VerificationFlowParamList } from './types';

type Props = NativeStackScreenProps<VerificationFlowParamList, 'BusinessDetails'>;

export default function BusinessDetailsScreen({ navigation, route }: Props) {
  const draft = route.params.draft;
  const [businessName, setBusinessName] = useState(draft.businessName ?? '');
  const [licenseNumber, setLicenseNumber] = useState(draft.businessLicenseNumber ?? '');

  return (
    <ProfileSetupLayout
      step={2}
      totalSteps={3}
      title="Business details"
      subtitle="Confirm your business name. If you have a business license, adding the number helps speed up verification."
      onBack={() => navigation.goBack()}
      onContinue={() =>
        navigation.navigate('ReviewSubmit', {
          draft: {
            ...draft,
            businessName: businessName.trim(),
            businessLicenseNumber: licenseNumber.trim() || undefined,
          },
        })
      }
      continueDisabled={!businessName.trim()}
    >
      <TextInput
        label="Business name"
        placeholder="Your registered business name"
        value={businessName}
        onChangeText={setBusinessName}
      />

      <TextInput
        label="Business license number (optional)"
        placeholder="e.g. BL-2024-12345"
        value={licenseNumber}
        onChangeText={setLicenseNumber}
      />
    </ProfileSetupLayout>
  );
}
