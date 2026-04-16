import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert,
  KeyboardAvoidingView, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, MailIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';
import { apiHeaders } from '../../services/headers';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

type Props = NativeStackScreenProps<any, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const passedEmail = (route.params as any)?.email ?? '';
  const [email, setEmail] = useState(passedEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSendReset() {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ email: email.trim() }),
      });
      // Always show success to prevent email enumeration
      setSent(true);
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
            <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={s.sentContent}>
          <View style={s.sentIconWrap}>
            <MailIcon size={36} color={colors.primary} />
          </View>
          <Text style={s.sentTitle}>Check your email</Text>
          <Text style={s.sentMessage}>
            We sent a password reset link to{'\n'}
            <Text style={s.sentEmail}>{email}</Text>
          </Text>
          <Text style={s.sentSub}>
            If you don't see it, check your spam folder. The link expires in 1 hour.
          </Text>

          <TouchableOpacity style={s.backToLoginBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} accessibilityLabel="Back to sign in" accessibilityRole="button">
            <Text style={s.backToLoginText}>Back to sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.resendBtn}
            onPress={() => { setSent(false); handleSendReset(); }}
            activeOpacity={0.6}
            accessibilityLabel="Resend reset link"
            accessibilityRole="button"
            accessibilityHint="Double tap to send the reset email again"
          >
            <Text style={s.resendText}>Didn't receive it? Send again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
              <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={s.title}>Forgot password?</Text>
          <Text style={s.subtitle}>
            No worries. Enter the email address associated with your account and we'll send you a link to reset your password.
          </Text>

          <Text style={s.label}>Email address</Text>
          <View style={s.inputWrapper}>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus={!passedEmail}
              accessibilityLabel="Email address input"
              accessibilityRole="text"
              accessibilityHint="Enter the email associated with your account"
            />
          </View>

          <TouchableOpacity
            style={[s.resetBtn, loading && s.resetBtnDisabled]}
            onPress={handleSendReset}
            activeOpacity={0.7}
            disabled={loading}
            accessibilityLabel="Send reset link"
            accessibilityRole="button"
            accessibilityHint="Double tap to send a password reset email"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={s.resetBtnText}>{loading ? 'Sending...' : 'Send reset link'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.backLink} onPress={() => navigation.goBack()} activeOpacity={0.6} accessibilityLabel="Back to sign in" accessibilityRole="link">
            <ChevronLeftIcon size={16} color={colors.text} strokeWidth={2} /><Text style={s.backLinkText}> Back to sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { paddingVertical: 8 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  backText: { fontSize: 24, color: colors.text },

  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 12 },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: 28 },

  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginBottom: 6 },
  inputWrapper: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground, marginBottom: 20,
  },
  input: { fontFamily: fonts.regular, fontSize: 16, color: colors.text, paddingHorizontal: 16, height: 50 },

  resetBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: 15, alignItems: 'center', marginBottom: 20 },
  resetBtnDisabled: { opacity: 0.6 },
  resetBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },

  backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  backLinkText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted },

  // Sent state
  sentContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  sentIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 20 },
  sentTitle: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 12 },
  sentMessage: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  sentEmail: { fontFamily: fonts.semiBold, color: colors.text },
  sentSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: 32 },
  backToLoginBtn: { backgroundColor: colors.text, borderRadius: borderRadius.md, paddingVertical: 15, paddingHorizontal: 40, alignItems: 'center', marginBottom: 16 },
  backToLoginText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
  resendBtn: { padding: 8 },
  resendText: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary, textDecorationLine: 'underline' },
});
