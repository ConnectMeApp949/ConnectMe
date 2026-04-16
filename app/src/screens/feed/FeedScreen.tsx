import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Modal,
  Alert,
  Share,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFeed, FeedPost, FeedStory } from '../../context/FeedContext';
import { useAlert } from '../../context/AlertContext';
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
  UserIcon,
  FlagIcon,
  XIcon,
  SearchIcon,
} from '../../components/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Stories Row ────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function StoriesRow({
  themeColors,
  stories,
  currentUserId,
  hasMyStory,
  myStoryImage,
  onAddStory,
  onViewStory,
}: {
  themeColors: any;
  stories: FeedStory[];
  currentUserId: string | undefined;
  hasMyStory: boolean;
  myStoryImage: string | null;
  onAddStory: () => void;
  onViewStory: (story: FeedStory) => void;
}) {
  // Deduplicate: one circle per user, most recent story
  const seen = new Set<string>();
  const uniqueStories: FeedStory[] = [];
  for (const s of stories) {
    if (s.userId === currentUserId) continue; // skip own stories from list
    if (!seen.has(s.userId)) {
      seen.add(s.userId);
      uniqueStories.push(s);
    }
  }

  return (
    <View style={[styles.storiesContainer, { borderBottomColor: themeColors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
      >
        {/* Your Story */}
        <TouchableOpacity
          style={styles.storyItem}
          activeOpacity={0.7}
          onPress={onAddStory}
          accessibilityLabel="Your Story"
          accessibilityRole="button"
        >
          <View style={[styles.storyRing, { borderColor: hasMyStory ? themeColors.secondary : themeColors.border }]}>
            {hasMyStory && myStoryImage ? (
              <Image source={{ uri: myStoryImage }} style={styles.storyAvatar} />
            ) : (
              <View style={[styles.storyAvatar, { backgroundColor: themeColors.border }]}>
                <Text style={[styles.storyAvatarText, { color: themeColors.textMuted }]}>+</Text>
              </View>
            )}
          </View>
          <Text style={[styles.storyName, { color: themeColors.text }]} numberOfLines={1}>
            Your Story
          </Text>
        </TouchableOpacity>

        {/* Other users' stories */}
        {uniqueStories.map((story) => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyItem}
            activeOpacity={0.7}
            onPress={() => onViewStory(story)}
            accessibilityLabel={`${story.userName}'s story`}
            accessibilityRole="button"
          >
            <View style={[styles.storyRing, { borderColor: themeColors.secondary }]}>
              {story.userAvatar ? (
                <Image source={{ uri: story.userAvatar }} style={styles.storyAvatar} />
              ) : (
                <View style={[styles.storyAvatar, { backgroundColor: themeColors.primary }]}>
                  <Text style={[styles.storyAvatarText, { color: '#fff' }]}>
                    {getInitials(story.userName)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.storyName, { color: themeColors.text }]} numberOfLines={1}>
              {story.userName}
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
  // Split on @mentions and #hashtags
  const parts = caption.split(/([@#]\w+)/g);
  return (
    <Text style={[styles.captionText, { color: themeColors.text }]}>
      <Text style={styles.captionUserName}>{userName} </Text>
      {parts.map((part, i) =>
        part.startsWith('@') || part.startsWith('#') ? (
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
  currentUser,
  onLike,
  onBookmark,
  onComment,
  onViewComments,
  onMore,
  onUserPress,
}: {
  post: FeedPost;
  themeColors: any;
  currentUser: any;
  onLike: () => void;
  onBookmark: () => void;
  onComment: () => void;
  onViewComments: () => void;
  onMore: () => void;
  onUserPress: () => void;
}) {
  const [currentImage, setCurrentImage] = useState(0);

  // Use current profile photo for the logged-in user's posts
  const displayAvatar = (currentUser && post.userId === currentUser.id)
    ? (currentUser.profilePhoto ?? post.userAvatar)
    : post.userAvatar;

  return (
    <View style={[styles.postCard, { backgroundColor: themeColors.background }]}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.postHeaderLeft} activeOpacity={0.7} onPress={onUserPress} accessibilityLabel={`View ${post.userName}'s profile`}>
          <View style={[styles.postAvatar, { backgroundColor: themeColors.primary }]}>
            {displayAvatar ? (
              <Image source={{ uri: displayAvatar }} style={styles.postAvatarImage} />
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
          onPress={onMore}
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
            onPress={async () => {
              try {
                await Share.share({
                  message: `${post.userName}: ${post.caption}\n\nSee more on ConnectMe: https://apps.apple.com/app/id6761668389`,
                });
              } catch {}
            }}
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
  const { posts, stories, likePost, bookmarkPost } = useFeed();
  const { showAlert } = useAlert();
  const [refreshing, setRefreshing] = useState(false);
  const [viewingStory, setViewingStory] = useState<FeedStory | null>(null);
  const [menuPost, setMenuPost] = useState<FeedPost | null>(null);
  const [feedSearch, setFeedSearch] = useState('');

  const filteredPosts = feedSearch.trim()
    ? posts.filter(p =>
        p.userName.toLowerCase().includes(feedSearch.toLowerCase()) ||
        p.caption.toLowerCase().includes(feedSearch.toLowerCase()) ||
        p.taggedVendors.some(v => v.toLowerCase().includes(feedSearch.toLowerCase())) ||
        p.taggedFriends.some(f => f.toLowerCase().includes(feedSearch.toLowerCase())) ||
        p.location.toLowerCase().includes(feedSearch.toLowerCase())
      )
    : posts;
  const alertShown = useRef(false);

  // Show friend request alert when feed loads (demo)
  useEffect(() => {
    if (auth.user && !alertShown.current) {
      alertShown.current = true;
      const timer = setTimeout(() => {
        showAlert(
          'friendRequest',
          'New Friend Request',
          'Samantha Chen wants to connect with you.',
          () => navigation.navigate('ProfileTab', { screen: 'Connections', params: { tab: 'requests' } }),
        );
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [auth.user]);

  const currentUserId = auth.user?.id;
  const hasMyStory = stories.some(s => s.userId === currentUserId);
  // Find current user's most recent story for viewing
  const myStory = stories.find(s => s.userId === currentUserId) ?? null;

  function handleAddStory() {
    if (!auth.user) {
      Alert.alert('Sign In Required', 'Please sign in to share a story.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Onboarding') },
      ]);
      return;
    }
    // If user already has a story, view it; otherwise create new
    if (hasMyStory && myStory) {
      setViewingStory(myStory);
    } else {
      navigation.navigate('StoryCreation');
    }
  }

  function handleViewStory(story: FeedStory) {
    setViewingStory(story);
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
        currentUser={auth.user}
        onLike={() => likePost(item.id)}
        onBookmark={() => bookmarkPost(item.id)}
        onComment={() =>
          navigation.navigate('PostDetail', { postId: item.id })
        }
        onViewComments={() =>
          navigation.navigate('PostDetail', { postId: item.id })
        }
        onMore={() => setMenuPost(item)}
        onUserPress={() => {
          // Navigate to user's profile posts view
          Alert.alert(item.userName, `View ${item.userName}'s posts and profile on ConnectMe.`);
        }}
      />
    ),
    [themeColors, likePost, bookmarkPost, navigation, auth.user],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={() => {
            if (!auth.user) {
              Alert.alert('Sign In Required', 'Please sign in to create a post.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign In', onPress: () => navigation.navigate('Onboarding') },
              ]);
              return;
            }
            navigation.navigate('PostCreation');
          }}
          style={styles.headerBtn}
          activeOpacity={0.6}
          accessibilityLabel="Create new post"
          accessibilityRole="button"
        >
          <PlusIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>

        {/* Search bar in header */}
        <View style={[styles.feedSearchBar, { backgroundColor: `${themeColors.text}08` }]}>
          <SearchIcon size={16} color={themeColors.textMuted} strokeWidth={1.5} />
          <TextInput
            style={[styles.feedSearchInput, { color: themeColors.text }]}
            value={feedSearch}
            onChangeText={setFeedSearch}
            placeholder="Search..."
            placeholderTextColor={themeColors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {feedSearch.length > 0 && (
            <TouchableOpacity onPress={() => setFeedSearch('')} activeOpacity={0.6}>
              <XIcon size={14} color={themeColors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

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

      {/* Feed */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={
          <StoriesRow
            themeColors={themeColors}
            stories={stories}
            currentUserId={currentUserId}
            hasMyStory={hasMyStory}
            myStoryImage={myStory?.image ?? null}
            onAddStory={handleAddStory}
            onViewStory={handleViewStory}
          />
        }
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
      {/* ─── Story Viewer Modal ─── */}
      <Modal visible={!!viewingStory} animationType="fade" transparent={false}>
        <View style={storyStyles.container}>
          <SafeAreaView style={{ flex: 1 }}>
            {viewingStory && (
              <>
                {/* Progress bar */}
                <View style={storyStyles.progressRow}>
                  <View style={[storyStyles.progressBar, { backgroundColor: '#fff' }]} />
                </View>

                {/* Header */}
                <View style={storyStyles.header}>
                  <View style={storyStyles.headerUser}>
                    <View style={storyStyles.headerAvatar}>
                      <Text style={storyStyles.headerAvatarText}>{getInitials(viewingStory.userName)}</Text>
                    </View>
                    <View>
                      <Text style={storyStyles.headerName}>{viewingStory.userName}</Text>
                      <Text style={storyStyles.headerTime}>
                        {(() => {
                          const diff = Date.now() - new Date(viewingStory.createdAt).getTime();
                          const hours = Math.floor(diff / 3600000);
                          return hours < 1 ? 'Just now' : `${hours}h ago`;
                        })()}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setViewingStory(null)} activeOpacity={0.6} style={storyStyles.closeBtn}
                    hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                    accessibilityLabel="Close story" accessibilityRole="button">
                    <XIcon size={22} color="#fff" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                {/* Story image */}
                <Image source={{ uri: viewingStory.image }} style={storyStyles.preview} resizeMode="cover" />

                {/* Caption & details */}
                {(viewingStory.caption || viewingStory.location) && (
                  <View style={storyStyles.captionBar}>
                    {viewingStory.location !== '' && (
                      <Text style={storyStyles.locationText}>📍 {viewingStory.location}</Text>
                    )}
                    {viewingStory.caption !== '' && (
                      <Text style={storyStyles.captionText}>{viewingStory.caption}</Text>
                    )}
                  </View>
                )}
              </>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* ─── Post Options Bottom Sheet ─── */}
      <Modal visible={!!menuPost} transparent animationType="slide" onRequestClose={() => setMenuPost(null)}>
        <TouchableOpacity style={postMenuStyles.overlay} activeOpacity={1} onPress={() => setMenuPost(null)}>
          <View style={[postMenuStyles.sheet, { backgroundColor: themeColors.cardBackground }]}>
            <View style={[postMenuStyles.handle, { backgroundColor: themeColors.border }]} />
            {[
              { label: 'Save', IconComp: BookmarkIcon, color: themeColors.text, action: () => { if (menuPost) { bookmarkPost(menuPost.id); setMenuPost(null); Alert.alert('Saved', 'Post has been saved to your collection.'); } } },
              { label: 'About this account', IconComp: UserIcon, color: themeColors.text, action: () => { setMenuPost(null); Alert.alert('About', `${menuPost?.userName ?? 'User'}\n\nMember of the ConnectMe community. View their profile to learn more.`); } },
              { label: 'Report', IconComp: FlagIcon, color: '#E53E3E', action: () => { setMenuPost(null); Alert.alert('Report Post', 'Are you sure you want to report this post?', [ { text: 'Cancel', style: 'cancel' }, { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thank you. We will review this post.') } ]); } },
            ].map((opt) => (
              <TouchableOpacity key={opt.label} style={[postMenuStyles.option, { borderBottomColor: themeColors.border }]} onPress={opt.action} activeOpacity={0.6}>
                <View style={[postMenuStyles.iconWrap, { backgroundColor: opt.label === 'Report' ? '#FEE2E2' : `${themeColors.primary}15` }]}>
                  <opt.IconComp size={20} color={opt.color} strokeWidth={1.5} />
                </View>
                <Text style={[postMenuStyles.optionLabel, { color: opt.color }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[postMenuStyles.cancelBtn, { borderColor: themeColors.border }]} onPress={() => setMenuPost(null)} activeOpacity={0.7}>
              <Text style={[postMenuStyles.cancelText, { color: themeColors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Post menu styles ──────────────────────────────────

const postMenuStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34, paddingTop: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  option: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5, gap: 14 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  optionLabel: { fontFamily: fonts.medium, fontSize: 16 },
  cancelBtn: { marginHorizontal: 20, marginTop: 12, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelText: { fontFamily: fonts.semiBold, fontSize: 16 },
});

// ─── Story styles ───────────────────────────────────────

const storyStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  progressRow: { flexDirection: 'row', paddingHorizontal: 8, paddingTop: 8, gap: 4 },
  progressBar: { flex: 1, height: 2.5, borderRadius: 2, opacity: 0.7 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  headerUser: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { fontFamily: fonts.bold, fontSize: 13, color: '#fff' },
  headerName: { fontFamily: fonts.semiBold, fontSize: 14, color: '#fff' },
  headerTime: { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  preview: { flex: 1, width: '100%', borderRadius: 8, marginHorizontal: 0 },
  captionBar: { paddingHorizontal: 16, paddingVertical: 14, gap: 4 },
  locationText: { fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  captionText: { fontFamily: fonts.regular, fontSize: 15, color: '#fff', lineHeight: 22 },
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

  // Feed search
  feedSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 10,
    gap: 6,
  },
  feedSearchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    padding: 0,
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
