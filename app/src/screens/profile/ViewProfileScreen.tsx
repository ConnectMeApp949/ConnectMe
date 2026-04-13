import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, StarIcon, XIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'ViewProfile'>;

const MAX_BIO = 500;

export default function ViewProfileScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const auth = useAuth();
  const user = auth.user;
  const firstName = user?.firstName ?? 'User';
  const lastName = user?.lastName ?? '';

  const [bio, setBio] = useState(user?.bio ?? '');
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [editBio, setEditBio] = useState('');

  async function handleEditPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      auth.login({ ...auth.user, profilePhoto: uri }, auth.token!);
      Alert.alert('Updated', 'Your profile photo has been updated.');
    }
  }

  function handleSaveBio() {
    setBio(editBio.trim());
    auth.login({ ...auth.user, bio: editBio.trim() }, auth.token!);
    setBioModalVisible(false);
    Alert.alert('Updated', 'Your bio has been updated.');
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>My Profile</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}>
        {/* Avatar */}
        <View style={s.avatarSection}>
          {auth.user?.profilePhoto ? (
            <Image source={{ uri: auth.user.profilePhoto }} style={s.avatar} accessibilityLabel={`${firstName} ${lastName} profile photo`} accessibilityRole="image" />
          ) : (
            <View style={s.avatarFb}>
              <Text style={s.avatarText}>{firstName[0]}{lastName?.[0]}</Text>
            </View>
          )}
          <TouchableOpacity onPress={handleEditPhoto} activeOpacity={0.6} accessibilityLabel="Edit Photo" accessibilityRole="button" accessibilityHint="Choose a new profile photo">
            <Text style={[s.editPhotoLink, { color: themeColors.primary }]}>Edit Photo</Text>
          </TouchableOpacity>
        </View>

        <Text style={[s.fullName, { color: themeColors.text }]}>{firstName} {lastName}</Text>
        <Text style={[s.memberSince, { color: themeColors.textMuted }]}>
          {user?.createdAt
            ? `Member since ${new Date(user.createdAt).getFullYear()}`
            : 'Member'}
        </Text>

        {/* Stats */}
        <View style={[s.statsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={s.statCol}><Text style={[s.statNum, { color: themeColors.text }]}>{user?.bookingCount ?? 0}</Text><Text style={[s.statLabel, { color: themeColors.textMuted }]}>Bookings</Text></View>
          <View style={[s.statDiv, { backgroundColor: themeColors.border }]} />
          <View style={s.statCol}><Text style={[s.statNum, { color: themeColors.text }]}>{user?.reviewCount ?? 0}</Text><Text style={[s.statLabel, { color: themeColors.textMuted }]}>Reviews</Text></View>
          <View style={[s.statDiv, { backgroundColor: themeColors.border }]} />
          <View style={s.statCol}><Text style={[s.statNum, { color: themeColors.text }]}>{user?.memberYears ?? '<1'}</Text><Text style={[s.statLabel, { color: themeColors.textMuted }]}>{'Years on\nConnectMe'}</Text></View>
        </View>

        {/* About */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: themeColors.text }]}>About</Text>
            <TouchableOpacity onPress={() => { setEditBio(bio); setBioModalVisible(true); }} activeOpacity={0.6} accessibilityLabel="Edit bio" accessibilityRole="button">
              <Text style={[s.editLink, { color: themeColors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={[s.bioText, { color: themeColors.textSecondary }]}>
            {bio || 'No bio added yet. Tell vendors about yourself and the types of events you love planning!'}
          </Text>
        </View>

        {/* Reviews */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: themeColors.text }]}>Reviews</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyReviews')} activeOpacity={0.6} accessibilityLabel="See all reviews" accessibilityRole="button">
              <Text style={[s.editLink, { color: themeColors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={s.reviewSummary}>
            <Text style={[s.reviewBigNum, { color: themeColors.text }]}>4.8</Text>
            <View style={{ flexDirection: 'row' }}>{[1,2,3,4,5].map(i => <StarIcon key={i} size={16} color={colors.star} />)}</View>
            <Text style={[s.reviewCount, { color: themeColors.textMuted }]}>2 reviews</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {[1, 2].map(i => (
              <TouchableOpacity key={i} style={[s.reviewCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]} activeOpacity={0.7} onPress={() => navigation.navigate('MyReviews')} accessibilityLabel={`Review from Vendor ${i}`} accessibilityRole="button" accessibilityHint="View full review details">
                <View style={s.reviewCardHeader}>
                  <View style={s.reviewerAvatar}><Text style={{ color: '#fff', fontWeight: '700' }}>V</Text></View>
                  <View><Text style={[s.reviewerName, { color: themeColors.text }]}>Vendor {i}</Text><View style={{ flexDirection: 'row' }}>{[1,2,3,4,5].map(i => <StarIcon key={i} size={12} color={colors.star} />)}</View></View>
                </View>
                <Text style={[s.reviewText, { color: themeColors.textSecondary }]} numberOfLines={2}>Great client to work with! Very organized and communicative throughout the process.</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* ─── Edit Bio Modal ─── */}
      <Modal visible={bioModalVisible} animationType="slide" transparent accessibilityViewIsModal={true}>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: themeColors.card }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: themeColors.text }]}>Edit About</Text>
              <TouchableOpacity onPress={() => setBioModalVisible(false)} accessibilityLabel="Close" accessibilityRole="button">
                <XIcon size={18} color={themeColors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={[s.modalSub, { color: themeColors.textMuted }]}>
              Tell vendors about yourself — what types of events you enjoy, your planning style, or anything else you'd like them to know.
            </Text>

            <View style={[s.bioInputWrapper, { borderColor: themeColors.border, backgroundColor: themeColors.background }]}>
              <TextInput
                style={[s.bioInput, { color: themeColors.text }]}
                value={editBio}
                onChangeText={(t) => t.length <= MAX_BIO && setEditBio(t)}
                placeholder="Write something about yourself..."
                placeholderTextColor={themeColors.textMuted}
                multiline
                textAlignVertical="top"
                maxLength={MAX_BIO}
                autoFocus
                accessibilityLabel="Bio"
                accessibilityRole="text"
                accessibilityHint="Write something about yourself"
              />
            </View>
            <Text style={[s.bioCounter, { color: themeColors.textMuted }, editBio.length >= MAX_BIO && s.bioCounterMax]}>
              {editBio.length}/{MAX_BIO}
            </Text>

            <TouchableOpacity
              style={s.saveBtn}
              onPress={handleSaveBio}
              activeOpacity={0.7}
              accessibilityLabel="Save bio"
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

  avatarSection: { alignItems: 'center', marginTop: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: colors.border },
  avatarFb: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 34, color: colors.white },
  editPhotoLink: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary, marginTop: 8 },
  fullName: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, textAlign: 'center', marginTop: 12 },
  memberSince: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 20 },

  statsCard: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 12, paddingVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)', marginBottom: 24 },
  statCol: { flex: 1, alignItems: 'center' },
  statNum: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  statDiv: { width: 1, height: 36, backgroundColor: colors.border, alignSelf: 'center' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  editLink: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary },
  bioText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, lineHeight: 22 },

  reviewSummary: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewBigNum: { fontFamily: fonts.bold, fontSize: 28, color: colors.text },
  reviewStars: { fontSize: 16, color: colors.star },
  reviewCount: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  reviewStarsSmall: { fontSize: 12, color: colors.star },
  reviewCard: { width: 250, backgroundColor: colors.white, borderRadius: 12, padding: 12, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  reviewCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  reviewerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  reviewerName: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  reviewText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  modalClose: { fontSize: 20, color: colors.textMuted, padding: 4 },
  modalSub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 16 },
  bioInputWrapper: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.cardBackground, minHeight: 150 },
  bioInput: { fontFamily: fonts.regular, fontSize: 16, color: colors.text, padding: 16, minHeight: 150, lineHeight: 24 },
  bioCounter: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, textAlign: 'right', marginTop: 6 },
  bioCounterMax: { color: colors.error },
  saveBtn: { marginTop: 20, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
