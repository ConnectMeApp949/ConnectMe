import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import { VerificationFlowParamList } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<VerificationFlowParamList, 'UploadId'>;

export default function UploadIdScreen({ navigation, route }: Props) {
  const [idUri, setIdUri] = useState(route.params?.draft?.governmentIdUri ?? '');

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setIdUri(result.assets[0].uri);
    }
  }

  return (
    <ProfileSetupLayout
      step={1}
      totalSteps={3}
      title="Upload your ID"
      subtitle="We need a government-issued photo ID to verify your identity. This is kept secure and never shared publicly."
      onBack={() => navigation.goBack()}
      onContinue={() =>
        navigation.navigate('BusinessDetails', {
          draft: { ...route.params?.draft, governmentIdUri: idUri },
        })
      }
      continueDisabled={!idUri}
    >
      {idUri ? (
        <TouchableOpacity onPress={pickImage} style={styles.previewWrap} activeOpacity={0.8}>
          <Image source={{ uri: idUri }} style={styles.preview} resizeMode="contain" />
          <View style={styles.changeOverlay}>
            <Text style={styles.changeText}>Tap to change</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage} activeOpacity={0.7}>
          <Text style={styles.uploadIcon}>🪪</Text>
          <Text style={styles.uploadTitle}>Tap to upload</Text>
          <Text style={styles.uploadSub}>
            Driver's license, passport, or state ID
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>🔒</Text>
        <Text style={styles.infoText}>
          Your ID is encrypted and stored securely. It's only used for verification and never shown to clients or on your profile.
        </Text>
      </View>
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  uploadBox: {
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    borderRadius: borderRadius.lg, backgroundColor: colors.cardBackground,
    alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl,
  },
  uploadIcon: { fontSize: 48, marginBottom: spacing.md },
  uploadTitle: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.primary },
  uploadSub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: spacing.xs },
  previewWrap: {
    borderRadius: borderRadius.lg, overflow: 'hidden', position: 'relative',
    backgroundColor: colors.cardBackground,
  },
  preview: { width: '100%', height: 220 },
  changeOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: spacing.sm, alignItems: 'center',
  },
  changeText: { fontFamily: fonts.medium, fontSize: 14, color: colors.white },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.xl, gap: spacing.sm,
  },
  infoIcon: { fontSize: 16, marginTop: 2 },
  infoText: { fontFamily: fonts.regular, fontSize: 13, color: colors.accent, flex: 1, lineHeight: 20 },
});
