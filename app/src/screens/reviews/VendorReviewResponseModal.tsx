import React, { useState } from 'react';
import {
  View, Text, TextInput as RNTextInput, StyleSheet, Modal, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Button from '../../components/Button';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
const MAX_RESPONSE = 500;

interface VendorReviewResponseModalProps {
  visible: boolean;
  reviewId: string;
  reviewerName: string;
  reviewComment: string | null;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function VendorReviewResponseModal({
  visible, reviewId, reviewerName, reviewComment, onClose, onSubmitted,
}: VendorReviewResponseModalProps) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!response.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reviews/${reviewId}/response`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: response.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        Alert.alert('Error', data.error?.message || 'Failed to submit response');
        return;
      }

      onSubmitted();
      onClose();
      setResponse('');
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reply to {reviewerName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Original review */}
          {reviewComment && (
            <View style={styles.originalReview}>
              <Text style={styles.originalLabel}>Their review:</Text>
              <Text style={styles.originalText} numberOfLines={3}>"{reviewComment}"</Text>
            </View>
          )}

          {/* Response input */}
          <View style={styles.inputWrapper}>
            <RNTextInput
              style={styles.input}
              placeholder="Write a professional, thoughtful response..."
              placeholderTextColor={colors.textMuted}
              value={response}
              onChangeText={(t) => t.length <= MAX_RESPONSE && setResponse(t)}
              multiline
              textAlignVertical="top"
              maxLength={MAX_RESPONSE}
              autoFocus
            />
          </View>
          <Text style={[styles.counter, response.length >= MAX_RESPONSE && styles.counterMax]}>
            {response.length}/{MAX_RESPONSE}
          </Text>

          <Text style={styles.note}>
            Your response will be publicly visible and cannot be edited after submission.
          </Text>

          <Button
            title="Submit Response"
            onPress={handleSubmit}
            loading={loading}
            disabled={!response.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  closeText: {
    fontSize: 20,
    color: colors.textMuted,
    padding: spacing.sm,
  },
  originalReview: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  originalLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  originalText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 21,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
    minHeight: 120,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    padding: spacing.md,
    minHeight: 120,
    lineHeight: 24,
  },
  counter: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  counterMax: {
    color: colors.error,
  },
  note: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
});
