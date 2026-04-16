import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert,
  TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import Skeleton from '../../components/Skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import {
  ChevronLeftIcon, HeartFilledIcon, HeartIcon, UsersIcon,
  SearchIcon, XIcon, PlusIcon, CheckIcon, MailIcon,
} from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiHeaders } from '../../services/headers';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
type Props = NativeStackScreenProps<any, 'Connections'>;

// ── Demo data ──────────────────────────────────────────────
const DEMO_FOLLOWERS = [
  { id: 'fl1', name: 'Mia Torres', email: 'mia@example.com', avatar: null, memberSince: '2024-03-15' },
  { id: 'fl2', name: 'Jordan Lee', email: 'jordan@example.com', avatar: null, memberSince: '2023-11-02' },
  { id: 'fl3', name: 'Aisha Patel', email: 'aisha@example.com', avatar: null, memberSince: '2025-01-20' },
  { id: 'fl4', name: 'Carlos Rivera', email: 'carlos@example.com', avatar: null, memberSince: '2024-08-07' },
  { id: 'fl5', name: 'Nicole Brown', email: 'nicole@example.com', avatar: null, memberSince: '2024-06-12' },
  { id: 'fl6', name: 'Derek Hall', email: 'derek@example.com', avatar: null, memberSince: '2025-02-28' },
  { id: 'fl7', name: 'Emily Cooper', email: 'emily@example.com', avatar: null, memberSince: '2024-09-15' },
  { id: 'fl8', name: 'Tom Williams', email: 'tom@example.com', avatar: null, memberSince: '2024-11-20' },
  { id: 'fl9', name: 'Rachel Adams', email: 'rachel@example.com', avatar: null, memberSince: '2025-01-05' },
  { id: 'fl10', name: 'Mike Johnson', email: 'mike@example.com', avatar: null, memberSince: '2024-07-22' },
  { id: 'fl11', name: 'Lisa Martinez', email: 'lisa@example.com', avatar: null, memberSince: '2024-04-08' },
  { id: 'fl12', name: 'Sarah Mitchell', email: 'sarah@example.com', avatar: null, memberSince: '2025-03-10' },
];

const DEMO_FOLLOWING = [
  { id: 'fw1', name: 'Jessica Lee', email: 'jessica@example.com', avatar: null, memberSince: '2023-11-02' },
  { id: 'fw2', name: 'Carlos Ruiz', email: 'cruiz@example.com', avatar: null, memberSince: '2024-05-18' },
  { id: 'fw3', name: 'Ana Flores', email: 'ana@example.com', avatar: null, memberSince: '2024-08-07' },
  { id: 'fw4', name: 'Katie Wilson', email: 'katie@example.com', avatar: null, memberSince: '2024-01-14' },
  { id: 'fw5', name: 'David Chen', email: 'david@example.com', avatar: null, memberSince: '2025-02-10' },
  { id: 'fw6', name: 'Marcus Rivera', email: 'marcus@example.com', avatar: null, memberSince: '2024-12-01' },
  { id: 'fw7', name: 'Ashley Thompson', email: 'ashley@example.com', avatar: null, memberSince: '2024-10-03' },
  { id: 'fw8', name: 'James Cooper', email: 'james@example.com', avatar: null, memberSince: '2025-01-20' },
];

const DEMO_REQUESTS = [
  { id: 'r1', name: 'Samantha Chen', email: 'sam@example.com', avatar: null, memberSince: '2025-02-10' },
  { id: 'r2', name: 'Darnell Williams', email: 'darnell@example.com', avatar: null, memberSince: '2024-12-01' },
];

function formatMemberSince(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0].toUpperCase();
}

// ── Component ──────────────────────────────────────────────
export default function ConnectionsScreen({ navigation, route }: Props) {
  const { colors: themeColors, isDark } = useTheme();
  const { token } = useAuth();
  const initialTab = (route.params as any)?.tab ?? 'followers';
  const [filter, setFilter] = useState<'followers' | 'following' | 'requests'>(initialTab);
  const [connections, setConnections] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Followers / Following state
  const [followers, setFollowers] = useState(DEMO_FOLLOWERS);
  const [following, setFollowing] = useState(DEMO_FOLLOWING);
  const [friendRequests, setFriendRequests] = useState(DEMO_REQUESTS);
  const [searchText, setSearchText] = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    fetchConnections();
  }, []);

  async function fetchConnections() {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_URL}/bookings?status=COMPLETED`, {
        headers: apiHeaders(token),
      });
      const data = await res.json();
      if (data.success) {
        const vendorMap = new Map<string, any>();
        (data.data ?? []).forEach((b: any) => {
          const id = b.vendor?.id;
          if (id && !vendorMap.has(id)) {
            vendorMap.set(id, { ...b.vendor, bookCount: 1 });
          } else if (id) {
            vendorMap.get(id).bookCount++;
          }
        });
        setConnections(Array.from(vendorMap.values()));
      }
    } catch {
      Alert.alert('Error', 'Unable to load connections. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleFav(id: string) {
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handleAcceptRequest(id: string) {
    const req = friendRequests.find(r => r.id === id);
    if (req) {
      setFollowers(prev => [...prev, { ...req, id: `fl-${Date.now()}` }]);
      setFriendRequests(prev => prev.filter(r => r.id !== id));
    }
  }

  function handleDeclineRequest(id: string) {
    setFriendRequests(prev => prev.filter(r => r.id !== id));
  }

  function handleSendInvite() {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    Alert.alert('Invite Sent', `An invitation has been sent to ${inviteEmail.trim()}.`);
    setInviteEmail('');
    setInviteModalVisible(false);
  }

  const currentList = filter === 'followers' ? followers : following;
  const filteredList = searchText.trim()
    ? currentList.filter(f =>
        f.name.toLowerCase().includes(searchText.toLowerCase()) ||
        f.email.toLowerCase().includes(searchText.toLowerCase())
      )
    : currentList;

  const tabs = ['followers', 'following', 'requests'] as const;
  const tabLabels: Record<typeof tabs[number], string> = {
    followers: `Followers (${followers.length})`,
    following: `Following (${following.length})`,
    requests: `Requests${friendRequests.length > 0 ? ` (${friendRequests.length})` : ''}`,
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Connections</Text>
        <View style={s.backBtn} />
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t}
            style={[
              s.tab,
              { borderColor: themeColors.border },
              filter === t && [s.tabActive, { backgroundColor: themeColors.primary || colors.primary, borderColor: themeColors.primary || colors.primary }],
            ]}
            onPress={() => setFilter(t)}
            activeOpacity={0.7}
            accessibilityLabel={`${tabLabels[t]} tab`}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === t }}
          >
            <Text style={[s.tabText, { color: themeColors.text }, filter === t && s.tabTextActive]}>
              {tabLabels[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {filter === 'requests' ? (
        <FlatList
          data={friendRequests}
          keyExtractor={r => r.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[s.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <View style={[s.avatar, { backgroundColor: themeColors.primary }]}>
                <Text style={s.avatarText}>{getInitials(item.name)}</Text>
              </View>
              <View style={s.cardContent}>
                <Text style={[s.friendName, { color: themeColors.text }]}>{item.name}</Text>
                <Text style={[s.friendMeta, { color: themeColors.textMuted }]}>
                  Wants to connect with you
                </Text>
              </View>
              <View style={s.requestActions}>
                <TouchableOpacity
                  style={[s.acceptBtn, { backgroundColor: themeColors.primary }]}
                  onPress={() => handleAcceptRequest(item.id)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Accept ${item.name}'s request`}
                  accessibilityRole="button"
                >
                  <CheckIcon size={16} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.declineBtn, { borderColor: themeColors.border }]}
                  onPress={() => handleDeclineRequest(item.id)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Decline ${item.name}'s request`}
                  accessibilityRole="button"
                >
                  <XIcon size={16} color={themeColors.textMuted} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <UsersIcon size={36} color={themeColors.textMuted} strokeWidth={1.5} />
              </View>
              <Text style={[s.emptyTitle, { color: themeColors.text }]}>No pending requests</Text>
              <Text style={[s.emptySub, { color: themeColors.textMuted }]}>Friend and vendor requests will appear here</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={f => f.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[s.searchBar, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <SearchIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
              <TextInput
                style={[s.searchInput, { color: themeColors.text }]}
                placeholder={`Search ${filter}...`}
                placeholderTextColor={themeColors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')} activeOpacity={0.6}>
                  <XIcon size={16} color={themeColors.textMuted} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View style={[s.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <View style={[s.avatar, { backgroundColor: themeColors.primary }]}>
                <Text style={s.avatarText}>{getInitials(item.name)}</Text>
              </View>
              <View style={s.cardContent}>
                <Text style={[s.friendName, { color: themeColors.text }]}>{item.name}</Text>
                <Text style={[s.friendMeta, { color: themeColors.textMuted }]}>
                  Member since {formatMemberSince(item.memberSince)}
                </Text>
              </View>
              {filter === 'following' && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Unfollow', `Are you sure you want to unfollow ${item.name}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Unfollow', style: 'destructive', onPress: () => setFollowing(prev => prev.filter(f => f.id !== item.id)) },
                    ]);
                  }}
                  activeOpacity={0.6}
                  style={[s.followBtn, { borderColor: themeColors.border }]}
                  accessibilityLabel={`Unfollow ${item.name}`}
                  accessibilityRole="button"
                >
                  <Text style={[s.followBtnText, { color: themeColors.textMuted }]}>Following</Text>
                </TouchableOpacity>
              )}
              {filter === 'followers' && (
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[s.followBtn, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]}
                  accessibilityLabel={`Follow ${item.name} back`}
                  accessibilityRole="button"
                >
                  <Text style={[s.followBtnText, { color: '#fff' }]}>Follow</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <UsersIcon size={36} color={themeColors.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={[s.emptyTitle, { color: themeColors.text }]}>
              {searchText.trim() ? 'No results' : filter === 'followers' ? 'No followers yet' : 'Not following anyone'}
            </Text>
            <Text style={[s.emptySub, { color: themeColors.textMuted }]}>
              {searchText.trim() ? 'Try a different search' : filter === 'followers' ? 'Share your profile to get followers' : 'Explore and follow people you know'}
            </Text>
          </View>
        }
      />
      )}

      {/* Invite modal */}
      <Modal
        visible={inviteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setInviteModalVisible(false)}>
            <TouchableOpacity activeOpacity={1} style={[s.modalContent, { backgroundColor: themeColors.cardBackground }]}>
              <View style={s.modalHeader}>
                <Text style={[s.modalTitle, { color: themeColors.text }]}>Invite a Friend</Text>
                <TouchableOpacity onPress={() => setInviteModalVisible(false)} activeOpacity={0.6}>
                  <XIcon size={22} color={themeColors.textMuted} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <Text style={[s.modalDesc, { color: themeColors.textMuted }]}>
                Enter their email address and we'll send an invitation to join ConnectMe.
              </Text>
              <View style={[s.modalInputWrap, { borderColor: themeColors.border, backgroundColor: themeColors.background }]}>
                <MailIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
                <TextInput
                  style={[s.modalInput, { color: themeColors.text }]}
                  placeholder="friend@example.com"
                  placeholderTextColor={themeColors.textMuted}
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                style={[s.sendInviteBtn, { backgroundColor: themeColors.primary || colors.primary }]}
                onPress={handleSendInvite}
                activeOpacity={0.7}
              >
                <Text style={s.sendInviteBtnText}>Send Invite</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  tabTextActive: { color: colors.white },
  list: { padding: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  vendorPhoto: { width: 60, height: 60, borderRadius: 30 },
  vendorPhotoFb: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  vendorPhotoText: { fontFamily: fonts.bold, fontSize: 22, color: colors.white },
  cardContent: { flex: 1, marginLeft: 12 },
  vendorName: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  category: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  bookCount: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  emptySub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 4 },

  // Friends-specific styles
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, marginLeft: 10, paddingVertical: 0 },
  requestsSection: { marginBottom: 16 },
  requestsHeader: { fontFamily: fonts.semiBold, fontSize: 16, marginBottom: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 17, color: colors.white },
  friendName: { fontFamily: fonts.semiBold, fontSize: 15 },
  friendMeta: { fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  declineBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  removeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  followBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  followBtnText: { fontFamily: fonts.semiBold, fontSize: 13 },
  addFriendsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, marginBottom: 20, gap: 8 },
  addFriendsBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: '#FFFFFF' },
  sectionLabel: { fontFamily: fonts.medium, fontSize: 13, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Invite modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', borderRadius: 16, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontFamily: fonts.bold, fontSize: 20 },
  modalDesc: { fontFamily: fonts.regular, fontSize: 14, marginBottom: 20, lineHeight: 20 },
  modalInputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16 },
  modalInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, marginLeft: 10, paddingVertical: 0 },
  sendInviteBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  sendInviteBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: '#FFFFFF' },
});
