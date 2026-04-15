import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFeed, FeedPost } from '../../context/FeedContext';
import { fonts, spacing, borderRadius } from '../../theme';
import {
  HeartIcon,
  HeartFilledIcon,
  MessageIcon,
  ShareIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  PlusIcon,
  BellIcon,
  MoreHorizontalIcon,
  MapPinIcon,
  SendIcon,
} from '../../components/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Stories Row ────────────────────────────────────────

const STORY_USERS = [
  { id: 'you', name: 'Your Story', initial: '+', hasStory: false },
  { id: 's1', name: 'Sarah M.', initial: 'SM', hasStory: true },
  { id: 's2', name: 'David C.', initial: 'DC', hasStory: true },
  { id: 's3', name: 'Maria G.', initial: 'MG', hasStory: true },
  { id: 's4', name: 'James C.', initial: 'JC', hasStory: true },
  { id: 's5', name: 'Ashley T.', initial: 'AT', hasStory: true },
  { id: 's6', name: 'Marcus R.', initial: 'MR', hasStory: true },
];

function StoriesRow({ themeColors, onAddStory }: { themeColors: any; onAddStory: () => void }) {
  return (
    <View style={[styles.storiesContainer, { borderBottomColor: themeColors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
      >
        {STORY_USERS.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.storyItem}
            activeOpacity={0.7}
            onPress={user.id === 'you' ? onAddStory : undefined}
            accessibilityLabel={`${user.name} story`}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.storyRing,
                user.hasStory
                  ? { borderColor: themeColors.secondary }
                  : { borderColor: themeColors.border },
              ]}
            >
              <View
                style={[
                  styles.storyAvatar,
                  { backgroundColor: user.id === 'you' ? themeColors.border : themeColors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.storyAvatarText,
                    { color: user.id === 'you' ? themeColors.textMuted : '#fff' },
                  ]}
                >
                  {user.initial}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.storyName, { color: themeColors.text }]}
              numberOfLines={1}
            >
              {user.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Time Formatting ────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

// ─── Caption with @mentions ─────────────────────────────

function CaptionText({
  userName,
  caption,
  themeColors,
}: {
  userName: string;
  caption: string;
  themeColors: any;
}) {
  const parts = caption.split(/(@\w+)/g);
  return (
    <Text style={[styles.captionText, { color: themeColors.text }]}>
      <Text style={styles.captionUserName}>{userName} </Text>
      {parts.map((part, i) =>
        part.startsWith('@') ? (
          <Text key={i} style={[styles.mentionText, { color: themeColors.primary }]}>
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        ),
      )}
    </Text>
  );
}

// ─── Post Card ──────────────────────────────────────────

function PostCard({
  post,
  themeColors,
  onLike,
  onBookmark,
  onComment,
  onViewComments,
}: {
  post: FeedPost;
  themeColors: any;
  onLike: () => void;
  onBookmark: () => void;
  onComment: () => void;
  onViewComments: () => void;
}) {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <View style={[styles.postCard, { backgroundColor: themeColors.background }]}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.postHeaderLeft} activeOpacity={0.7} accessibilityLabel={`${post.userName} profile`}>
          <View style={[styles.postAvatar, { backgroundColor: themeColors.primary }]}>
            {post.userAvatar ? (
              <Image source={{ uri: post.userAvatar }} style={styles.postAvatarImage} />
            ) : (
              <Text style={styles.postAvatarText}>
                {post.userName.split(' ').map((n) => n[0]).join('')}
              </Text>
            )}
          </View>
          <View>
            <Text style={[styles.postUserName, { color: themeColors.text }]}>{post.userName}</Text>
            {post.location ? (
              <View style={styles.locationRow}>
                <MapPinIcon size={10} color={themeColors.textMuted} strokeWidth={1.5} />
                <Text style={[styles.postLocation, { color: themeColors.textMuted }]}>{post.location}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreBtn}
          activeOpacity={0.6}
          accessibilityLabel="Post options"
          accessibilityRole="button"
        >
          <MoreHorizontalIcon size={20} color={themeColors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Post Image(s) */}
      {post.images.length > 1 ? (
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImage(idx);
            }}
          >
            {post.images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={styles.postImage}
                accessibilityLabel={`Post photo ${idx + 1} of ${post.images.length}`}
                accessibilityRole="image"
              />
            ))}
          </ScrollView>
          {post.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {post.images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.imageIndicator,
                    {
                      backgroundColor:
                        idx === currentImage ? themeColors.primary : themeColors.textMuted,
                      opacity: idx === currentImage ? 1 : 0.3,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      ) : (
        <Image
          source={{ uri: post.images[0] }}
          style={styles.postImage}
          accessibilityLabel="Post photo"
          accessibilityRole="image"
        />
      )}

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.actionBarLeft}>
          <TouchableOpacity
            onPress={onLike}
            style={styles.actionBtn}
            activeOpacity={0.6}
            accessibilityLabel={post.liked ? 'Unlike post' : 'Like post'}
            accessibilityRole="button"
          >
            {post.liked ? (
              <HeartFilledIcon size={24} color={themeColors.secondary} />
            ) : (
              <HeartIcon size={24} color={themeColors.text} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onViewComments}
            style={styles.actionBtn}
            activeOpacity={0.6}
            accessibilityLabel="View comments"
            accessibilityRole="button"
          >
            <MessageIcon size={24} color={themeColors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.6}
            accessibilityLabel="Share post"
            accessibilityRole="button"
          >
            <ShareIcon size={22} color={themeColors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={onBookmark}
          style={styles.actionBtn}
          activeOpacity={0.6}
          accessibilityLabel={post.bookmarked ? 'Remove bookmark' : 'Bookmark post'}
          accessibilityRole="button"
        >
          {post.bookmarked ? (
            <BookmarkFilledIcon size={24} color={themeColors.text} />
          ) : (
            <BookmarkIcon size={24} color={themeColors.text} />
          )}
        </TouchableOpacity>
      </View>

      {/* Like Count */}
      <Text style={[styles.likeCount, { color: themeColors.text }]}>
        {post.likes.toLocaleString()} {post.likes === 1 ? 'like' : 'likes'}
      </Text>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <CaptionText userName={post.userName} caption={post.caption} themeColors={themeColors} />
      </View>

      {/* View Comments Link */}
      {post.comments.length > 0 && (
        <TouchableOpacity
          onPress={onViewComments}
          activeOpacity={0.6}
          accessibilityLabel={`View all ${post.comments.length} comments`}
          accessibilityRole="button"
        >
          <Text style={[styles.viewComments, { color: themeColors.textMuted }]}>
            View all {post.comments.length} comments
          </Text>
        </TouchableOpacity>
      )}

      {/* Comment Input */}
      <TouchableOpacity
        onPress={onComment}
        style={styles.commentInputRow}
        activeOpacity={0.7}
        accessibilityLabel="Add a comment"
        accessibilityRole="button"
      >
        <View style={[styles.commentInputAvatar, { backgroundColor: themeColors.border }]}>
          <Text style={[styles.commentInputAvatarText, { color: themeColors.textMuted }]}>Y</Text>
        </View>
        <Text style={[styles.commentInputPlaceholder, { color: themeColors.textMuted }]}>
          Add a comment...
        </Text>
      </TouchableOpacity>

      {/* Timestamp */}
      <Text style={[styles.timestamp, { color: themeColors.textMuted }]}>
        {timeAgo(post.createdAt)}
      </Text>
    </View>
  );
}

// ─── Feed Screen ────────────────────────────────────────

export default function FeedScreen({ navigation }: any) {
  const { colors: themeColors } = useTheme();
  const auth = useAuth();
  const { posts, likePost, bookmarkPost, addPost } = useFeed();
  const [refreshing, setRefreshing] = useState(false);
  const [storyPreview, setStoryPreview] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');

  function handleAddStory() {
    if (!auth.user) {
      Alert.alert('Sign In Required', 'Please sign in to share a story.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Onboarding') },
      ]);
      return;
    }
    Alert.alert('Add to Your Story', 'Choose a photo or video to share', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) { Alert.alert('Permission Needed', 'Camera access is required to take photos.'); return; }
          const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [9, 16] });
          if (!result.canceled) { setStoryPreview(result.assets[0].uri); }
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) { Alert.alert('Permission Needed', 'Photo library access is required.'); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, aspect: [9, 16] });
          if (!result.canceled) { setStoryPreview(result.assets[0].uri); }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handlePostStory() {
    if (!storyPreview) return;
    addPost({
      userId: auth.user?.id ?? 'me',
      userName: (auth.user?.firstName ?? '') + ' ' + (auth.user?.lastName ?? ''),
      userAvatar: auth.user?.profilePhoto ?? null,
      images: [storyPreview],
      caption: storyCaption,
      taggedVendors: [],
      taggedFriends: [],
      location: '',
    });
    setStoryPreview(null);
    setStoryCaption('');
    Alert.alert('Posted!', 'Your story has been shared to your feed.');
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderPost = useCallback(
    ({ item }: { item: FeedPost }) => (
      <PostCard
        post={item}
        themeColors={themeColors}
        onLike={() => likePost(item.id)}
        onBookmark={() => bookmarkPost(item.id)}
        onComment={() =>
          navigation.navigate('PostDetail', { postId: item.id })
        }
        onViewComments={() =>
          navigation.navigate('PostDetail', { postId: item.id })
        }
      />
    ),
    [themeColors, likePost, bookmarkPost, navigation],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <Text style={[styles.logoText, { color: themeColors.primary }]}>ConnectMe</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('PostCreation')}
            style={styles.headerBtn}
            activeOpacity={0.6}
            accessibilityLabel="Create new post"
            accessibilityRole="button"
          >
            <PlusIcon size={26} color={themeColors.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.headerBtn}
            activeOpacity={0.6}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <BellIcon size={24} color={themeColors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={<StoriesRow themeColors={themeColors} onAddStory={handleAddStory} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
            colors={[themeColors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      {/* ─── Story preview modal ─── */}
      <Modal visible={!!storyPreview} animationType="slide" presentationStyle="fullScreen">
        <View style={[storyStyles.container, { backgroundColor: '#000' }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={storyStyles.header}>
              <TouchableOpacity onPress={() => { setStoryPreview(null); setStoryCaption(''); }} activeOpacity={0.6}>
                <Text style={storyStyles.headerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={storyStyles.headerTitle}>Your Story</Text>
              <TouchableOpacity onPress={handlePostStory} activeOpacity={0.6}>
                <Text style={[storyStyles.headerShare, { color: themeColors.primary }]}>Share</Text>
              </TouchableOpacity>
            </View>
            {storyPreview && (
              <Image source={{ uri: storyPreview }} style={storyStyles.preview} resizeMode="contain" />
            )}
            <View style={storyStyles.captionBar}>
              <TextInput
                style={storyStyles.captionInput}
                value={storyCaption}
                onChangeText={setStoryCaption}
                placeholder="Add a caption..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Story styles ───────────────────────────────────────

const storyStyles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerCancel: { fontFamily: fonts.regular, fontSize: 16, color: '#fff' },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: '#fff' },
  headerShare: { fontFamily: fonts.semiBold, fontSize: 16 },
  preview: { flex: 1, width: '100%' },
  captionBar: { paddingHorizontal: 16, paddingVertical: 12 },
  captionInput: { fontFamily: fonts.regular, fontSize: 15, color: '#fff', minHeight: 40 },
});

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  logoText: {
    fontFamily: fonts.bold,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stories
  storiesContainer: {
    borderBottomWidth: 0.5,
    paddingVertical: 10,
  },
  storiesContent: {
    paddingHorizontal: spacing.md,
    gap: 14,
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatarText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
  storyName: {
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },

  // Post Card
  postCard: {
    marginBottom: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  postAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  postAvatarText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#fff',
  },
  postUserName: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  postLocation: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  moreBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Post Image
  postImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    resizeMode: 'cover',
  },
  imageIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 8,
  },
  imageIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Action Bar
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 4,
  },
  actionBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionBtn: {
    padding: 2,
  },

  // Content
  likeCount: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    paddingHorizontal: spacing.md,
    marginTop: 4,
  },
  captionContainer: {
    paddingHorizontal: spacing.md,
    marginTop: 4,
  },
  captionText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  captionUserName: {
    fontFamily: fonts.semiBold,
  },
  mentionText: {
    fontFamily: fonts.semiBold,
  },
  viewComments: {
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingHorizontal: spacing.md,
    marginTop: 6,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: 8,
    gap: 8,
  },
  commentInputAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentInputAvatarText: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  commentInputPlaceholder: {
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  timestamp: {
    fontFamily: fonts.regular,
    fontSize: 11,
    paddingHorizontal: spacing.md,
    marginTop: 4,
    marginBottom: 8,
  },
});
