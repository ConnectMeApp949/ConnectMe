import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarIcon, StarOutlineIcon, MessageIcon, SparklesIcon, BellIcon, ChevronLeftIcon } from '../../components/Icons';
import { colors, fonts, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<any, 'Notifications'>;

type IconComp = React.FC<{ size?: number; color?: string; strokeWidth?: number }>;

interface Notification {
  id: string;
  Icon: IconComp;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', Icon: CalendarIcon, iconBg: colors.lightBlue, iconColor: colors.primary, title: 'Booking confirmed', body: 'Your booking with DJ Alamo Beats has been confirmed for Saturday.', time: '2h ago', read: false },
  { id: '2', Icon: StarOutlineIcon, iconBg: '#FFF8EB', iconColor: '#AA8330', title: 'Leave a review', body: 'How was your experience with Alamo City Catering? Leave a review!', time: '1d ago', read: false },
  { id: '3', Icon: MessageIcon, iconBg: '#F0FFF4', iconColor: '#16A34A', title: 'New message', body: 'Taco Libre SA sent you a message about your upcoming event.', time: '2d ago', read: true },
  { id: '4', Icon: SparklesIcon, iconBg: '#FDF2F8', iconColor: '#E31C5F', title: 'Welcome to ConnectMe!', body: 'Start exploring vendors in your area and book your next event.', time: '1w ago', read: true },
];

export default function NotificationsScreen({ navigation }: Props) {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  function handleNotificationPress(item: Notification) {
    setNotifications(prev =>
      prev.map(n => n.id === item.id ? { ...n, read: true } : n)
    );
    Alert.alert(item.title, item.body, [{ text: 'OK' }]);
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        <View style={s.backBtn} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const NotifIcon = item.Icon;
          return (
            <TouchableOpacity style={[s.notifRow, !item.read && s.notifUnread]} activeOpacity={0.7} onPress={() => handleNotificationPress(item)} accessibilityLabel={`${item.title}, ${item.body}, ${item.time}${!item.read ? ', unread' : ''}`} accessibilityRole="button" accessibilityHint="Opens notification details">
              <View style={[s.notifIconWrap, { backgroundColor: item.iconBg }]}>
                <NotifIcon size={22} color={item.iconColor} strokeWidth={1.5} />
              </View>
              <View style={s.notifContent}>
                <Text style={[s.notifTitle, !item.read && s.notifTitleBold]}>{item.title}</Text>
                <Text style={s.notifBody} numberOfLines={2}>{item.body}</Text>
                <Text style={s.notifTime}>{item.time}</Text>
              </View>
              {!item.read && <View style={s.unreadDot} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconWrap}>
              <BellIcon size={36} color={colors.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={s.emptyTitle}>No notifications</Text>
            <Text style={s.emptySub}>You're all caught up!</Text>
          </View>
        }
      />
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
