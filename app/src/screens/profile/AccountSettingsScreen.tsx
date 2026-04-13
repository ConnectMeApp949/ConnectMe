import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
  TextInput, Image, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from '../../components/Icons';
import {
  isBiometricAvailable,
  getBiometricType,
  getBiometricPreference,
  saveBiometricPreference,
  saveCredentials,
  clearBiometricData,
} from '../../util/biometrics';

type Props = NativeStackScreenProps<any, 'AccountSettings'>;

export default function AccountSettingsScreen({ navigation }: Props) {
  const auth = useAuth();
  const { isDark, toggleTheme, colors: themeColors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [twoFactor, setTwoFactor] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  // Edit modals
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState(auth.user?.firstName ?? '');
  const [editLastName, setEditLastName] = useState(auth.user?.lastName ?? '');

  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [editEmail, setEditEmail] = useState(auth.user?.email ?? '');

  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [editPhone, setEditPhone] = useState(auth.user?.phone ?? '');

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [connectedModalVisible, setConnectedModalVisible] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [appleConnected, setAppleConnected] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);

  // Biometric state
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    async function checkBiometrics() {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);
      if (available) {
        const type = await getBiometricType();
        setBiometricType(type);
        const pref = await getBiometricPreference();
        setBiometricEnabled(pref);
      }
    }
    checkBiometrics();
  }, []);

  async function handleBiometricToggle(value: boolean) {
    setBiometricEnabled(value);
    await saveBiometricPreference(value);

    if (value) {
      // Save current credentials so biometric login can restore the session
      if (auth.user?.email && auth.token) {
        await saveCredentials(auth.user.email, auth.token);
      }
      Alert.alert(
        `${biometricType} Enabled`,
        `You can now use ${biometricType} to log in to ConnectMe.`,
      );
    } else {
      await clearBiometricData();
      Alert.alert(
        'Biometric Login Disabled',
        'Your saved login credentials have been removed.',
      );
    }
  }

  // Profile photo state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(auth.user?.profilePhoto ?? null);

  function handleSaveName() {
    auth.login({ ...auth.user, firstName: editFirstName, lastName: editLastName }, auth.token!);
    setNameModalVisible(false);
    Alert.alert('Updated', 'Your name has been updated.');
  }

  function handleSaveEmail() {
    if (!editEmail.trim() || !editEmail.includes('@')) {
      Alert.alert('Invalid', 'Please enter a valid email address.');
      return;
    }
    auth.login({ ...auth.user, email: editEmail.trim() }, auth.token!);
    setEmailModalVisible(false);
    Alert.alert('Updated', 'Your email has been updated.');
  }

  function handleSavePhone() {
    auth.login({ ...auth.user, phone: editPhone.trim() }, auth.token!);
    setPhoneModalVisible(false);
    Alert.alert('Updated', 'Your phone number has been updated.');
  }

  async function handleChangePassword() {
    if (!currentPassword) {
      Alert.alert('Required', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Too Short', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
      const res = await fetch(API_URL + '/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth.token ? { 'Authorization': 'Bearer ' + auth.token } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to change password');
      Alert.alert('Success', 'Your password has been updated.');
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unable to change password. Please try again.');
    }
  }

  async function handlePickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfilePhoto(uri);
      // Upload to API
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
        const formData = new FormData();
        formData.append('photo', { uri, type: 'image/jpeg', name: 'profile.jpg' } as any);
        await fetch(API_URL + '/auth/upload-profile-photo', {
          method: 'POST',
          headers: {
            ...(auth.token ? { 'Authorization': 'Bearer ' + auth.token } : {}),
          },
          body: formData,
        });
      } catch {
        // Photo saved locally, will sync when online
      }
      auth.login({ ...auth.user, profilePhoto: uri }, auth.token!);
      Alert.alert('Updated', 'Your profile photo has been updated.');
    }
  }

  function Row({ label, right, onPress }: { label: string; right?: React.ReactNode; onPress?: () => void }) {
    return (
      <TouchableOpacity style={[s.row, { borderBottomColor: themeColors.border }]} onPress={onPress} activeOpacity={onPress ? 0.6 : 1} disabled={!onPress} accessibilityLabel={label} accessibilityRole="button">
        <Text style={[s.rowLabel, { color: themeColors.text }]}>{label}</Text>
        {right ?? <ChevronRightIcon size={18} color={themeColors.textSecondary} strokeWidth={1.5} />}
      </TouchableOpacity>
    );
  }

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return <View style={s.section}><Text style={[s.sectionTitle, { color: themeColors.textSecondary }]}>{title}</Text>{children}</View>;
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Account Settings</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Section title="PROFILE">
          <Row
            label="Edit Name"
            right={
              <View style={s.rowRight}>
                <Text style={[s.rowRightText, { color: themeColors.textSecondary }]}>{auth.user?.firstName} {auth.user?.lastName}</Text>
                <ChevronRightIcon size={18} color={colors.textMuted} strokeWidth={1.5} />
              </View>
            }
            onPress={() => {
              setEditFirstName(auth.user?.firstName ?? '');
              setEditLastName(auth.user?.lastName ?? '');
              setNameModalVisible(true);
            }}
          />
          <Row
            label="Edit Profile Photo"
            right={
              <View style={s.rowRight}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={s.miniAvatar} accessibilityLabel="Profile photo" accessibilityRole="image" />
                ) : (
                  <View style={s.miniAvatarFallback}>
                    <Text style={s.miniAvatarText}>{auth.user?.firstName?.[0] ?? 'U'}</Text>
                  </View>
                )}
                <ChevronRightIcon size={18} color={colors.textMuted} strokeWidth={1.5} />
              </View>
            }
            onPress={handlePickPhoto}
          />
        </Section>

        <Section title="CONTACT">
          <Row
            label="Email Address"
            right={<View style={s.rowRight}><Text style={[s.rowRightText, { color: themeColors.textSecondary }]}>{auth.user?.email ?? ''}</Text><ChevronRightIcon size={18} color={colors.textMuted} strokeWidth={1.5} /></View>}
            onPress={() => { setEditEmail(auth.user?.email ?? ''); setEmailModalVisible(true); }}
          />
          <Row
            label="Phone Number"
            right={<View style={s.rowRight}><Text style={[s.rowRightText, { color: themeColors.textSecondary }]}>{auth.user?.phone ?? 'Not set'}</Text><ChevronRightIcon size={18} color={colors.textMuted} strokeWidth={1.5} /></View>}
            onPress={() => { setEditPhone(auth.user?.phone ?? ''); setPhoneModalVisible(true); }}
          />
        </Section>

        <Section title="SECURITY">
          <Row label="Change Password" onPress={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordModalVisible(true); }} />
          {biometricAvailable && (
            <Row
              label={`Biometric Login (${biometricType})`}
              right={
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ true: colors.primary }}
                  accessibilityLabel={`${biometricType} login toggle`}
                  accessibilityRole="switch"
                  accessibilityHint={`Double tap to ${biometricEnabled ? 'disable' : 'enable'} ${biometricType} login`}
                />
              }
            />
          )}
          <Row label="Two-Factor Authentication" right={<Switch value={twoFactor} onValueChange={setTwoFactor} trackColor={{ true: colors.primary }} accessibilityLabel="Two-Factor Authentication" accessibilityRole="switch" />} />
          <Row label="Connected Accounts" onPress={() => setConnectedModalVisible(true)} />
        </Section>

        <Section title="APPEARANCE">
          <Row label={t('darkMode')} right={<Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: colors.primary }} accessibilityLabel={t('darkMode')} accessibilityRole="switch" />} />
          <Row
            label={t('language')}
            right={
              <View style={s.rowRight}>
                <Text style={[s.rowRightText, { color: themeColors.textSecondary }]}>{language === 'en' ? 'English' : 'Español'}</Text>
                <ChevronRightIcon size={18} color={colors.textMuted} strokeWidth={1.5} />
              </View>
            }
            onPress={() => {
              Alert.alert(
                t('language'),
                '',
                [
                  { text: 'English', onPress: () => setLanguage('en') },
                  { text: 'Español', onPress: () => setLanguage('es') },
                  { text: t('cancel'), style: 'cancel' },
                ],
              );
            }}
          />
        </Section>

        <Section title="NOTIFICATIONS">
          <Row label="Push Notifications" right={<Switch value={pushNotif} onValueChange={setPushNotif} trackColor={{ true: colors.primary }} accessibilityLabel="Push Notifications" accessibilityRole="switch" />} />
          <Row label="Email Notifications" right={<Switch value={emailNotif} onValueChange={setEmailNotif} trackColor={{ true: colors.primary }} accessibilityLabel="Email Notifications" accessibilityRole="switch" />} />
          <Row label="SMS Notifications" right={<Switch value={smsNotif} onValueChange={setSmsNotif} trackColor={{ true: colors.primary }} accessibilityLabel="SMS Notifications" accessibilityRole="switch" />} />
        </Section>

        <Section title="PAYMENTS">
          <Row label="Payment Methods" onPress={() => navigation.navigate('PaymentMethods')} />
          <Row label="Payout Preferences" onPress={() => navigation.navigate('PayoutPreferences')} />
        </Section>

        <Section title="ACCOUNT">
          <TouchableOpacity
            style={s.deleteAccountBtn}
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This action is permanent and cannot be undone.\n\nAll your data, bookings, reviews, and messages will be permanently removed within 30 days.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete My Account',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
                        await fetch(API_URL + '/auth/delete-account', {
                          method: 'DELETE',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(auth.token ? { 'Authorization': 'Bearer ' + auth.token } : {}),
                          },
                        });
                      } catch {}
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been scheduled for deletion. All your data will be permanently removed within 30 days.\n\nIf you change your mind, contact support@connectmeapp.services within 14 days to recover your account.',
                        [{ text: 'OK', onPress: () => auth.logout() }]
                      );
                    },
                  },
                ]
              );
            }}
            accessibilityLabel="Delete Account"
            accessibilityRole="button"
            accessibilityHint="Permanently delete your account and all data"
          >
            <Text style={s.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        </Section>
      </ScrollView>

      {/* ─── Edit Name Modal ─── */}
      <Modal visible={nameModalVisible} animationType="slide" transparent accessibilityViewIsModal={true}>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: themeColors.cardBackground }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: themeColors.text }]}>Edit Name</Text>
              <TouchableOpacity onPress={() => setNameModalVisible(false)} accessibilityLabel="Close" accessibilityRole="button">
                <XIcon size={18} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={[s.inputLabel, { color: themeColors.text }]}>First name</Text>
            <TextInput
              style={[s.input, { color: themeColors.text, backgroundColor: themeColors.background, borderColor: themeColors.border }]}
              value={editFirstName}
              onChangeText={setEditFirstName}
              placeholder="First name"
              placeholderTextColor={colors.textMuted}
              autoFocus
              accessibilityLabel="First name"
              accessibilityRole="text"
            />

            <Text style={[s.inputLabel, { color: themeColors.text }]}>Last name</Text>
            <TextInput
              style={[s.input, { color: themeColors.text, backgroundColor: themeColors.background, borderColor: themeColors.border }]}
              value={editLastName}
              onChangeText={setEditLastName}
              placeholder="Last name"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Last name"
              accessibilityRole="text"
            />

            <TouchableOpacity
              style={[s.saveBtn, (!editFirstName.trim() || !editLastName.trim()) && s.saveBtnDisabled]}
              onPress={handleSaveName}
              disabled={!editFirstName.trim() || !editLastName.trim()}
              activeOpacity={0.7}
              accessibilityLabel="Save name"
              accessibilityRole="button"
            >
              <Text style={s.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Edit Email Modal ─── */}
      <Modal visible={emailModalVisible} animationType="slide" transparent accessibilityViewIsModal={true}>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: themeColors.cardBackground }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: themeColors.text }]}>Edit Email</Text>
              <TouchableOpacity onPress={() => setEmailModalVisible(false)} accessibilityLabel="Close" accessibilityRole="button">
                <XIcon size={18} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={[s.inputLabel, { color: themeColors.text }]}>Email address</Text>
            <TextInput
              style={[s.input, { color: themeColors.text, backgroundColor: themeColors.background, borderColor: themeColors.border }]}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
              accessibilityLabel="Email address"
              accessibilityRole="text"
            />

            <TouchableOpacity
              style={[s.saveBtn, !editEmail.trim() && s.saveBtnDisabled]}
              onPress={handleSaveEmail}
              disabled={!editEmail.trim()}
              activeOpacity={0.7}
              accessibilityLabel="Save email"
              accessibilityRole="button"
            >
              <Text style={s.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Change Password Modal ─── */}
      <Modal visible={passwordModalVisible} animationType="slide" transparent accessibilityViewIsModal={true}>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: themeColors.cardBackground }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: themeColors.text }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)} accessibilityLabel="Close" accessibilityRole="button">
                <XIcon size={18} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={[s.inputLabel, { color: themeColors.text }]}>Current password</Text>
            <TextInput
              style={[s.input, { color: themeColors.text, backgroundColor: themeColors.background, borderColor: themeColors.border }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoFocus
              accessibilityLabel="Current password"
              accessibilityRole="text"
            />

            <Text style={[s.inputLabel, { color: themeColors.text }]}>New password</Text>
            <TextInput
              style={[s.input, { color: themeColors.text, backgroundColor: themeColors.background, borderColor: themeColors.border }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              accessibilityLabel="New password"
              accessibilityRole="text"
            />

            <Text style={[s.inputLabel, { color: themeColors.text }]}>Confirm new password</Text>
            <TextInput
              style={[s.input, { color: themeColors.text, backgroundColor: themeColors.background, borderColor: themeColors.border }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              accessibilityLabel="Confirm new password"
              accessibilityRole="text"
            />

            <TouchableOpacity
              style={[s.saveBtn, (!currentPassword || !newPassword || !confirmPassword) && s.saveBtnDisabled]}
              onPress={handleChangePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword}
              activeOpacity={0.7}
              accessibilityLabel="Update Password"
              accessibilityRole="button"
            >
              <Text style={s.saveBtnText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Connected Accounts Modal ─── */}
      <Modal visible={connectedModalVisible} animationType="slide" transparent accessibilityViewIsModal={true}>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: themeColors.cardBackground }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: themeColors.text }]}>Connected Accounts</Text>
              <TouchableOpacity onPress={() => setConnectedModalVisible(false)} accessibilityLabel="Close" accessibilityRole="button">
                <XIcon size={18} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={[s.connectedSub, { color: themeColors.textSecondary }]}>Link your accounts for faster sign-in</Text>

            <View style={s.connectedRow}>
              <View style={s.connectedLeft}>
                <Image source={require('../../assets/google-logo.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
                <View>
                  <Text style={[s.connectedLabel, { color: themeColors.text }]}>Google</Text>
                  <Text style={[s.connectedStatus, { color: themeColors.textSecondary }]}>{googleConnected ? 'Connected' : 'Not connected'}</Text>
                </View>
              </View>
              <Switch value={googleConnected} onValueChange={setGoogleConnected} trackColor={{ true: colors.primary }} accessibilityLabel="Connect Google account" accessibilityRole="switch" />
            </View>

            <View style={s.connectedRow}>
              <View style={s.connectedLeft}>
                <Image source={require('../../assets/apple-logo.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
                <View>
                  <Text style={[s.connectedLabel, { color: themeColors.text }]}>Apple</Text>
                  <Text style={[s.connectedStatus, { color: themeColors.textSecondary }]}>{appleConnected ? 'Connected' : 'Not connected'}</Text>
                </View>
              </View>
              <Switch value={appleConnected} onValueChange={setAppleConnected} trackColor={{ true: colors.primary }} accessibilityLabel="Connect Apple account" accessibilityRole="switch" />
            </View>

            <View style={s.connectedRow}>
              <View style={s.connectedLeft}>
                <Image source={require('../../assets/facebook-logo.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
                <View>
                  <Text style={[s.connectedLabel, { color: themeColors.text }]}>Facebook</Text>
                  <Text style={[s.connectedStatus, { color: themeColors.textSecondary }]}>{facebookConnected ? 'Connected' : 'Not connected'}</Text>
                </View>
              </View>
              <Switch value={facebookConnected} onValueChange={setFacebookConnected} trackColor={{ true: colors.primary }} accessibilityLabel="Connect Facebook account" accessibilityRole="switch" />
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Edit Phone Modal ─── */}
      <Modal visible={phoneModalVisible} animationType="slide" transparent accessibilityViewIsModal={true}>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: themeColors.cardBackground }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: themeColors.text }]}>Edit Phone Number</Text>
              <TouchableOpacity onPress={() => setPhoneModalVisible(false)} accessibilityLabel="Close" accessibilityRole="button">
                <XIcon size={18} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={[s.inputLabel, { color: themeColors.text }]}>Phone number</Text>
            <TextInput
              style={[s.input, { color: themeColors.text, backgroundColor: themeColors.background, borderColor: themeColors.border }]}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="(555) 555-5555"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              autoFocus
              accessibilityLabel="Phone number"
              accessibilityRole="text"
            />

            <TouchableOpacity
              style={[s.saveBtn, !editPhone.trim() && s.saveBtnDisabled]}
              onPress={handleSavePhone}
              disabled={!editPhone.trim()}
              activeOpacity={0.7}
              accessibilityLabel="Save phone number"
              accessibilityRole="button"
            >
              <Text style={s.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textMuted, letterSpacing: 1, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 52, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowRightText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  deleteAccountBtn: { paddingVertical: 16, alignItems: 'center' },
  deleteAccountText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.error },
  chevron: { fontSize: 22, color: colors.textMuted },
  miniAvatar: { width: 28, height: 28, borderRadius: 14 },
  miniAvatarFallback: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { fontFamily: fonts.bold, fontSize: 12, color: colors.white },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  modalClose: { fontSize: 20, color: colors.textMuted, padding: 4 },
  inputLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginBottom: 6, marginTop: 12 },
  input: {
    fontFamily: fonts.regular, fontSize: 16, color: colors.text,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md,
    paddingHorizontal: 16, height: 48, backgroundColor: colors.cardBackground,
  },
  saveBtn: { marginTop: 24, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
  connectedSub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginBottom: 20 },
  connectedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  connectedLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  connectedLogo: { width: 28, height: 28, borderRadius: 6 },
  connectedLogoFallback: { backgroundColor: colors.cardBackground, alignItems: 'center' as const, justifyContent: 'center' as const, borderWidth: 1, borderColor: colors.border },
  connectedLogoFallbackText: { fontFamily: fonts.bold, fontSize: 16 },
  connectedLabel: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  connectedStatus: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 1 },
});
