import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarIcon, StarOutlineIcon, MessageIcon, SparklesIcon, BellIcon, ChevronLeftIcon } from '../../components/Icons';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { apiHeaders } from '../../services/headers';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

type Props = NativeStackScreenProps<any, 'Notifications'>;

type IconComp = React.FC<{ size?: number; color?: string; strokeWidth?: number }>;

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const ICON_MAP: Record<string, { Icon: IconComp; iconBg: string; iconColor: string }> = {
  booking: { Icon: CalendarIcon, iconBg: colors.lightBlue, iconColor: colors.primary },
  review: { Icon: StarOutlineIcon, iconBg: '#FFF8EB', iconColor: '#AA8330' },
  message: { Icon: MessageIcon, iconBg: '#F0FFF4', iconColor: '#16A34A' },
  default: { Icon: SparklesIcon, iconBg: '#FDF2F8', iconColor: '#E31C5F' },
};

function formatNotifTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 1) return `${Math.max(1, Math.round(diffMs / 60000))}m ago`;
  if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
  if (diffHours < 168) return `${Math.round(diffHours / 24)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationsScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch(`${API_URL}/notifications`, {
          headers: apiHeaders(token),
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data ?? []);
        }
      } catch {
        // Network error; empty list shown
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  function handleNotificationPress(item: Notification) {
    setNotifications(prev =>
      prev.map(n => n.id === item.id ? { ...n, read: true } : n)
    );
    // Navigate to relevant screen based on notification type
    switch (item.type) {
      case 'booking':
        navigation.navigate('Bookings' as any);
        break;
      case 'message':
        navigation.navigate('Messages' as any);
        break;
      case 'review':
        navigation.navigate('MyReviews' as any);
        break;
      default:
        Alert.alert(item.title, item.body, [{ text: 'OK' }]);
        break;
    }
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Notifications</Text>
        <View style={s.backBtn} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const iconInfo = ICON_MAP[item.type] ?? ICON_MAP.default;
            const NotifIcon = iconInfo.Icon;
            const displayTime = item.time ? formatNotifTime(item.time) : '';
            return (
              <TouchableOpacity style={[s.notifRow, { borderBottomColor: themeColors.border }, !item.read && [s.notifUnread, { backgroundColor: themeColors.cardBackground }]]} activeOpacity={0.7} onPress={() => handleNotificationPress(item)} accessibilityLabel={`${item.title}, ${item.body}, ${displayTime}${!item.read ? ', unread' : ''}`} accessibilityRole="button" accessibilityHint="Opens notification details">
                <View style={[s.notifIconWrap, { backgroundColor: iconInfo.iconBg, borderColor: themeColors.border }]}>
                  <NotifIcon size={22} color={iconInfo.iconColor} strokeWidth={1.5} />
                </View>
                <View style={s.notifContent}>
                  <Text style={[s.notifTitle, { color: themeColors.text }, !item.read && s.notifTitleBold]}>{item.title}</Text>
                  <Text style={[s.notifBody, { color: themeColors.textMuted }]} numberOfLines={2}>{item.body}</Text>
                  <Text style={[s.notifTime, { color: themeColors.textMuted }]}>{displayTime}</Text>
                </View>
                {!item.read && <View style={s.unreadDot} />}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <BellIcon size={36} color={themeColors.textMuted} strokeWidth={1.5} />
              </View>
              <Text style={[s.emptyTitle, { color: themeColors.text }]}>No notifications</Text>
              <Text style={[s.emptySub, { color: themeColors.textMuted }]}>You're all caught up!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  notifRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'flex-start' },
  notifUnread: { backgroundColor: colors.cardBackground },
  notifIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 14, marginTop: 2, borderWidth: 1, borderColor: colors.border },
  notifContent: { flex: 1 },
  notifTitle: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  notifTitleBold: { fontFamily: fonts.bold },
  notifBody: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 3, lineHeight: 20 },
  notifTime: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 6 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginTop: 6, marginLeft: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  emptySub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 4 },
});
