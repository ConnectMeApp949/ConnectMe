import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts } from '../../theme';
import { ChevronLeftIcon, AlertCircleIcon, XIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'Privacy'>;

export default function PrivacyScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [showProfile, setShowProfile] = useState(true);
  const [dataImprove, setDataImprove] = useState(true);
  const [shareHistory, setShareHistory] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0); // 0=hidden, 1=first confirm, 2=final confirm

  const handleDownloadData = () => {
    Alert.alert(
      'Download My Data',
      'We\'ll prepare a copy of your personal data including your profile info, booking history, reviews, and messages.\n\nA download link will be sent to your email within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Download',
          onPress: () => {
            setDownloadLoading(true);
            setTimeout(() => {
              setDownloadLoading(false);
              Alert.alert('Request Submitted', 'You\'ll receive an email with a link to download your data within 24 hours. The link will expire after 7 days.');
            }, 1500);
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    setDeleteStep(1);
  };

  const handleDeleteConfirm = () => {
    setDeleteStep(2);
  };

  const handleDeleteFinal = () => {
    setDeleteStep(0);
    Alert.alert(
      'Account Deleted',
      'Your account has been scheduled for deletion. All your data will be permanently removed within 30 days.\n\nIf you change your mind, contact support within 14 days to recover your account.',
      [{ text: 'OK', onPress: () => logout() }],
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={s.headerTitle}>Privacy</Text>
        <View style={s.backBtn} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={s.intro}>ConnectMe takes your privacy seriously. You can control how your information is used and shared below.</Text>

        <Text style={s.sectionTitle}>Data and Visibility</Text>
        {[
          { label: 'Show Profile to Vendors', desc: 'Allow vendors to see your profile when browsing', value: showProfile, set: setShowProfile },
          { label: 'Improve Services', desc: 'Allow ConnectMe to use your data to improve services', value: dataImprove, set: setDataImprove },
          { label: 'Share Booking History', desc: 'Share your booking history with vendors', value: shareHistory, set: setShareHistory },
          { label: 'Location Services', desc: 'Allow access to your location for nearby vendors', value: locationServices, set: setLocationServices },
        ].map(item => (
          <View key={item.label} style={s.toggleRow}>
            <View style={s.toggleLeft}><Text style={s.toggleLabel}>{item.label}</Text><Text style={s.toggleDesc}>{item.desc}</Text></View>
            <Switch value={item.value} onValueChange={item.set} trackColor={{ true: colors.primary }} accessibilityLabel={item.label} accessibilityRole="switch" />
          </View>
        ))}

        <Text style={[s.sectionTitle, { marginTop: 24 }]}>Account Data</Text>
        <TouchableOpacity style={s.row} activeOpacity={0.6} onPress={handleDownloadData} accessibilityLabel="Download My Data" accessibilityRole="button" accessibilityHint="Request a copy of your personal data">
          <Text style={s.rowLabel}>Download My Data</Text>
          {downloadLoading ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={s.chevron}>›</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.row} activeOpacity={0.6} onPress={handleDeleteAccount} accessibilityLabel="Delete My Account" accessibilityRole="button" accessibilityHint="Permanently delete your account and all data">
          <Text style={[s.rowLabel, { color: colors.error }]}>Delete My Account</Text>
          <Text style={[s.chevron, { color: colors.error }]}>›</Text>
        </TouchableOpacity>

        <Text style={[s.sectionTitle, { marginTop: 24 }]}>Legal Links</Text>
        <TouchableOpacity style={s.row} activeOpacity={0.6} onPress={() => navigation.navigate('LegalDoc', { doc: 'Privacy Policy' })} accessibilityLabel="Privacy Policy" accessibilityRole="link"><Text style={s.rowLabel}>Privacy Policy</Text><Text style={s.chevron}>›</Text></TouchableOpacity>
        <TouchableOpacity style={s.row} activeOpacity={0.6} onPress={() => navigation.navigate('LegalDoc', { doc: 'Terms of Service' })} accessibilityLabel="Terms of Service" accessibilityRole="link"><Text style={s.rowLabel}>Terms of Service</Text><Text style={s.chevron}>›</Text></TouchableOpacity>
      </ScrollView>

      {/* Delete Account Modal — Airbnb/Thumbtack style multi-step confirmation */}
      <Modal visible={deleteStep > 0} animationType="slide" presentationStyle="pageSheet" accessibilityViewIsModal={true}>
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setDeleteStep(0)} activeOpacity={0.6} accessibilityLabel="Cancel" accessibilityRole="button"><Text style={s.modalClose}>Cancel</Text></TouchableOpacity>
          </View>

          {deleteStep === 1 && (
            <View style={s.modalContent}>
              <View style={s.deleteIconWrap}>
                <AlertCircleIcon size={36} color={colors.error} />
              </View>
              <Text style={s.deleteTitle}>Delete your account?</Text>
              <Text style={s.deleteDesc}>Before you go, here's what will happen:</Text>

              <View style={s.deleteList}>
                <View style={s.deleteItem}>
                  <Text style={s.deleteBullet}>•</Text>
                  <Text style={s.deleteItemText}>Your profile, photos, and bio will be permanently removed</Text>
                </View>
                <View style={s.deleteItem}>
                  <Text style={s.deleteBullet}>•</Text>
                  <Text style={s.deleteItemText}>All your reviews (given and received) will be deleted</Text>
                </View>
                <View style={s.deleteItem}>
                  <Text style={s.deleteBullet}>•</Text>
                  <Text style={s.deleteItemText}>Any upcoming bookings will be automatically cancelled</Text>
                </View>
                <View style={s.deleteItem}>
                  <Text style={s.deleteBullet}>•</Text>
                  <Text style={s.deleteItemText}>Your message history will be erased</Text>
                </View>
                <View style={s.deleteItem}>
                  <Text style={s.deleteBullet}>•</Text>
                  <Text style={s.deleteItemText}>If you're a vendor, your listing will be removed from search</Text>
                </View>
              </View>

              <Text style={s.deleteNote}>You have 14 days to contact support to recover your account after deletion.</Text>

              <TouchableOpacity style={s.deleteBtn} activeOpacity={0.7} onPress={handleDeleteConfirm} accessibilityLabel="Continue with account deletion" accessibilityRole="button">
                <Text style={s.deleteBtnText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.keepBtn} activeOpacity={0.7} onPress={() => setDeleteStep(0)} accessibilityLabel="Keep my account" accessibilityRole="button">
                <Text style={s.keepBtnText}>Keep my account</Text>
              </TouchableOpacity>
            </View>
          )}

          {deleteStep === 2 && (
            <View style={s.modalContent}>
              <View style={s.deleteIconWrap}>
                <XIcon size={36} color={colors.error} />
              </View>
              <Text style={s.deleteTitle}>Are you sure?</Text>
              <Text style={s.deleteDesc}>This action cannot be undone. All your data will be permanently deleted within 30 days.</Text>

              <View style={s.finalCard}>
                <Text style={s.finalCardTitle}>What we'll delete:</Text>
                <Text style={s.finalCardText}>Profile · Bookings · Reviews · Messages · Payment info · Saved vendors</Text>
              </View>

              <TouchableOpacity style={s.deleteFinalBtn} activeOpacity={0.7} onPress={handleDeleteFinal} accessibilityLabel="Yes, delete my account" accessibilityRole="button" accessibilityHint="This action cannot be undone">
                <Text style={s.deleteBtnText}>Yes, delete my account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.keepBtn} activeOpacity={0.7} onPress={() => setDeleteStep(0)} accessibilityLabel="Go back" accessibilityRole="button">
                <Text style={s.keepBtnText}>Go back</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
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
  intro: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 24 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  toggleLeft: { flex: 1, marginRight: 16 },
  toggleLabel: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  toggleDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 52, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  chevron: { fontSize: 22, color: colors.textMuted },
  modalContainer: { flex: 1, backgroundColor: colors.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalClose: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.primary },
  modalContent: { flex: 1, padding: 24, alignItems: 'center' },
  deleteIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 16, marginTop: 20 },
  deleteTitle: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 8, textAlign: 'center' },
  deleteDesc: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  deleteList: { alignSelf: 'stretch', marginBottom: 20 },
  deleteItem: { flexDirection: 'row', paddingVertical: 6 },
  deleteBullet: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, width: 20 },
  deleteItemText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, flex: 1, lineHeight: 22 },
  deleteNote: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 32, paddingHorizontal: 10, lineHeight: 19 },
  deleteBtn: { alignSelf: 'stretch', backgroundColor: colors.error, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  deleteFinalBtn: { alignSelf: 'stretch', backgroundColor: colors.error, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12, marginTop: 12 },
  deleteBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
  keepBtn: { alignSelf: 'stretch', paddingVertical: 16, alignItems: 'center' },
  keepBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.primary },
  finalCard: { alignSelf: 'stretch', backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FECACA', marginBottom: 8 },
  finalCardTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.error, marginBottom: 6 },
  finalCardText: { fontFamily: fonts.regular, fontSize: 14, color: '#991B1B', lineHeight: 20 },
});
