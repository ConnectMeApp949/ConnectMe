import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, CheckIcon, AlertCircleIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'VendorReviewPublish'>;

export default function VendorReviewPublishScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [publishing, setPublishing] = useState(false);

  async function handlePublish() {
    setPublishing(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
      const res = await fetch(`${API_URL}/vendors/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({ publish: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to publish listing');
      }
      Alert.alert(
        'Congratulations!',
        'Your business is now live on ConnectMe. Clients can find and book you right away!',
        [{ text: 'View My Listing', onPress: () => navigation.popToTop() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unable to publish. Please try again.');
    } finally {
      setPublishing(false);
    }
  }

  const steps = [
    { label: 'Business type selected' },
    { label: 'Location added' },
    { label: 'Business name set' },
    { label: 'Description written' },
    { label: 'Photos uploaded' },
    { label: 'Pricing configured' },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Review and publish</Text>
        <Text style={s.subtitle}>Here's what we'll show to potential clients. Make sure everything looks good before publishing.</Text>

        <View style={s.checklistCard}>
          <Text style={s.checklistTitle}>Your listing checklist</Text>
          {steps.map((step) => (
            <View key={step.label} style={s.checkRow}>
              <View style={s.checkCircle}>
                <CheckIcon size={14} color={colors.white} strokeWidth={2.5} />
              </View>
              <Text style={s.checkLabel}>{step.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.infoCard}>
          <AlertCircleIcon size={18} color={colors.primary} />
          <Text style={s.infoText}>
            After publishing, your listing will be visible to all ConnectMe users. You can edit any details at any time from your profile.
          </Text>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.publishBtn, publishing && s.publishBtnDisabled]}
          activeOpacity={0.7}
          disabled={publishing}
          onPress={handlePublish}
          accessibilityLabel={publishing ? 'Publishing in progress' : 'Publish your listing'}
          accessibilityRole="button"
          accessibilityHint="Submit and publish your vendor listing on ConnectMe"
        >
          <Text style={s.publishBtnText}>{publishing ? 'Publishing...' : 'Publish your listing'}</Text>
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
  scroll: { paddingHorizontal: 24, paddingBottom: 100 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.text, marginBottom: 8 },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: 24 },

  checklistCard: {
    backgroundColor: colors.cardBackground, borderRadius: 12, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  checklistTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginBottom: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center',
  },
  checkLabel: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },

  infoCard: {
    flexDirection: 'row', backgroundColor: colors.lightBlue, borderRadius: 12, padding: 16, gap: 12,
  },
  infoIconWrap: { marginTop: 2 },
  infoText: { fontFamily: fonts.regular, fontSize: 13, color: colors.primary, flex: 1, lineHeight: 20 },

  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border },
  publishBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  publishBtnDisabled: { opacity: 0.6 },
  publishBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
