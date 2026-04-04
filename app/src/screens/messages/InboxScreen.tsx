import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageIcon } from '../../components/Icons';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

type Props = NativeStackScreenProps<any, 'Inbox'>;

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

export default function InboxScreen({ navigation }: Props) {
  const [conversations, setConversations] = useState<any[]>([]);
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
      if (data.success) setConversations(data.data ?? []);
    } catch {} finally { setLoading(false); }
  }

  function renderConversation({ item }: { item: any }) {
    const name = item.otherParty?.name ?? 'Unknown';
    const avatar = item.otherParty?.avatar;
    const preview = item.lastMessage?.content ?? '';
    const truncated = preview.length > 50 ? preview.slice(0, 50) + '...' : preview;

    return (
      <TouchableOpacity style={s.item} activeOpacity={0.7} onPress={() => navigation.navigate('ChatScreen', { conversation: item })} accessibilityLabel={`Conversation with ${name}${item.unreadCount > 0 ? `, ${item.unreadCount} unread` : ''}`} accessibilityRole="button" accessibilityHint="Opens conversation">
        {avatar ? (
          <Image source={{ uri: avatar }} style={s.avatar} accessibilityLabel={`${name} profile photo`} accessibilityRole="image" />
        ) : (
          <View style={s.avatarFb}><Text style={s.avatarText}>{name[0]}</Text></View>
        )}
        <View style={s.itemContent}>
          <View style={s.itemTop}>
            <Text style={[s.name, item.unreadCount > 0 && s.nameBold]} numberOfLines={1}>{name}</Text>
            {item.lastMessage && <Text style={s.time}>{formatTime(item.lastMessage.createdAt)}</Text>}
          </View>
          <Text style={[s.preview, item.unreadCount > 0 && s.previewBold]} numberOfLines={1}>
            {truncated || 'No messages yet'}
          </Text>
        </View>
        {item.unreadCount > 0 && (
          <View style={s.badge}><Text style={s.badgeText}>{item.unreadCount}</Text></View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Text style={s.header}>Messages</Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : conversations.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIconWrap}>
            <MessageIcon size={36} color={colors.textMuted} strokeWidth={1.5} />
          </View>
          <Text style={s.emptyTitle}>No messages yet</Text>
          <Text style={s.emptySub}>When you contact a vendor or receive a booking message, it will appear here</Text>
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { fontFamily: fonts.bold, fontSize: 28, color: colors.text, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  item: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFb: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 20, color: colors.white },
  itemContent: { flex: 1, marginLeft: 12 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, flex: 1 },
  nameBold: { fontFamily: fonts.bold },
  time: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginLeft: 8 },
  preview: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 2 },
  previewBold: { color: colors.text, fontFamily: fonts.medium },
  badge: {
    minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, marginLeft: 8,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 12, color: colors.white },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 8 },
  emptySub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
