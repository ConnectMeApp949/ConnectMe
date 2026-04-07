import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, Linking, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
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

// Complete warm-up for web browser auth sessions
WebBrowser.maybeCompleteAuthSession();

const SOCIAL_FALLBACKS: Record<string, { label: string; color: string }> = {
  facebook: { label: 'f', color: '#1877F2' },
  google: { label: 'G', color: '#4285F4' },
  apple: { label: '\uF8FF', color: '#000000' },
};

export default function WelcomeScreen({ navigation }: Props) {
  const auth = useAuth();
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [showBiometricButton, setShowBiometricButton] = useState(false);
  const [socialImgErrors, setSocialImgErrors] = useState<Record<string, boolean>>({});

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

  async function handleFacebookLogin() {
    try {
      // Facebook OAuth via web browser
      // TODO: Replace with your Facebook App ID from developers.facebook.com
      const redirectUri = 'https://auth.expo.io/@connectme/connectme';
      const fbAppId = '951097110641665';
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email,public_profile&response_type=token`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        // Extract access token from URL
        const params = new URLSearchParams(result.url.split('#')[1]);
        const accessToken = params.get('access_token');
        if (accessToken) {
          // TODO: Send token to backend to verify and create/login user
          Alert.alert('Sign In', 'Social sign-in is being set up. Please use email and password to sign in for now.', [{ text: 'OK' }]);
        }
      }
    } catch (error) {
      Alert.alert('Facebook Login', 'Facebook authentication requires a custom build. Configure your Facebook App ID in the code to enable this feature.');
    }
  }

  async function handleGoogleLogin() {
    try {
      // Google OAuth via web browser
      // TODO: Replace with your Google OAuth Client ID from console.cloud.google.com
      const redirectUri = 'https://auth.expo.io/@connectme/connectme';
      const clientId = '528402499661-nktq259d8g6h6trep8nkj37ii6046681.apps.googleusercontent.com';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email%20profile&response_type=token`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const params = new URLSearchParams(result.url.split('#')[1]);
        const accessToken = params.get('access_token');
        if (accessToken) {
          // TODO: Send token to backend to verify and create/login user
          Alert.alert('Sign In', 'Social sign-in is being set up. Please use email and password to sign in for now.', [{ text: 'OK' }]);
        }
      }
    } catch (error) {
      Alert.alert('Google Login', 'Google authentication requires OAuth credentials. Configure your Google Client ID in the code to enable this feature.');
    }
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
      // Use native Apple Authentication if available
      let AppleAuthentication: any = null;
      try { AppleAuthentication = require('expo-apple-authentication'); } catch { /* not installed */ }

      if (AppleAuthentication && AppleAuthentication.isAvailableAsync) {
        const isAvailable = await AppleAuthentication.isAvailableAsync();
        if (isAvailable) {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
          if (credential.identityToken) {
            // TODO: Send credential.identityToken to backend to verify and create/login user
            Alert.alert('Sign In', 'Apple sign-in is being configured. Please use email and password to sign in for now.', [{ text: 'OK' }]);
            return;
          }
        }
      }

      // Fallback: web-based Apple Sign In
      const redirectUri = 'https://auth.expo.io/@connectme/connectme';
      const clientId = 'com.connectmeapp.services';
      const authUrl = 'https://appleid.apple.com/auth/authorize?client_id=' + encodeURIComponent(clientId) + '&redirect_uri=' + encodeURIComponent(redirectUri) + '&scope=name%20email&response_type=code&response_mode=form_post';

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success') {
        Alert.alert('Sign In', 'Apple sign-in is being configured. Please use email and password to sign in for now.', [{ text: 'OK' }]);
      }
    } catch (error: any) {
      // User cancelled or Apple Sign In not available
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert('Apple Sign In', 'Please use email and password to sign in.', [{ text: 'OK' }]);
      }
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

        {/* Social login buttons */}
        <View style={s.socialRow}>
          <TouchableOpacity style={s.socialCircle} activeOpacity={0.7} onPress={handleFacebookLogin} accessibilityLabel="Continue with Facebook" accessibilityRole="button" accessibilityHint="Double tap to sign in with your Facebook account">
            {!socialImgErrors.facebook ? (
              <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' }} style={s.socialCircleIcon} onError={() => setSocialImgErrors(prev => ({ ...prev, facebook: true }))} accessibilityLabel="Facebook logo" accessibilityRole="image" />
            ) : (
              <Text style={[s.socialFallbackText, { color: SOCIAL_FALLBACKS.facebook.color }]} accessibilityLabel="Facebook logo">f</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={s.socialCircle} activeOpacity={0.7} onPress={handleGoogleLogin} accessibilityLabel="Continue with Google" accessibilityRole="button" accessibilityHint="Double tap to sign in with your Google account">
            {!socialImgErrors.google ? (
              <Image source={{ uri: 'https://www.google.com/favicon.ico' }} style={s.socialCircleIcon} onError={() => setSocialImgErrors(prev => ({ ...prev, google: true }))} accessibilityLabel="Google logo" accessibilityRole="image" />
            ) : (
              <Text style={[s.socialFallbackText, { color: SOCIAL_FALLBACKS.google.color }]} accessibilityLabel="Google logo">G</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={s.socialCircle} activeOpacity={0.7} onPress={handleAppleLogin} accessibilityLabel="Continue with Apple" accessibilityRole="button" accessibilityHint="Double tap to sign in with your Apple account">
            {!socialImgErrors.apple ? (
              <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/mac-os.png' }} style={s.socialCircleIcon} onError={() => setSocialImgErrors(prev => ({ ...prev, apple: true }))} accessibilityLabel="Apple logo" accessibilityRole="image" />
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
    backgroundColor: colors.secondary,
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
