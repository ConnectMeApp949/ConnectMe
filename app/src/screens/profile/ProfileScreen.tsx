import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFeed } from '../../context/FeedContext';
import { SettingsIcon, PlusIcon, GridIcon, ChevronRightIcon } from '../../components/Icons';
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

  // Filter posts by current user (for demo, show all posts)
  const userPosts = posts.filter((p) => p.userId === user?.id) ?? posts;

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
          <Text style={[styles.headerUsername, { color: themeColors.text }]}>{username}</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('PostCreation')}
              activeOpacity={0.7}
              accessibilityLabel="Create post"
              accessibilityRole="button"
            >
              <PlusIcon size={26} color={themeColors.text} strokeWidth={2} />
            </TouchableOpacity>
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
            <View style={styles.statCol}>
              <Text style={[styles.statNumber, { color: themeColors.text }]}>{userPosts.length}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Posts</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statNumber, { color: themeColors.text }]}>{user?.followersCount ?? 0}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Followers</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statNumber, { color: themeColors.text }]}>{user?.followingCount ?? 0}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Following</Text>
            </View>
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
            onPress={() => {/* share profile */}}
            activeOpacity={0.7}
            accessibilityLabel="Share Profile"
            accessibilityRole="button"
          >
            <Text style={[styles.actionBtnText, { color: themeColors.text }]}>Share Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Vendor mode banner ─── */}
        {auth.isVendorMode ? (
          <TouchableOpacity style={[styles.vendorBanner, { backgroundColor: themeColors.cardBackground }]} activeOpacity={0.8} onPress={() => auth.toggleVendorMode()} accessibilityLabel="Switch to Booking" accessibilityRole="button" accessibilityHint="Browse and book vendors for your events">
            <View style={styles.vendorBannerLeft}>
              <Text style={[styles.vendorBannerTitle, { color: themeColors.text }]}>Switch to Booking</Text>
              <Text style={[styles.vendorBannerSub, { color: themeColors.textSecondary }]}>Browse and book vendors for your events</Text>
            </View>
            <ChevronRightIcon size={24} color={colors.primary} strokeWidth={1.5} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.vendorBanner, { backgroundColor: themeColors.cardBackground }]} activeOpacity={0.8} onPress={() => auth.toggleVendorMode()} accessibilityLabel="Switch to hosting" accessibilityRole="button" accessibilityHint="Manage your vendor business">
            <View style={styles.vendorBannerLeft}>
              <Text style={[styles.vendorBannerTitle, { color: themeColors.text }]}>Switch to hosting</Text>
              <Text style={[styles.vendorBannerSub, { color: themeColors.textSecondary }]}>Manage your vendor business</Text>
            </View>
            <ChevronRightIcon size={24} color={colors.primary} strokeWidth={1.5} />
          </TouchableOpacity>
        )}

        {/* ─── Posts tab bar ─── */}
        <View style={[styles.tabBar, { borderBottomColor: themeColors.border, borderTopColor: themeColors.border }]}>
          <View style={[styles.tabItem, styles.tabItemActive, { borderBottomColor: themeColors.text }]}>
            <GridIcon size={24} color={themeColors.text} strokeWidth={1.5} />
          </View>
        </View>

        {/* ─── Posts grid ─── */}
        {userPosts.length > 0 ? (
          <View style={styles.gridContainer}>
            {userPosts.map((post, index) => (
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
            <Text style={[styles.emptyGridText, { color: themeColors.textMuted }]}>No posts yet</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
    paddingVertical: 10,
  },
  tabItemActive: {
    borderBottomWidth: 2,
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
