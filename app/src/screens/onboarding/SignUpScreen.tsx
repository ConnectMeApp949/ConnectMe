import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import PasswordStrength from '../../components/PasswordStrength';
import { colors, fonts, spacing } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';
import { OnboardingStackParamList } from '../../navigation/types';
import { register } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation, route }: Props) {
  const auth = useAuth();
  const passedEmail = (route.params as any)?.email ?? '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(passedEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSignUp() {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await register({ firstName, lastName, email, password, userType: 'CLIENT' });

      if (!res.success) {
        if (res.error?.errors) {
          const fieldErrors: Record<string, string> = {};
          res.error.errors.forEach((e) => { fieldErrors[e.field] = e.message; });
          setErrors(fieldErrors);
        } else {
          setErrors({ form: res.error?.message || 'Registration failed' });
        }
        return;
      }

      auth.login(res.data!.user, res.data!.accessToken);
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
            <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>

          <Text style={s.title}>Finish signing up</Text>

          {errors.form && (
            <View style={s.formError}>
              <Text style={s.formErrorText}>{errors.form}</Text>
            </View>
          )}

          <View style={s.row}>
            <View style={s.halfField}>
              <TextInput label="First name" placeholder="First name" value={firstName} onChangeText={setFirstName} error={errors.firstName} autoCapitalize="words" accessibilityLabel="First name input" accessibilityRole="text" />
            </View>
            <View style={s.halfField}>
              <TextInput label="Last name" placeholder="Last name" value={lastName} onChangeText={setLastName} error={errors.lastName} autoCapitalize="words" accessibilityLabel="Last name input" accessibilityRole="text" />
            </View>
          </View>

          {passedEmail ? (
            <View style={s.emailPreview}>
              <Text style={s.emailLabel}>Email</Text>
              <Text style={s.emailValue}>{email}</Text>
            </View>
          ) : (
            <TextInput label="Email" placeholder="Email" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" accessibilityLabel="Email input" accessibilityRole="text" />
          )}

          <TextInput label="Password" placeholder="At least 8 characters" value={password} onChangeText={setPassword} error={errors.password} isPassword accessibilityLabel="Password input" accessibilityRole="text" />
          <PasswordStrength password={password} />

          <Text style={s.terms}>
            By selecting <Text style={s.termsBold}>Agree and continue</Text>, I agree to ConnectMe's Terms of Service, Payments Terms of Service, and Nondiscrimination Policy and acknowledge the Privacy Policy.
          </Text>

          <Button title="Agree and continue" onPress={handleSignUp} loading={loading} style={s.submitBtn} accessibilityLabel="Agree and continue" accessibilityRole="button" accessibilityHint="Double tap to create your account" accessibilityState={{ disabled: loading }} />

          <TouchableOpacity onPress={() => navigation.navigate('SignIn', { email })} activeOpacity={0.6} accessibilityLabel="Sign in" accessibilityRole="link" accessibilityHint="Double tap to go to sign in">
            <Text style={s.signInLink}>Already have an account? <Text style={s.signInBold}>Sign in</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8, marginBottom: 8 },
  backText: { fontSize: 24, color: colors.text },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 8 },
  halfField: { flex: 1 },
  emailPreview: { backgroundColor: colors.cardBackground, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  emailLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  emailValue: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  formError: { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 16, marginBottom: 16 },
  formErrorText: { fontFamily: fonts.medium, fontSize: 14, color: colors.error },
  terms: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, lineHeight: 18, marginBottom: 20 },
  termsBold: { fontFamily: fonts.semiBold, color: colors.text, textDecorationLine: 'underline' },
  submitBtn: { marginBottom: 16, backgroundColor: colors.secondary },
  signInLink: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  signInBold: { fontFamily: fonts.semiBold, color: colors.text, textDecorationLine: 'underline' },
});
