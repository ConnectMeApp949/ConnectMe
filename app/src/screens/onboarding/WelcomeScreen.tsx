import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { OnboardingStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  isBiometricAvailable,
  getBiometricType,
  getBiometricPreference,
  authenticateWithBiometrics,
  getSavedCredentials,
} from '../../util/biometrics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

const SOCIAL_FALLBACKS: Record<string, { label: string; color: string }> = {
  apple: { label: '\uF8FF', color: '#000000' },
};

export default function WelcomeScreen({ navigation }: Props) {
  const auth = useAuth();
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [showBiometricButton, setShowBiometricButton] = useState(false);
  const [appleImgError, setAppleImgError] = useState(false);

  useEffect(() => {
    async function tryBiometricLogin() {
      const available = await isBiometricAvailable();
      if (!available) return;

      const prefEnabled = await getBiometricPreference();
      if (!prefEnabled) return;

      const credentials = await getSavedCredentials();
      if (!credentials) return;

      const type = await getBiometricType();
      setBiometricType(type);
      setShowBiometricButton(true);

      // Auto-prompt biometric on launch
      const success = await authenticateWithBiometrics(
        `Log in to ConnectMe with ${type}`,
      );
      if (success) {
        // Restore session with saved credentials
        auth.login({ email: credentials.email }, credentials.token);
      }
    }
    tryBiometricLogin();
  }, []);

  function handleContinue() {
    if (!input.trim()) {
      Alert.alert('Required', 'Please enter your phone number or email.');
      return;
    }
    navigation.navigate('SignIn', { email: input.trim() });
  }

  async function handleBiometricLogin() {
    const credentials = await getSavedCredentials();
    if (!credentials) {
      Alert.alert('No Saved Login', 'Please sign in with your email first, then enable biometric login in Account Settings.');
      return;
    }
    const success = await authenticateWithBiometrics(
      `Log in to ConnectMe with ${biometricType}`,
    );
    if (success) {
      auth.login({ email: credentials.email }, credentials.token);
    }
  }

  async function handleAppleLogin() {
    if (Platform.OS !== 'ios') {
      Alert.alert('Apple Login', 'Sign in with Apple is only available on iOS devices.');
      return;
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // credential.identityToken is a JWT that should be sent to the backend
      // to verify and create/login the user
      if (credential.identityToken) {
        // TODO: Send credential.identityToken to backend for verification
        // For now, create a local session with the Apple credential info
        const appleUser = {
          email: credential.email ?? `apple-${credential.user}@privaterelay.appleid.com`,
          firstName: credential.fullName?.givenName ?? '',
          lastName: credential.fullName?.familyName ?? '',
          appleUserId: credential.user,
        };
        auth.login(appleUser, credential.identityToken);
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User cancelled — do nothing
        return;
      }
      Alert.alert('Sign In Failed', 'Unable to sign in with Apple. Please try again or use email and password.');
    }
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
      <View style={s.innerContent}>
      {/* Logo + tagline */}
      <View style={s.logoSection}>
        <Image
          source={require('../../assets/connectme-logo.png')}
          style={s.logo}
          resizeMode="contain"
          accessibilityLabel="ConnectMe logo"
          accessibilityRole="image"
        />
      </View>

      {/* Login form */}
      <View style={s.formSection}>
        <Text style={s.title}>{t('logInOrSignUp')}</Text>

        <View style={s.inputWrapper}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Phone number or email"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel="Phone number or email input"
            accessibilityRole="text"
            accessibilityHint="Enter your phone number or email to log in or sign up"
          />
        </View>

        <TouchableOpacity style={s.continueBtn} onPress={handleContinue} activeOpacity={0.7} accessibilityLabel={t('continueBtn')} accessibilityRole="button" accessibilityHint="Double tap to proceed with your phone number or email">
          <Text style={s.continueBtnText}>{t('continueBtn')}</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Apple Sign-In button */}
        <View style={s.appleButtonRow}>
          <TouchableOpacity style={s.socialCircle} activeOpacity={0.7} onPress={handleAppleLogin} accessibilityLabel="Continue with Apple" accessibilityRole="button" accessibilityHint="Double tap to sign in with your Apple account">
            {!appleImgError ? (
              <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/mac-os.png' }} style={s.socialCircleIcon} onError={() => setAppleImgError(true)} accessibilityLabel="Apple logo" accessibilityRole="image" />
            ) : (
              <Text style={[s.socialFallbackText, { color: SOCIAL_FALLBACKS.apple.color }]} accessibilityLabel="Apple logo">{SOCIAL_FALLBACKS.apple.label}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Biometric login button — only visible for returning users with biometrics enabled */}
        {showBiometricButton && biometricType && (
          <>
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>

            <TouchableOpacity
              style={s.biometricBtn}
              activeOpacity={0.7}
              onPress={handleBiometricLogin}
              accessibilityLabel={`Log in with ${biometricType}`}
              accessibilityRole="button"
              accessibilityHint={`Double tap to authenticate with ${biometricType}`}
            >
              <Text style={s.biometricText}>{`Log in with ${biometricType}`}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  innerContent: {
    width: '100%',
    maxWidth: 400,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  formSection: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.text,
    marginBottom: 28,
    textAlign: 'center',
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    marginBottom: 16,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 16,
    height: 56,
  },
  continueBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  continueBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginHorizontal: 16,
  },
  appleButtonRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  socialCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  socialCircleIcon: {
    width: 24,
    height: 24,
  },
  socialFallbackText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    textAlign: 'center',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  biometricText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.white,
  },
});
