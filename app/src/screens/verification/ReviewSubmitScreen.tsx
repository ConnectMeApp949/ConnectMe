import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import { VerificationFlowParamList } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

type Props = NativeStackScreenProps<VerificationFlowParamList, 'ReviewSubmit'>;

export default function ReviewSubmitScreen({ navigation, route }: Props) {
  const { draft } = route.params;
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('businessName', draft.businessName ?? '');
      if (draft.businessLicenseNumber) {
        formData.append('businessLicenseNumber', draft.businessLicenseNumber);
      }

      if (draft.governmentIdUri) {
        const filename = draft.governmentIdUri.split('/').pop() ?? 'id.jpg';
        formData.append('governmentId', {
          uri: draft.governmentIdUri,
          type: 'image/jpeg',
          name: filename,
        } as any);
      }

      const res = await fetch(`${API_URL}/verification/submit`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        Alert.alert('Error', data.error?.message || 'Submission failed');
        return;
      }

      Alert.alert(
        'Submitted!',
        'Your verification is under review. You\'ll be notified once it\'s approved.',
        [{ text: 'OK', onPress: () => navigation.popToTop() }]
      );
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProfileSetupLayout
      step={3}
      totalSteps={3}
      title="Review & submit"
      subtitle="Make sure everything looks correct before submitting."
      onBack={() => navigation.goBack()}
      onContinue={handleSubmit}
      continueLabel="Submit for Verification"
      continueLoading={loading}
    >
      {/* ID preview */}
      <View style={styles.section}>
        <Text style={styles.label}>Government ID</Text>
        {draft.governmentIdUri && (
          <Image source={{ uri: draft.governmentIdUri }} style={styles.idPreview} resizeMode="contain" />
        )}
      </View>

      {/* Business info */}
      <View style={styles.section}>
        <Text style={styles.label}>Business Name</Text>
        <Text style={styles.value}>{draft.businessName}</Text>
      </View>

      {draft.businessLicenseNumber && (
        <View style={styles.section}>
          <Text style={styles.label}>License Number</Text>
          <Text style={styles.value}>{draft.businessLicenseNumber}</Text>
        </View>
      )}

      {/* What happens next */}
      <View style={styles.nextCard}>
        <Text style={styles.nextTitle}>What happens next?</Text>
        <View style={styles.nextStep}>
          <Text style={styles.stepDot}>1</Text>
          <Text style={styles.stepText}>Our team reviews your submission (usually within 24 hours)</Text>
        </View>
        <View style={styles.nextStep}>
          <Text style={styles.stepDot}>2</Text>
          <Text style={styles.stepText}>If approved, you'll get a blue verified badge on your profile</Text>
        </View>
        <View style={styles.nextStep}>
          <Text style={styles.stepDot}>3</Text>
          <Text style={styles.stepText}>Verified vendors appear higher in search results</Text>
        </View>
      </View>
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.lg },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text },
  idPreview: {
    width: '100%', height: 160, borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border,
  },
  nextCard: {
    backgroundColor: colors.cardBackground, borderRadius: borderRadius.md,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md,
  },
  nextTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginBottom: spacing.md },
  nextStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md, gap: spacing.sm },
  stepDot: {
    fontFamily: fonts.bold, fontSize: 12, color: colors.white, backgroundColor: colors.primary,
    width: 24, height: 24, borderRadius: 12, textAlign: 'center', lineHeight: 24, overflow: 'hidden',
  },
  stepText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, flex: 1, lineHeight: 20 },
});
