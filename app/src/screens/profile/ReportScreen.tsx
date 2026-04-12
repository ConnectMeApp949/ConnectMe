import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/Button';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ─── Constants ──────────────────────────────────────────

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
const MAX_DETAILS_LENGTH = 1000;
const MAX_ATTACHMENTS = 3;

const REPORT_REASONS = [
  'Inappropriate content or photos',
  'Misleading or false information',
  'Harassment or threatening behavior',
  'Spam or scam',
  'No-show or service not delivered',
  'Safety concern',
  'Other',
] as const;

type ReportReason = (typeof REPORT_REASONS)[number];

// ─── Component ──────────────────────────────────────────

type Props = NativeStackScreenProps<any, 'Report'>;

export default function ReportScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const { token } = useAuth();
  const { name, photo, vendorId } = route.params as {
    name: string;
    photo: string | null;
    vendorId: string;
  };

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = selectedReason !== null && !submitting;

  async function handlePickImage() {
    if (attachments.length >= MAX_ATTACHMENTS) {
      Alert.alert('Limit reached', `You can attach up to ${MAX_ATTACHMENTS} screenshots.`);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please grant photo library access to attach evidence.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAttachments((prev) => [...prev, result.assets[0].uri]);
    }
  }

  function handleRemoveAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({
          vendorId,
          reason: selectedReason,
          details: details.trim() || null,
          attachments: attachments.length > 0 ? attachments : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        Alert.alert('Error', data.message ?? 'Unable to submit report. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Unable to submit report. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Success screen ───────────────────────────────────

  if (submitted) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon} accessibilityLabel="Checkmark">
              {'\u2713'}
            </Text>
          </View>
          <Text style={styles.successTitle}>Report Submitted</Text>
          <Text style={styles.successBody}>
            Thank you for helping keep ConnectMe safe. We'll review your report and take
            appropriate action within 24 hours. You'll receive an email update.
          </Text>
          <Button
            title="Done"
            onPress={() => navigation.goBack()}
            style={styles.doneButton}
            accessibilityLabel="Done, go back"
          />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Report form ──────────────────────────────────────

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={[styles.backIcon, { color: themeColors.text }]}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Report</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Who are you reporting */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who are you reporting?</Text>
            <View style={styles.userCard}>
              {photo ? (
                <Image
                  source={{ uri: photo }}
                  style={styles.userPhoto}
                  accessibilityLabel={`Photo of ${name}`}
                />
              ) : (
                <View style={[styles.userPhoto, styles.userPhotoPlaceholder]}>
                  <Text style={styles.userPhotoPlaceholderText}>
                    {name?.charAt(0)?.toUpperCase() ?? '?'}
                  </Text>
                </View>
              )}
              <Text style={styles.userName}>{name}</Text>
            </View>
          </View>

          {/* Report reason */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is the reason for your report?</Text>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={styles.radioRow}
                onPress={() => setSelectedReason(reason)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedReason === reason }}
                accessibilityLabel={reason}
              >
                <View
                  style={[
                    styles.radioOuter,
                    selectedReason === reason && styles.radioOuterSelected,
                  ]}
                >
                  {selectedReason === reason && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{reason}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional details</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Please describe the issue..."
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={MAX_DETAILS_LENGTH}
                value={details}
                onChangeText={setDetails}
                textAlignVertical="top"
                accessibilityLabel="Describe the issue"
                accessibilityHint={`Up to ${MAX_DETAILS_LENGTH} characters`}
              />
              <Text style={styles.charCounter}>
                {details.length}/{MAX_DETAILS_LENGTH}
              </Text>
            </View>
          </View>

          {/* Attach evidence */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attach evidence (optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Add up to {MAX_ATTACHMENTS} screenshots to support your report.
            </Text>

            <View style={styles.attachmentsRow}>
              {attachments.map((uri, index) => (
                <View key={uri} style={styles.thumbnailContainer}>
                  <Image
                    source={{ uri }}
                    style={styles.thumbnail}
                    accessibilityLabel={`Attached screenshot ${index + 1}`}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveAttachment(index)}
                    accessibilityLabel={`Remove screenshot ${index + 1}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.removeButtonText}>{'\u00D7'}</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {attachments.length < MAX_ATTACHMENTS && (
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handlePickImage}
                  accessibilityLabel="Add screenshot"
                  accessibilityRole="button"
                >
                  <Text style={styles.addPhotoIcon}>+</Text>
                  <Text style={styles.addPhotoText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              Reports are reviewed by our Trust & Safety team within 24 hours. False reports
              may result in account restrictions.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit button */}
      <View style={styles.footer}>
        <Button
          title="Submit Report"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={submitting}
          style={styles.submitButton}
          accessibilityLabel="Submit report"
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: colors.text,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },

  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  userPhotoPlaceholder: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPhotoPlaceholderText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.white,
  },
  userName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    flexShrink: 1,
  },

  // Radio buttons
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    flexShrink: 1,
  },

  // Text input
  textInputContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
  },
  textInput: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    minHeight: 120,
    padding: spacing.md,
    lineHeight: 22,
  },
  charCounter: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },

  // Attachments
  attachmentsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: colors.white,
    fontFamily: fonts.bold,
    lineHeight: 18,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
  },
  addPhotoIcon: {
    fontSize: 24,
    color: colors.textMuted,
    lineHeight: 26,
  },
  addPhotoText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Disclaimer
  disclaimerContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.sm,
  },
  disclaimerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  submitButton: {
    width: '100%',
  },

  // Success screen
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  successIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successIcon: {
    fontSize: 36,
    color: colors.white,
    fontFamily: fonts.bold,
  },
  successTitle: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successBody: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  doneButton: {
    width: '100%',
  },
});
