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
  const { posts, likePost, bookmarkPost, addComment, likeComment } = useFeed();
  const inputRef = useRef<TextInput>(null);

  const { postId } = route.params;
  const post = posts.find((p) => p.id === postId);

  const [commentText, setCommentText] = useState('');
  const [currentImage, setCurrentImage] = useState(0);

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
                <TouchableOpacity style={styles.moreBtn} activeOpacity={0.6} accessibilityLabel="Post options" accessibilityRole="button">
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
    </SafeAreaView>
  );
}

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
