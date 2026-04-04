import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { MessageIcon } from '../../components/Icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api-production-dda7.up.railway.app';

interface Conversation {
  bookingId: string;
  bookingStatus: string;
  eventType: string;
  eventDate: string;
  otherParty: { name: string; avatar: string | null };
  lastMessage: { content: string; senderName: string; createdAt: string } | null;
  unreadCount: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: colors.warning,
  CONFIRMED: colors.success,
  COMPLETED: colors.primary,
  CANCELLED: colors.textMuted,
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return `${Math.max(1, Math.round(diffMs / 60000))}m ago`;
  if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
  if (diffHours < 168) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type Props = NativeStackScreenProps<any, 'Messages'>;

export default function MessagesScreen({ navigation }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      const res = await fetch(`${API_URL}/messages`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) setConversations(data.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  function renderConversation({ item }: { item: Conversation }) {
    const preview = item.lastMessage?.content ?? '';
    const truncated = preview.length > 60 ? preview.slice(0, 60) + '...' : preview;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('ChatScreen', { bookingId: item.bookingId })}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.otherParty.avatar ? (
            <Image source={{ uri: item.otherParty.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{item.otherParty.name[0]}</Text>
            </View>
          )}
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.itemContent}>
          <View style={styles.itemTop}>
            <Text style={[styles.name, item.unreadCount > 0 && styles.nameBold]} numberOfLines={1}>
              {item.otherParty.name}
            </Text>
            {item.lastMessage && (
              <Text style={styles.time}>{formatTime(item.lastMessage.createdAt)}</Text>
            )}
          </View>
          <Text style={[styles.preview, item.unreadCount > 0 && styles.previewUnread]} numberOfLines={1}>
            {truncated || 'No messages yet'}
          </Text>
          <View style={[styles.statusChip, { backgroundColor: STATUS_COLORS[item.bookingStatus] ?? colors.textMuted }]}>
            <Text style={styles.statusText}>{item.bookingStatus}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Messages</Text>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Messages</Text>

      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <MessageIcon size={36} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>Messages from your bookings will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.bookingId}
          renderItem={renderConversation}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    fontFamily: fonts.bold, fontSize: 28, color: colors.text,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  loader: { marginTop: spacing.xxl },
  item: {
    flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  avatarContainer: { position: 'relative', marginRight: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 20, color: colors.white },
  badge: {
    position: 'absolute', top: -2, right: -2, minWidth: 20, height: 20,
    borderRadius: 10, backgroundColor: colors.error,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.white },
  itemContent: { flex: 1 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, flex: 1 },
  nameBold: { fontFamily: fonts.bold },
  time: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginLeft: spacing.sm },
  preview: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 2 },
  previewUnread: { color: colors.text, fontFamily: fonts.medium },
  statusChip: {
    alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: borderRadius.sm, marginTop: spacing.xs,
  },
  statusText: { fontFamily: fonts.medium, fontSize: 11, color: colors.white },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: spacing.md },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  emptySubtitle: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
});
