import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_PREF_KEY = 'connectme_biometric_enabled';
const CREDENTIALS_EMAIL_KEY = 'connectme_bio_email';
const CREDENTIALS_TOKEN_KEY = 'connectme_bio_token';

/**
 * Check whether the device has biometric hardware and at least one enrolled biometric.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

/**
 * Return a user-friendly label for the biometric type available on the device.
 * Returns 'Face ID', 'Touch ID', 'Fingerprint', or null if unavailable.
 */
export async function getBiometricType(): Promise<string | null> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }
  return null;
}

/**
 * Prompt the user for biometric authentication.
 * Returns true on success, false on failure or cancellation.
 */
export async function authenticateWithBiometrics(
  promptMessage = 'Log in to ConnectMe',
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      fallbackLabel: 'Use Passcode',
    });
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Save the user's biometric login preference.
 */
export async function saveBiometricPreference(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_PREF_KEY, enabled ? 'true' : 'false');
}

/**
 * Read the user's biometric login preference.
 */
export async function getBiometricPreference(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(BIOMETRIC_PREF_KEY);
  return value === 'true';
}

/**
 * Save user credentials to secure storage for biometric auto-login.
 */
export async function saveCredentials(email: string, token: string): Promise<void> {
  await SecureStore.setItemAsync(CREDENTIALS_EMAIL_KEY, email);
  await SecureStore.setItemAsync(CREDENTIALS_TOKEN_KEY, token);
}

/**
 * Retrieve saved credentials from secure storage.
 * Returns null if no credentials are stored.
 */
export async function getSavedCredentials(): Promise<{ email: string; token: string } | null> {
  const email = await SecureStore.getItemAsync(CREDENTIALS_EMAIL_KEY);
  const token = await SecureStore.getItemAsync(CREDENTIALS_TOKEN_KEY);
  if (email && token) {
    return { email, token };
  }
  return null;
}

/**
 * Clear all saved biometric credentials from secure storage.
 */
export async function clearBiometricData(): Promise<void> {
  await SecureStore.deleteItemAsync(BIOMETRIC_PREF_KEY);
  await SecureStore.deleteItemAsync(CREDENTIALS_EMAIL_KEY);
  await SecureStore.deleteItemAsync(CREDENTIALS_TOKEN_KEY);
}
