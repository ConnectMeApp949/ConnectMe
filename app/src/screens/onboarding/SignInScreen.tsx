import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { colors, fonts, spacing } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';
import { OnboardingStackParamList } from '../../navigation/types';
import { login } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getBiometricPreference, saveCredentials } from '../../util/biometrics';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const auth = useAuth();
  const passedEmail = (route.params as any)?.email ?? '';
  const hasEmail = passedEmail.length > 0;

  const [email, setEmail] = useState(passedEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSignIn() {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await login(email, password);

      if (!res.success) {
        setErrors({ form: res.error?.message || 'Invalid email or password' });
        return;
      }

      // Save credentials for biometric login if preference is enabled
      const bioPref = await getBiometricPreference();
      if (bioPref) {
        await saveCredentials(email, res.data!.accessToken);
      }

      auth.login(res.data!.user, res.data!.accessToken);
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          {hasEmail ? (
            <>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
                <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
              </TouchableOpacity>
              <Text style={styles.title}>Enter your password</Text>
              <View style={styles.emailPreview}>
                <Text style={styles.emailPreviewText}>{email}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6} accessibilityLabel="Edit email" accessibilityRole="button" accessibilityHint="Double tap to go back and change your email">
                  <Text style={styles.emailChange}>Edit</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to your ConnectMe account</Text>
            </>
          )}

          {errors.form && (
            <View style={styles.formError}>
              <Text style={styles.formErrorText}>{errors.form}</Text>
            </View>
          )}

          {/* Only show email field if not passed from Welcome */}
          {!hasEmail && (
            <TextInput
              label="Email"
              placeholder="jane@example.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email input"
              accessibilityRole="text"
            />
          )}

          <TextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            isPassword
            accessibilityLabel="Password input"
            accessibilityRole="text"
          />

          <TouchableOpacity style={styles.forgotButton} onPress={() => (navigation as any).navigate('ForgotPassword', { email })} activeOpacity={0.6} accessibilityLabel="Forgot password" accessibilityRole="link" accessibilityHint="Double tap to reset your password">
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleSignIn}
            loading={loading}
            style={styles.submitButton}
            accessibilityLabel="Sign in button"
            accessibilityRole="button"
            accessibilityHint="Double tap to submit your login"
            accessibilityState={{ disabled: loading }}
          />

          <TouchableOpacity onPress={() => (navigation as any).navigate('SignUp', { email })} activeOpacity={0.6} style={styles.signUpLink} accessibilityLabel="Sign up" accessibilityRole="link" accessibilityHint="Double tap to create a new account">
            <Text style={styles.signUpText}>Don't have an account? <Text style={styles.signUpBold}>Sign up</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    marginBottom: spacing.sm,
  },
  backText: {
    fontSize: 24,
    color: colors.text,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  emailPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailPreviewText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  emailChange: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  formError: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  formErrorText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.error,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.accent,
  },
  submitButton: {
    marginBottom: spacing.md,
  },
  linkText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  signUpLink: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  signUpText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  signUpBold: {
    fontFamily: fonts.semiBold,
    color: colors.text,
    textDecorationLine: 'underline',
  },
});
