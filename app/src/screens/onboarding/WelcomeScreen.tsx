import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { OnboardingStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  isBiometricAvailable,
  getBiometricType,
  getBiometricPreference,
  authenticateWithBiometrics,
  getSavedCredentials,
} from '../../util/biometrics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

WebBrowser.maybeCompleteAuthSession();

const SOCIAL_FALLBACKS: Record<string, { label: string; color: string }> = {
  facebook: { label: 'f', color: '#1877F2' },
  google: { label: 'G', color: '#4285F4' },
  apple: { label: '\uF8FF', color: '#000000' },
};

export default function WelcomeScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const auth = useAuth();
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [showBiometricButton, setShowBiometricButton] = useState(false);

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

  async function handleFacebookLogin() {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
    const fbAppId = '951097110641665';
    const redirectUri = 'https://auth.expo.io/@connectme/connectme';

    let result;
    try {
      const authUrl =
        `https://www.facebook.com/v18.0/dialog/oauth` +
        `?client_id=${fbAppId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=email,public_profile` +
        `&response_type=token`;

      result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    } catch (err: any) {
      Alert.alert(
        'Unable to Connect',
        'Unable to connect to Facebook. Please try again or use email to sign in.',
      );
      return;
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      // User closed the browser — do nothing
      return;
    }

    if (result.type !== 'success' || !result.url) {
      Alert.alert(
        'Unable to Connect',
        'Unable to connect to Facebook. Please try again or use email to sign in.',
      );
      return;
    }

    // Check for OAuth error in the redirect URL
    const urlFragment = result.url.split('#')[1] ?? '';
    const urlQuery = result.url.split('?')[1] ?? '';
    const errorParams = new URLSearchParams(urlQuery);
    if (errorParams.get('error')) {
      const errorDesc = errorParams.get('error_description') ?? 'Facebook login was not completed.';
      Alert.alert('Facebook Login', errorDesc.replace(/\+/g, ' '));
      return;
    }

    const params = new URLSearchParams(urlFragment);
    const accessToken = params.get('access_token');
    if (!accessToken) {
      Alert.alert(
        'Unable to Connect',
        'Unable to connect to Facebook. Please try again or use email to sign in.',
      );
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'facebook', accessToken }),
      });
      const data = await res.json();
      if (data.success) {
        auth.login(data.data.user, data.data.accessToken);
      } else {
        Alert.alert(
          'Sign In Failed',
          data.error?.message || 'Unable to sign in with Facebook. Please try again or use email to sign in.',
        );
      }
    } catch (err: any) {
      Alert.alert(
        'Unable to Connect',
        'Unable to connect to Facebook. Please try again or use email to sign in.',
      );
    }
  }

  async function handleGoogleLogin() {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
      const clientId = '528402499661-nktq259d8g6h6trep8nkj37ii6046681.apps.googleusercontent.com';
      const redirectUri = 'https://auth.expo.io/@connectme/connectme';
      const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=' + clientId + '&redirect_uri=' + encodeURIComponent(redirectUri) + '&scope=email%20profile&response_type=token';

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const params = new URLSearchParams(result.url.split('#')[1]);
        const accessToken = params.get('access_token');
        if (accessToken) {
          const res = await fetch(API_URL + '/auth/social-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider: 'google', accessToken }),
          });
          const data = await res.json();
          if (data.success) {
            auth.login(data.data.user, data.data.accessToken);
          } else {
            Alert.alert('Sign In Failed', data.error?.message || 'Unable to sign in with Google.');
          }
        }
      }
    } catch {
      Alert.alert('Sign In Failed', 'Unable to sign in with Google. Please try again or use email and password.');
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
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
        try {
          const res = await fetch(`${API_URL}/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider: 'apple', identityToken: credential.identityToken }),
          });
          const data = await res.json();
          if (data.success) {
            auth.login(data.data.user, data.data.accessToken);
            return;
          }
        } catch {
          // Backend unavailable — fall back to local session
        }

        // Fallback: create a local session with the Apple credential info
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

        {/* Social Sign-In icons — local assets for guaranteed rendering */}
        <View style={s.socialRow}>
          <TouchableOpacity style={s.socialCircle} activeOpacity={0.7} onPress={handleFacebookLogin} accessibilityLabel="Continue with Facebook" accessibilityRole="button">
            <Image source={require('../../assets/facebook-logo.png')} style={s.socialLogo} />
          </TouchableOpacity>
          <TouchableOpacity style={s.socialCircle} activeOpacity={0.7} onPress={handleGoogleLogin} accessibilityLabel="Continue with Google" accessibilityRole="button">
            <Image source={require('../../assets/google-logo.png')} style={s.socialLogo} />
          </TouchableOpacity>
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={s.socialCircle} activeOpacity={0.7} onPress={handleAppleLogin} accessibilityLabel="Continue with Apple" accessibilityRole="button">
              <Image source={require('../../assets/apple-logo.png')} style={s.socialLogo} />
            </TouchableOpacity>
          )}
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
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
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
  socialLogo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
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
