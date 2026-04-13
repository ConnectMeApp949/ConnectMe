import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PlusIcon } from '../../components/Icons';

// ─── Quick reply defaults ──────────────────────────────

const DEFAULT_QUICK_REPLIES = [
  'Thanks for reaching out!',
  "I'd love to help with your event.",
  'What date are you looking at?',
  "Here's my availability...",
  'My rate for that would be...',
  "Sounds great! Let's book it.",
];

const MAX_QUICK_REPLIES = 10;

type Props = NativeStackScreenProps<any, 'ChatScreen'>;

interface Message {
  id: string;
  content: string;
  senderId: 'me' | 'them';
  createdAt: string;
}

// ─── API URL ──────────────────────────────────────────────

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

// ─── Date / time helpers ────────────────────────────────

function formatDateSeparator(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (today.getTime() - msgDay.getTime()) / 86400000,
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

// ─── Typing indicator ───────────────────────────────────

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    function animate(dot: Animated.Value, delay: number) {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );
    }

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  function dotStyle(anim: Animated.Value) {
    return {
      opacity: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
      }),
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -4],
          }),
        },
      ],
    };
  }

  return (
    <View style={s.typingRow} accessibilityLabel="Contact is typing">
      <View style={s.typingBubble}>
        <Animated.View style={[s.typingDot, dotStyle(dot1)]} />
        <Animated.View style={[s.typingDot, dotStyle(dot2)]} />
        <Animated.View style={[s.typingDot, dotStyle(dot3)]} />
      </View>
    </View>
  );
}

// ─── Render item types ──────────────────────────────────

type ListItem =
  | { type: 'message'; data: Message }
  | { type: 'separator'; label: string; id: string };

// ─── ChatScreen ─────────────────────────────────────────

export default function ChatScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const conversation = route.params?.conversation;
  const contactName: string =
    conversation?.otherParty?.name ?? 'Contact';
  const contactAvatar: string | undefined =
    conversation?.otherParty?.avatar;

  const { user, isVendorMode, token } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Fetch real messages from API
  useEffect(() => {
    async function fetchMessages() {
      try {
        const conversationId = conversation?.id;
        if (!conversationId) return;
        const res = await fetch(`${API_URL}/messages/${conversationId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
          },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setMessages(data.data);
        }
      } catch {
        // Network error — messages will remain empty
      }
    }
    fetchMessages();
  }, [conversation?.id]);

  // ─── Quick reply templates (vendor only) ────────────
  const [quickReplies, setQuickReplies] = useState<string[]>(DEFAULT_QUICK_REPLIES);

  const handleQuickReplyTap = useCallback((template: string) => {
    setInputText(template);
    inputRef.current?.focus();
  }, []);

  const handleAddQuickReply = useCallback(() => {
    if (quickReplies.length >= MAX_QUICK_REPLIES) {
      Alert.alert('Limit reached', `You can save up to ${MAX_QUICK_REPLIES} quick reply templates.`);
      return;
    }
    Alert.prompt(
      'New quick reply',
      'Enter a template message:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (value?: string) => {
            const trimmed = (value ?? '').trim();
            if (trimmed.length > 0) {
              setQuickReplies((prev) => [...prev, trimmed]);
            }
          },
        },
      ],
      'plain-text',
      '',
      'default',
    );
  }, [quickReplies.length]);

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  // ─── Send handler ───────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;

    const newMsg: Message = {
      id: `user-${Date.now()}`,
      content: text,
      senderId: 'me',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Send to API
    try {
      const conversationId = conversation?.id;
      if (conversationId) {
        await fetch(`${API_URL}/messages/${conversationId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
          },
          body: JSON.stringify({ content: text }),
        });
      }
    } catch {
      // Message displayed locally even if send fails; retry can be added later
    }
  }, [inputText, conversation?.id]);

  // ─── Build list data (with date separators, reversed for inverted list) ──

  const renderData: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];

    for (let i = 0; i < messages.length; i++) {
      if (
        i === 0 ||
        !isSameDay(messages[i].createdAt, messages[i - 1].createdAt)
      ) {
        items.push({
          type: 'separator',
          label: formatDateSeparator(messages[i].createdAt),
          id: `sep-${i}`,
        });
      }
      items.push({ type: 'message', data: messages[i] });
    }

    // Reverse so newest is at index 0 (required for inverted FlatList)
    return items.reverse();
  }, [messages]);

  // ─── Render items ─────────────────────────────────────

  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => {
      if (item.type === 'separator') {
        return (
          <View style={s.separatorRow}>
            <Text style={s.separatorText}>{item.label}</Text>
          </View>
        );
      }

      const msg = item.data;
      const isMe = msg.senderId === 'me';

      // In inverted list, index-1 is the item rendered *below* (visually above).
      // Show avatar on received messages when this is the last consecutive "them" bubble.
      const nextVisual = index > 0 ? renderData[index - 1] : null;
      const showAvatar =
        !isMe &&
        (nextVisual == null ||
          nextVisual.type === 'separator' ||
          (nextVisual.type === 'message' &&
            nextVisual.data.senderId !== 'them'));

      return (
        <View
          style={[s.messageRow, isMe ? s.messageRowMe : s.messageRowThem]}
          accessibilityRole="text"
          accessibilityLabel={`${isMe ? 'You' : contactName}: ${msg.content}. ${formatTimestamp(msg.createdAt)}`}
        >
          {!isMe && (
            <View style={s.avatarSlot}>
              {showAvatar ? (
                contactAvatar ? (
                  <Image
                    source={{ uri: contactAvatar }}
                    style={s.msgAvatar}
                    accessibilityLabel={`${contactName} avatar`}
                    accessibilityRole="image"
                  />
                ) : (
                  <View style={s.msgAvatarFb}>
                    <Text style={s.msgAvatarText}>
                      {contactName[0]}
                    </Text>
                  </View>
                )
              ) : null}
            </View>
          )}
          <View
            style={[
              s.bubble,
              isMe ? s.bubbleMe : s.bubbleThem,
            ]}
          >
            <Text
              style={[
                s.bubbleText,
                isMe ? s.bubbleTextMe : s.bubbleTextThem,
              ]}
            >
              {msg.content}
            </Text>
            <Text
              style={[
                s.timestamp,
                isMe ? s.timestampMe : s.timestampThem,
              ]}
            >
              {formatTimestamp(msg.createdAt)}
            </Text>
          </View>
        </View>
      );
    },
    [renderData, contactAvatar, contactName],
  );

  const keyExtractor = useCallback(
    (item: ListItem) =>
      item.type === 'separator' ? item.id : item.data.id,
    [],
  );

  // ─── Render ───────────────────────────────────────────

  const canSend = inputText.trim().length > 0;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={[s.header, { borderBottomColor: themeColors.border, backgroundColor: themeColors.background }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={s.backArrow}>{'\u2039'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.headerCenter}
          onPress={() => {
            if (conversation?.otherParty?.vendorId) {
              (navigation as any).navigate('Explore', { screen: 'VendorDetail', params: { vendorId: conversation.otherParty.vendorId } });
            }
          }}
          activeOpacity={0.7}
          accessibilityLabel={`View ${contactName} profile`}
          accessibilityRole="button"
        >
          {contactAvatar ? (
            <Image
              source={{ uri: contactAvatar }}
              style={s.headerAvatar}
              accessibilityLabel={`${contactName} photo`}
              accessibilityRole="image"
            />
          ) : (
            <View style={s.headerAvatarFb}>
              <Text style={s.headerAvatarText}>
                {contactName[0]}
              </Text>
            </View>
          )}
          <View style={s.headerInfo}>
            <Text style={[s.headerName, { color: themeColors.text }]} numberOfLines={1}>
              {contactName}
            </Text>
            <Text style={s.viewProfile}>View Profile</Text>
          </View>
        </TouchableOpacity>

        {/* Spacer to balance back button */}
        <View style={s.backBtn} />
      </View>

      {/* ── Messages + Input ───────────────────────────── */}
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={renderData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          inverted
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          ListHeaderComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* ── Quick replies (vendor only) ────────────────── */}
        {isVendorMode && (
          <View style={s.quickRepliesBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.quickRepliesContent}
              keyboardShouldPersistTaps="handled"
            >
              {quickReplies.map((template, idx) => (
                <TouchableOpacity
                  key={`qr-${idx}`}
                  style={s.quickReplyPill}
                  onPress={() => handleQuickReplyTap(template)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Quick reply: ${template}`}
                  accessibilityRole="button"
                >
                  <Text style={s.quickReplyText} numberOfLines={1}>
                    {template}
                  </Text>
                </TouchableOpacity>
              ))}
              {quickReplies.length < MAX_QUICK_REPLIES && (
                <TouchableOpacity
                  style={s.quickReplyAddBtn}
                  onPress={handleAddQuickReply}
                  activeOpacity={0.7}
                  accessibilityLabel="Add quick reply template"
                  accessibilityRole="button"
                >
                  <PlusIcon size={16} color={colors.primary} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}

        {/* ── Input bar ──────────────────────────────────── */}
        <View style={[s.inputBar, { borderTopColor: themeColors.border, backgroundColor: themeColors.background }]}>
          <TextInput
            ref={inputRef}
            style={[s.textInput, { backgroundColor: themeColors.cardBackground, color: themeColors.text }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            maxLength={2000}
            accessibilityLabel="Message input"
            accessibilityRole="none"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            style={[
              s.sendBtn,
              canSend ? s.sendBtnActive : s.sendBtnDisabled,
            ]}
            accessibilityLabel="Send message"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSend }}
          >
            <Text
              style={[
                s.sendIcon,
                canSend ? s.sendIconActive : s.sendIconDisabled,
              ]}
            >
              {'\u27A4'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: '600',
    marginTop: -2,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  headerAvatarFb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
  },
  headerInfo: { marginLeft: spacing.sm },
  headerName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  viewProfile: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.accent,
  },

  // Message list
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // Date separators
  separatorRow: { alignItems: 'center', marginVertical: spacing.md },
  separatorText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },

  // Message rows
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowThem: { justifyContent: 'flex-start' },

  avatarSlot: { width: 28, marginRight: spacing.xs },
  msgAvatar: { width: 28, height: 28, borderRadius: 14 },
  msgAvatarFb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.white,
  },

  // Bubbles
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  bubbleThem: {
    backgroundColor: colors.cardBackground,
    borderBottomLeftRadius: spacing.xs,
  },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextMe: { fontFamily: fonts.regular, color: colors.white },
  bubbleTextThem: { fontFamily: fonts.regular, color: colors.text },
  timestamp: { fontSize: 10, marginTop: spacing.xs },
  timestampMe: {
    fontFamily: fonts.regular,
    color: colors.white,
    opacity: 0.7,
    textAlign: 'right',
  },
  timestampThem: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'left',
  },

  // Typing indicator
  typingRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing.xs,
    paddingLeft: 28 + spacing.xs,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: spacing.xs,
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },

  // Quick replies
  quickRepliesBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  quickRepliesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  quickReplyPill: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    maxWidth: 220,
  },
  quickReplyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
  },
  quickReplyAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sendBtnActive: { backgroundColor: colors.primary },
  sendBtnDisabled: { backgroundColor: colors.cardBackground },
  sendIcon: { fontSize: 18 },
  sendIconActive: { color: colors.white },
  sendIconDisabled: { color: colors.textMuted },
});
