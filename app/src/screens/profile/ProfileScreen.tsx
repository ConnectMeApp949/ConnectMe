import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList, Modal, Alert, Linking, Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFeed } from '../../context/FeedContext';
import { SettingsIcon, PlusIcon, GridIcon, ChevronRightIcon, StarIcon, UserIcon, CameraIcon, ImageIcon, ClockIcon, XIcon, MessageIcon, MailIcon, LinkIcon } from '../../components/Icons';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 2;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * 2) / 3;

type Props = NativeStackScreenProps<any, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const auth = useAuth();
  const { colors: themeColors } = useTheme();
  const { posts } = useFeed();
  const user = auth.user;
  const firstName = user?.firstName ?? 'User';
  const lastName = user?.lastName ?? '';
  const city = user?.city ?? '';
  const username = user?.username ?? `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  const bio = user?.bio ?? '';

  const [activeTab, setActiveTab] = useState<'posts' | 'tagged'>('posts');
  const [createMenuVisible, setCreateMenuVisible] = useState(false);
  const [shareSheetVisible, setShareSheetVisible] = useState(false);

  const profileUrl = `https://connectmeapp.services/profile/${username}`;

  async function handleShareProfile() {
    try {
      await Share.share({
        message: `Check out my profile on ConnectMe! ${profileUrl}`,
        url: profileUrl,
      });
    } catch {}
  }

  async function handleCreatePost() {
    setCreateMenuVisible(false);
    navigation.navigate('PostCreation');
  }

  function handleCreateStory() {
    setCreateMenuVisible(false);
    navigation.navigate('StoryCreation');
  }

  async function handleCreateReel() {
    setCreateMenuVisible(false);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission Needed', 'Camera access is required to create reels.'); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['videos'], quality: 0.8, videoMaxDuration: 60 });
    if (!result.canceled) {
      navigation.navigate('PostCreation', { initialImage: result.assets[0].uri, isReel: true });
    }
  }

  async function handleGoLive() {
    setCreateMenuVisible(false);
    Alert.alert('Go Live', 'Live streaming will be available in a future update. Stay tuned!');
  }

  // Real user's own posts only — no demo fallback
  const myPosts = posts.filter((p) => p.userId === user?.id);
  const userPosts = myPosts;

  // Posts where user is actually tagged
  const taggedPosts = posts.filter((p) => p.taggedFriends.some(f => f.toLowerCase().includes(firstName.toLowerCase())));

  const displayPosts = activeTab === 'posts' ? userPosts : taggedPosts;

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
        <View style={styles.signInContainer}>
          <Image
            source={require('../../assets/connectme-logo.png')}
            style={styles.signInLogo}
            resizeMode="contain"
            accessibilityLabel="ConnectMe logo"
            accessibilityRole="image"
          />
          <Text style={[styles.signInTitle, { color: themeColors.text }]}>Your Profile</Text>
          <Text style={[styles.signInSub, { color: themeColors.textSecondary }]}>Sign in to access your profile, bookings, and more</Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.7}
            accessibilityLabel="Sign In"
            accessibilityRole="button"
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ─── Header bar (Instagram-style) ─── */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setCreateMenuVisible(true)}
            activeOpacity={0.7}
            accessibilityLabel="Create new content"
            accessibilityRole="button"
          >
            <PlusIcon size={28} color={themeColors.text} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('SettingsActivity')}
              activeOpacity={0.7}
              accessibilityLabel="Settings and activity"
              accessibilityRole="button"
            >
              <SettingsIcon size={26} color={themeColors.text} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Profile section (avatar + stats) ─── */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            {user?.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.avatar} accessibilityLabel={`${firstName} ${lastName} profile photo`} accessibilityRole="image" />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarInitials}>{firstName[0]}{lastName?.[0] ?? ''}</Text>
              </View>
            )}
          </View>
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCol} activeOpacity={0.7}>
              <Text style={[styles.statNumber, { color: themeColors.text }]}>{userPosts.length}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCol} activeOpacity={0.7} onPress={() => navigation.navigate('Connections', { tab: 'followers' })}>
              <Text style={[styles.statNumber, { color: themeColors.text }]}>{user?.followersCount ?? 0}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCol} activeOpacity={0.7} onPress={() => navigation.navigate('Connections', { tab: 'following' })}>
              <Text style={[styles.statNumber, { color: themeColors.text }]}>{user?.followingCount ?? 0}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Name & Bio ─── */}
        <View style={styles.bioSection}>
          <Text style={[styles.fullName, { color: themeColors.text }]}>{firstName} {lastName}</Text>
          {bio !== '' && <Text style={[styles.bioText, { color: themeColors.text }]}>{bio}</Text>}
          {city !== '' && <Text style={[styles.cityText, { color: themeColors.textSecondary }]}>{city}</Text>}
        </View>

        {/* ─── Action buttons ─── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
            onPress={() => navigation.navigate('AccountSettings')}
            activeOpacity={0.7}
            accessibilityLabel="Edit Profile"
            accessibilityRole="button"
          >
            <Text style={[styles.actionBtnText, { color: themeColors.text }]}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
            onPress={handleShareProfile}
            activeOpacity={0.7}
            accessibilityLabel="Share Profile"
            accessibilityRole="button"
          >
            <Text style={[styles.actionBtnText, { color: themeColors.text }]}>Share Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Recent reviews ─── */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.reviewsTitle, { color: themeColors.text }]}>Reviews</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyReviews')} activeOpacity={0.6}>
              <Text style={[styles.reviewsSeeAll, { color: themeColors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.reviewCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]} activeOpacity={0.7} onPress={() => navigation.navigate('MyReviews')}>
            <Text style={[styles.reviewText, { color: themeColors.textSecondary }]}>Reviews you leave for vendors will appear here</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Posts tab bar ─── */}
        <View style={[styles.tabBar, { borderBottomColor: themeColors.border, borderTopColor: themeColors.border }]}>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'posts' && styles.tabItemActive, activeTab === 'posts' && { borderBottomColor: themeColors.text }]} onPress={() => setActiveTab('posts')} activeOpacity={0.7}
            accessibilityLabel="My Posts" accessibilityRole="tab" accessibilityState={{ selected: activeTab === 'posts' }}>
            <ImageIcon size={22} color={activeTab === 'posts' ? themeColors.text : themeColors.textMuted} strokeWidth={1.5} />
            <Text style={[styles.tabLabel, { color: activeTab === 'posts' ? themeColors.text : themeColors.textMuted }]}>My Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'tagged' && styles.tabItemActive, activeTab === 'tagged' && { borderBottomColor: themeColors.text }]} onPress={() => setActiveTab('tagged')} activeOpacity={0.7}
            accessibilityLabel="Tagged" accessibilityRole="tab" accessibilityState={{ selected: activeTab === 'tagged' }}>
            <UserIcon size={22} color={activeTab === 'tagged' ? themeColors.text : themeColors.textMuted} strokeWidth={1.5} />
            <Text style={[styles.tabLabel, { color: activeTab === 'tagged' ? themeColors.text : themeColors.textMuted }]}>Tagged</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Posts grid ─── */}
        {displayPosts.length > 0 ? (
          <View style={styles.gridContainer}>
            {displayPosts.map((post, index) => (
              <TouchableOpacity
                key={post.id}
                style={[
                  styles.gridItem,
                  { marginRight: (index + 1) % 3 === 0 ? 0 : GRID_GAP },
                  { marginBottom: GRID_GAP },
                ]}
                onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                activeOpacity={0.8}
                accessibilityLabel={`Post by ${post.userName}`}
                accessibilityRole="button"
              >
                {post.images.length > 0 ? (
                  <Image source={{ uri: post.images[0] }} style={styles.gridImage} />
                ) : (
                  <View style={[styles.gridPlaceholder, { backgroundColor: themeColors.cardBackground }]}>
                    <Text style={[styles.gridPlaceholderText, { color: themeColors.textMuted }]}>{post.caption.substring(0, 40)}...</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyGrid}>
            <Text style={[styles.emptyGridText, { color: themeColors.textMuted }]}>
              {activeTab === 'posts' ? 'No posts yet' : 'No tagged posts yet'}
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Create Bottom Sheet ─── */}
      <Modal visible={createMenuVisible} transparent animationType="slide" onRequestClose={() => setCreateMenuVisible(false)}>
        <TouchableOpacity style={createStyles.overlay} activeOpacity={1} onPress={() => setCreateMenuVisible(false)}>
          <View style={[createStyles.sheet, { backgroundColor: themeColors.cardBackground }]}>
            <View style={[createStyles.handle, { backgroundColor: themeColors.border }]} />
            <Text style={[createStyles.title, { color: themeColors.text }]}>Create</Text>

            <View style={createStyles.grid}>
              <TouchableOpacity style={createStyles.option} onPress={handleCreatePost} activeOpacity={0.7}>
                <View style={[createStyles.iconWrap, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                  <GridIcon size={24} color={themeColors.primary} strokeWidth={1.5} />
                </View>
                <Text style={[createStyles.optionLabel, { color: themeColors.text }]}>Post</Text>
                <Text style={[createStyles.optionSub, { color: themeColors.textMuted }]}>Share photos & tag vendors</Text>
              </TouchableOpacity>

              <TouchableOpacity style={createStyles.option} onPress={handleCreateStory} activeOpacity={0.7}>
                <View style={[createStyles.iconWrap, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                  <ClockIcon size={24} color={themeColors.primary} strokeWidth={1.5} />
                </View>
                <Text style={[createStyles.optionLabel, { color: themeColors.text }]}>Story</Text>
                <Text style={[createStyles.optionSub, { color: themeColors.textMuted }]}>Share moments that disappear</Text>
              </TouchableOpacity>

            </View>

            <TouchableOpacity style={[createStyles.cancelBtn, { borderColor: themeColors.border }]} onPress={() => setCreateMenuVisible(false)} activeOpacity={0.7}>
              <Text style={[createStyles.cancelText, { color: themeColors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34, paddingTop: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontFamily: fonts.bold, fontSize: 20, textAlign: 'center', marginBottom: 20 },
  grid: { paddingHorizontal: 20 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  optionLabel: { fontFamily: fonts.semiBold, fontSize: 16 },
  optionSub: { fontFamily: fonts.regular, fontSize: 12, marginTop: 1 },
  cancelBtn: { marginHorizontal: 20, marginTop: 16, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelText: { fontFamily: fonts.semiBold, fontSize: 16 },
});

const shareStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34, paddingTop: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontFamily: fonts.bold, fontSize: 20, textAlign: 'center', marginBottom: 24 },
  optionsRow: { flexDirection: 'row', justifyContent: 'center', gap: 32, paddingHorizontal: 20, marginBottom: 24 },
  option: { alignItems: 'center', gap: 8 },
  iconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  optionLabel: { fontFamily: fonts.medium, fontSize: 13 },
  cancelBtn: { marginHorizontal: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelText: { fontFamily: fonts.semiBold, fontSize: 16 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ─── Header bar ───
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerUsername: {
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconBtn: {
    padding: 4,
  },

  // ─── Profile section ───
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarWrap: {
    marginRight: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: '#FFFFFF',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },

  // ─── Name & Bio ───
  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  fullName: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  bioText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 2,
    lineHeight: 20,
  },
  cityText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 2,
  },

  // ─── Action buttons ───
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },

  // ─── Vendor banner ───
  vendorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  vendorBannerLeft: {
    flex: 1,
  },
  vendorBannerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  vendorBannerSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 4,
  },

  // ─── Tab bar ───
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  tabItemActive: {
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },

  // ─── Posts grid ───
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  gridPlaceholderText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'center',
  },

  // ─── Empty grid ───
  emptyGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyGridText: {
    fontFamily: fonts.regular,
    fontSize: 15,
  },

  // ─── Friends row ───
  friendsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 16 },
  friendCircle: { alignItems: 'center', width: 64 },
  friendAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  friendInitial: { fontFamily: fonts.bold, fontSize: 20, color: colors.white },
  friendAvatarAdd: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  friendAddPlus: { fontSize: 24, fontFamily: fonts.regular },
  friendName: { fontFamily: fonts.regular, fontSize: 11, marginTop: 4, textAlign: 'center' },

  // ─── Reviews section ───
  reviewsSection: { paddingHorizontal: 16, marginBottom: 12 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reviewsTitle: { fontFamily: fonts.bold, fontSize: 16 },
  reviewsSeeAll: { fontFamily: fonts.semiBold, fontSize: 14 },
  reviewCard: { width: 200, padding: 12, borderRadius: 12, borderWidth: 1 },
  reviewVendor: { fontFamily: fonts.semiBold, fontSize: 13, marginBottom: 4 },
  reviewText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },

  // ─── Sign-in screen (unauthenticated) ───
  signInContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  signInLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 24,
  },
  signInTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    marginBottom: 8,
  },
  signInSub: {
    fontFamily: fonts.regular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  signInBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  signInBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
