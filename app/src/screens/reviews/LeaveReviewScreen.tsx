import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput as RNTextInput, StyleSheet, TouchableOpacity,
  Animated, Alert, KeyboardAvoidingView, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { apiHeaders } from '../../services/headers';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
const MAX_COMMENT = 1000;

type Props = NativeStackScreenProps<any, 'LeaveReview'>;

function AnimatedStar({ filled, onPress, index }: { filled: boolean; onPress: () => void; index: number }) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.4, duration: 100, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.Text style={[styles.star, { transform: [{ scale }] }]}>
        {filled ? '★' : '☆'}
      </Animated.Text>
    </TouchableOpacity>
  );
}

export default function LeaveReviewScreen({ navigation, route }: Props) {
  const { token } = useAuth();
  const { showAlert } = useAlert();
  const { bookingId, vendorName } = route.params as { bookingId: string; vendorName: string };
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: apiHeaders(token),
        body: JSON.stringify({ bookingId, rating, comment: comment.trim() || undefined }),
      });
      const data = await res.json();

      if (!data.success) {
        Alert.alert('Error', data.error?.message || 'Failed to submit review');
        return;
      }

      showAlert('reviewReceived', 'Review Submitted', `Your review for ${vendorName} has been posted.`);
      Alert.alert('Thank you!', 'Your review has been submitted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <Text style={styles.title}>How was your experience?</Text>
          <Text style={styles.subtitle}>Rate your booking with {vendorName}</Text>

          {/* Star selector */}
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <AnimatedStar
                key={i}
                index={i}
                filled={i <= rating}
                onPress={() => setRating(i)}
              />
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>
          )}

          {/* Comment */}
          <Text style={styles.label}>Share more details (optional)</Text>
          <View style={styles.inputWrapper}>
            <RNTextInput
              style={styles.input}
              placeholder="What did you enjoy? What could be improved?"
              placeholderTextColor={colors.textMuted}
              value={comment}
              onChangeText={(t) => t.length <= MAX_COMMENT && setComment(t)}
              multiline
              textAlignVertical="top"
              maxLength={MAX_COMMENT}
            />
          </View>
          <Text style={[styles.counter, comment.length >= MAX_COMMENT && styles.counterMax]}>
            {comment.length}/{MAX_COMMENT}
          </Text>

          {/* Submit */}
          <Button
            title="Submit Review"
            onPress={handleSubmit}
            loading={loading}
            disabled={rating === 0}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  skipBtn: { alignSelf: 'flex-end', paddingVertical: spacing.sm },
  skipText: { fontFamily: fonts.medium, fontSize: 15, color: colors.textMuted },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.text, marginTop: spacing.lg },
  subtitle: { fontFamily: fonts.regular, fontSize: 16, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.sm },
  star: { fontSize: 48, color: colors.star },
  ratingLabel: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.text, textAlign: 'center', marginBottom: spacing.xl },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginBottom: spacing.sm },
  inputWrapper: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.cardBackground, minHeight: 140 },
  input: { fontFamily: fonts.regular, fontSize: 16, color: colors.text, padding: spacing.md, minHeight: 140, lineHeight: 24 },
  counter: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, textAlign: 'right', marginTop: spacing.xs },
  counterMax: { color: colors.error },
  submitBtn: { marginTop: spacing.xl },
});
