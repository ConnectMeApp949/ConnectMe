import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFeed, FeedComment } from '../../context/FeedContext';
import { fonts, spacing, borderRadius } from '../../theme';
import {
  ChevronLeftIcon,
  HeartIcon,
  HeartFilledIcon,
  MessageIcon,
  ShareIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  MoreHorizontalIcon,
  MapPinIcon,
  SendIcon,
  ClockIcon,
  EditPencilIcon,
  XIcon,
} from '../../components/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

// ─── Comment Item ───────────────────────────────────────

function CommentItem({
  comment,
  themeColors,
  onLike,
}: {
  comment: FeedComment;
  themeColors: any;
  onLike: () => void;
}) {
  return (
    <View style={styles.commentItem}>
      <View style={[styles.commentAvatar, { backgroundColor: themeColors.primary }]}>
        {comment.userAvatar ? (
          <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatarImage} />
        ) : (
          <Text style={styles.commentAvatarText}>
            {comment.userName.split(' ').map((n) => n[0]).join('')}
          </Text>
        )}
      </View>
      <View style={styles.commentContent}>
        <Text style={[styles.commentTextContent, { color: themeColors.text }]}>
          <Text style={styles.commentUserName}>{comment.userName} </Text>
          {comment.text}
        </Text>
        <View style={styles.commentMeta}>
          <Text style={[styles.commentTime, { color: themeColors.textMuted }]}>
            {timeAgo(comment.createdAt)}
          </Text>
          {comment.likes > 0 && (
            <Text style={[styles.commentLikes, { color: themeColors.textMuted }]}>
              {comment.likes} {comment.likes === 1 ? 'like' : 'likes'}
            </Text>
          )}
          <TouchableOpacity activeOpacity={0.6} accessibilityLabel="Reply" accessibilityRole="button">
            <Text style={[styles.commentReply, { color: themeColors.textMuted }]}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={onLike}
        style={styles.commentLikeBtn}
        activeOpacity={0.6}
        accessibilityLabel="Like comment"
        accessibilityRole="button"
      >
        <HeartIcon size={14} color={themeColors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Post Detail Screen ─────────────────────────────────

export default function PostDetailScreen({ route, navigation }: any) {
  const { colors: themeColors } = useTheme();
  const { user } = useAuth();
  const { posts, likePost, bookmarkPost, addComment, likeComment, editPost } = useFeed();
  const inputRef = useRef<TextInput>(null);

  const { postId } = route.params;
  const post = posts.find((p) => p.id === postId);

  const [commentText, setCommentText] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editTaggedFriends, setEditTaggedFriends] = useState('');

  const handleSendComment = useCallback(() => {
    if (!commentText.trim()) return;

    const userName = user?.firstName
      ? `${user.firstName} ${user.lastName ?? ''}`.trim()
      : 'You';

    addComment(postId, {
      userId: user?.id ?? 'current_user',
      userName,
      userAvatar: user?.profilePhoto ?? null,
      text: commentText.trim(),
    });

    setCommentText('');
  }, [commentText, user, addComment, postId]);

  if (!post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn} accessibilityLabel="Go back" accessibilityRole="button">
            <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>Post</Text>
          <View style={styles.headerBackBtn} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackBtn}
          activeOpacity={0.6}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Comments</Text>
        <TouchableOpacity style={styles.headerBackBtn} activeOpacity={0.6} accessibilityLabel="Share post" accessibilityRole="button">
          <ShareIcon size={22} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={post.comments}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <TouchableOpacity style={styles.postHeaderLeft} activeOpacity={0.7}>
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
                <TouchableOpacity style={styles.moreBtn} activeOpacity={0.6} onPress={() => setMenuVisible(true)} accessibilityLabel="Post options" accessibilityRole="button">
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
                      <Image key={idx} source={{ uri: img }} style={styles.postImage} accessibilityLabel={`Post photo ${idx + 1}`} accessibilityRole="image" />
                    ))}
                  </ScrollView>
                  <View style={styles.imageIndicators}>
                    {post.images.map((_, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.imageIndicator,
                          {
                            backgroundColor: idx === currentImage ? themeColors.primary : themeColors.textMuted,
                            opacity: idx === currentImage ? 1 : 0.3,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <Image source={{ uri: post.images[0] }} style={styles.postImage} accessibilityLabel="Post photo" accessibilityRole="image" />
              )}

              {/* Action Bar */}
              <View style={styles.actionBar}>
                <View style={styles.actionBarLeft}>
                  <TouchableOpacity onPress={() => likePost(post.id)} style={styles.actionBtn} activeOpacity={0.6} accessibilityLabel={post.liked ? 'Unlike' : 'Like'} accessibilityRole="button">
                    {post.liked ? (
                      <HeartFilledIcon size={24} color={themeColors.secondary} />
                    ) : (
                      <HeartIcon size={24} color={themeColors.text} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => inputRef.current?.focus()} style={styles.actionBtn} activeOpacity={0.6} accessibilityLabel="Comment" accessibilityRole="button">
                    <MessageIcon size={24} color={themeColors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.6} accessibilityLabel="Share" accessibilityRole="button">
                    <ShareIcon size={22} color={themeColors.text} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => bookmarkPost(post.id)} style={styles.actionBtn} activeOpacity={0.6} accessibilityLabel={post.bookmarked ? 'Remove bookmark' : 'Bookmark'} accessibilityRole="button">
                  {post.bookmarked ? (
                    <BookmarkFilledIcon size={24} color={themeColors.text} />
                  ) : (
                    <BookmarkIcon size={24} color={themeColors.text} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Like count */}
              <Text style={[styles.likeCount, { color: themeColors.text }]}>
                {post.likes.toLocaleString()} {post.likes === 1 ? 'like' : 'likes'}
              </Text>

              {/* Caption */}
              <View style={styles.captionContainer}>
                <CaptionText userName={post.userName} caption={post.caption} themeColors={themeColors} />
              </View>

              {/* Timestamp */}
              <Text style={[styles.timestamp, { color: themeColors.textMuted }]}>
                {timeAgo(post.createdAt)}
              </Text>

              {/* Comments divider */}
              <View style={[styles.commentsDivider, { borderBottomColor: themeColors.border }]} />

              {post.comments.length > 0 && (
                <Text style={[styles.commentsTitle, { color: themeColors.text }]}>
                  Comments ({post.comments.length})
                </Text>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              themeColors={themeColors}
              onLike={() => likeComment(post.id, item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.noComments}>
              <Text style={[styles.noCommentsTitle, { color: themeColors.text }]}>No comments yet</Text>
              <Text style={[styles.noCommentsSub, { color: themeColors.textMuted }]}>Be the first to comment</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Comment Input */}
        <View style={[styles.commentInputBar, { borderTopColor: themeColors.border, backgroundColor: themeColors.background }]}>
          <View style={[styles.commentInputAvatar, { backgroundColor: themeColors.primary }]}>
            <Text style={styles.commentInputAvatarText}>
              {user?.firstName?.[0] ?? 'Y'}
            </Text>
          </View>
          <TextInput
            ref={inputRef}
            style={[styles.commentInput, { color: themeColors.text, backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Add a comment..."
            placeholderTextColor={themeColors.textMuted}
            multiline
            maxLength={500}
            accessibilityLabel="Comment text input"
            accessibilityHint="Type your comment"
          />
          <TouchableOpacity
            onPress={handleSendComment}
            style={[styles.sendBtn, { opacity: commentText.trim().length > 0 ? 1 : 0.4 }]}
            disabled={commentText.trim().length === 0}
            activeOpacity={0.6}
            accessibilityLabel="Send comment"
            accessibilityRole="button"
          >
            <SendIcon size={22} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ─── Edit post modal ─── */}
      <Modal visible={editVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditVisible(false)}>
        <SafeAreaView style={[{ flex: 1, backgroundColor: themeColors.background }]}>
          <View style={[menuStyles.editHeader, { borderBottomColor: themeColors.border }]}>
            <TouchableOpacity onPress={() => setEditVisible(false)} activeOpacity={0.6}>
              <Text style={[menuStyles.editCancel, { color: themeColors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[menuStyles.editTitle, { color: themeColors.text }]}>Edit Post</Text>
            <TouchableOpacity onPress={() => {
              editPost(post.id, {
                caption: editCaption,
                location: editLocation,
                taggedFriends: editTaggedFriends.split(',').map((s: string) => s.trim()).filter(Boolean),
              });
              setEditVisible(false);
              Alert.alert('Updated', 'Your post has been updated.');
            }} activeOpacity={0.6}>
              <Text style={[menuStyles.editSave, { color: themeColors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
            <Text style={[menuStyles.editLabel, { color: themeColors.text }]}>Caption</Text>
            <TextInput
              style={[menuStyles.editInput, menuStyles.editInputLarge, { color: themeColors.text, backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              value={editCaption}
              onChangeText={setEditCaption}
              placeholder="Write a caption..."
              placeholderTextColor={themeColors.textMuted}
              multiline
              textAlignVertical="top"
            />

            <Text style={[menuStyles.editLabel, { color: themeColors.text }]}>Location</Text>
            <TextInput
              style={[menuStyles.editInput, { color: themeColors.text, backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="Add location"
              placeholderTextColor={themeColors.textMuted}
            />

            <Text style={[menuStyles.editLabel, { color: themeColors.text }]}>Tag Friends</Text>
            <TextInput
              style={[menuStyles.editInput, { color: themeColors.text, backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              value={editTaggedFriends}
              onChangeText={setEditTaggedFriends}
              placeholder="Separate names with commas"
              placeholderTextColor={themeColors.textMuted}
            />
            <Text style={[menuStyles.editHint, { color: themeColors.textMuted }]}>Tagged vendors cannot be changed after posting.</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ─── Post options bottom sheet ─── */}
      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={menuStyles.overlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[menuStyles.sheet, { backgroundColor: themeColors.cardBackground }]}>
            <View style={[menuStyles.handle, { backgroundColor: themeColors.border }]} />
            {[
              { label: 'Save', Icon: BookmarkIcon, onPress: () => { bookmarkPost(post.id); setMenuVisible(false); Alert.alert('Saved', 'Post saved to your collection.'); } },
              { label: 'Archive', Icon: ClockIcon, onPress: () => { setMenuVisible(false); Alert.alert('Archived', 'Post moved to your archive.'); } },
              { label: 'Edit', Icon: EditPencilIcon, onPress: () => { setMenuVisible(false); setEditCaption(post.caption); setEditLocation(post.location); setEditTaggedFriends(post.taggedFriends.join(', ')); setEditVisible(true); } },
              { label: 'Share', Icon: ShareIcon, onPress: () => { setMenuVisible(false); Alert.alert('Share', 'Post link copied to clipboard.'); } },
              { label: 'Delete', Icon: XIcon, danger: true, onPress: () => { setMenuVisible(false); Alert.alert('Delete Post', 'Are you sure you want to delete this post? This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { navigation.goBack(); } }]); } },
            ].map((item, i) => {
              const MenuIcon = item.Icon;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[menuStyles.option, i < 4 && { borderBottomWidth: 1, borderBottomColor: themeColors.border }]}
                  onPress={item.onPress}
                  activeOpacity={0.6}
                >
                  <View style={[menuStyles.optionIconWrap, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                    <MenuIcon size={18} color={(item as any).danger ? '#DC2626' : themeColors.primary} strokeWidth={1.5} />
                  </View>
                  <Text style={[menuStyles.optionLabel, { color: (item as any).danger ? '#DC2626' : themeColors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={[menuStyles.cancelBtn, { backgroundColor: themeColors.background, borderColor: themeColors.border }]} onPress={() => setMenuVisible(false)} activeOpacity={0.7}>
              <Text style={[menuStyles.cancelText, { color: themeColors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Menu styles ────────────────────────────────────────

const menuStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34, paddingTop: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, gap: 14 },
  optionIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  optionLabel: { fontFamily: fonts.medium, fontSize: 16 },
  cancelBtn: { marginHorizontal: 16, marginTop: 12, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelText: { fontFamily: fonts.semiBold, fontSize: 16 },
  editHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  editCancel: { fontFamily: fonts.regular, fontSize: 16 },
  editTitle: { fontFamily: fonts.semiBold, fontSize: 17 },
  editSave: { fontFamily: fonts.semiBold, fontSize: 16 },
  editLabel: { fontFamily: fonts.semiBold, fontSize: 15, marginBottom: 8, marginTop: 16 },
  editInput: { fontFamily: fonts.regular, fontSize: 15, padding: 14, borderRadius: 12, borderWidth: 1 },
  editInputLarge: { minHeight: 120, textAlignVertical: 'top' },
  editHint: { fontFamily: fonts.regular, fontSize: 12, marginTop: 8 },
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
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
  },

  // Post Header
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
  timestamp: {
    fontFamily: fonts.regular,
    fontSize: 11,
    paddingHorizontal: spacing.md,
    marginTop: 8,
  },

  // Comments
  commentsDivider: {
    borderBottomWidth: 0.5,
    marginTop: 12,
  },
  commentsTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 4,
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAvatarText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#fff',
  },
  commentContent: {
    flex: 1,
  },
  commentTextContent: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 19,
  },
  commentUserName: {
    fontFamily: fonts.semiBold,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  commentTime: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  commentLikes: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  commentReply: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  commentLikeBtn: {
    padding: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noCommentsTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    marginBottom: 4,
  },
  noCommentsSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },

  // Comment Input Bar
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    gap: 10,
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentInputAvatarText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#fff',
  },
  commentInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    maxHeight: 80,
  },
  sendBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
