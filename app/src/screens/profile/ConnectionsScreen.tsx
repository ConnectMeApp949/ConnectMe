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

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
type Props = NativeStackScreenProps<any, 'Connections'>;

// ── Demo data ──────────────────────────────────────────────
const DEMO_FRIENDS = [
  { id: 'f1', name: 'Mia Torres', email: 'mia@example.com', avatar: null, memberSince: '2024-03-15' },
  { id: 'f2', name: 'Jordan Lee', email: 'jordan@example.com', avatar: null, memberSince: '2023-11-02' },
  { id: 'f3', name: 'Aisha Patel', email: 'aisha@example.com', avatar: null, memberSince: '2025-01-20' },
  { id: 'f4', name: 'Carlos Rivera', email: 'carlos@example.com', avatar: null, memberSince: '2024-08-07' },
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
export default function ConnectionsScreen({ navigation }: Props) {
  const { colors: themeColors, isDark } = useTheme();
  const { token } = useAuth();
  const [filter, setFilter] = useState<'all' | 'favorites' | 'friends'>('all');
  const [connections, setConnections] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Friends state
  const [friends, setFriends] = useState(DEMO_FRIENDS);
  const [friendRequests, setFriendRequests] = useState(DEMO_REQUESTS);
  const [friendSearch, setFriendSearch] = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    fetchConnections();
  }, []);

  async function fetchConnections() {
    try {
      const res = await fetch(`${API_URL}/bookings?status=COMPLETED`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
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
      setFriends(prev => [...prev, { ...req, id: `f-${Date.now()}` }]);
      setFriendRequests(prev => prev.filter(r => r.id !== id));
    }
  }

  function handleDeclineRequest(id: string) {
    setFriendRequests(prev => prev.filter(r => r.id !== id));
  }

  function handleRemoveFriend(id: string) {
    Alert.alert('Remove Friend', 'Are you sure you want to remove this friend?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setFriends(prev => prev.filter(f => f.id !== id)) },
    ]);
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

  const filteredConnections = filter === 'favorites' ? connections.filter(c => favorites.has(c.id)) : connections;

  const filteredFriends = friendSearch.trim()
    ? friends.filter(f =>
        f.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
        f.email.toLowerCase().includes(friendSearch.toLowerCase())
      )
    : friends;

  const tabs = ['all', 'favorites', 'friends'] as const;
  const tabLabels: Record<typeof tabs[number], string> = { all: 'All', favorites: 'Favorites', friends: 'Friends' };

  // ── Render helpers ─────────────────────────────────────
  function renderVendorList() {
    if (loading) {
      return (
        <View style={{ padding: 20 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={[s.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <Skeleton width={60} height={60} borderRadius={30} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="60%" height={14} />
                <Skeleton width="45%" height={12} style={{ marginTop: 6 }} />
                <Skeleton width="35%" height={12} style={{ marginTop: 6 }} />
              </View>
            </View>
          ))}
        </View>
      );
    }
    if (filteredConnections.length === 0) {
      return (
        <View style={s.empty}>
          <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <UsersIcon size={36} color={themeColors.textMuted} strokeWidth={1.5} />
          </View>
          <Text style={[s.emptyTitle, { color: themeColors.text }]}>No connections yet</Text>
          <Text style={[s.emptySub, { color: themeColors.textMuted }]}>Book a vendor to start building your network</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={filteredConnections}
        keyExtractor={i => i.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('VendorDetail', { vendor: item })}
            accessibilityLabel={`${item.businessName}, ${item.category?.replace(/_/g, ' ')}`}
            accessibilityRole="button"
            accessibilityHint="View vendor profile"
          >
            {item.coverPhoto ? (
              <Image source={{ uri: item.coverPhoto }} style={s.vendorPhoto} accessibilityLabel={`${item.businessName} photo`} accessibilityRole="image" />
            ) : (
              <View style={s.vendorPhotoFb}><Text style={s.vendorPhotoText}>{item.businessName?.[0]}</Text></View>
            )}
            <View style={s.cardContent}>
              <Text style={[s.vendorName, { color: themeColors.text }]}>{item.businessName}</Text>
              <Text style={[s.category, { color: themeColors.textMuted }]}>{item.category?.replace(/_/g, ' ')}</Text>
              <Text style={[s.bookCount, { color: themeColors.textMuted }]}>Booked {item.bookCount} time{item.bookCount > 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFav(item.id)}
              activeOpacity={0.6}
              accessibilityLabel={favorites.has(item.id) ? `Remove ${item.businessName} from favorites` : `Add ${item.businessName} to favorites`}
              accessibilityRole="button"
            >
              {favorites.has(item.id) ? <HeartFilledIcon size={22} color={colors.error} /> : <HeartIcon size={22} color={themeColors.textMuted} strokeWidth={1.5} />}
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    );
  }

  function renderFriendsList() {
    return (
      <FlatList
        data={filteredFriends}
        keyExtractor={f => f.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Search bar */}
            <View style={[s.searchBar, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <SearchIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
              <TextInput
                style={[s.searchInput, { color: themeColors.text }]}
                placeholder="Search friends by name or email"
                placeholderTextColor={themeColors.textMuted}
                value={friendSearch}
                onChangeText={setFriendSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {friendSearch.length > 0 && (
                <TouchableOpacity onPress={() => setFriendSearch('')} activeOpacity={0.6}>
                  <XIcon size={16} color={themeColors.textMuted} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            {/* Friend requests section */}
            {friendRequests.length > 0 && (
              <View style={s.requestsSection}>
                <Text style={[s.requestsHeader, { color: themeColors.text }]}>
                  Friend Requests ({friendRequests.length})
                </Text>
                {friendRequests.map(req => (
                  <View key={req.id} style={[s.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                    <View style={[s.avatar, { backgroundColor: themeColors.primary || colors.primary }]}>
                      <Text style={s.avatarText}>{getInitials(req.name)}</Text>
                    </View>
                    <View style={s.cardContent}>
                      <Text style={[s.friendName, { color: themeColors.text }]}>{req.name}</Text>
                      <Text style={[s.friendMeta, { color: themeColors.textMuted }]}>
                        Member since {formatMemberSince(req.memberSince)}
                      </Text>
                    </View>
                    <View style={s.requestActions}>
                      <TouchableOpacity
                        style={[s.acceptBtn, { backgroundColor: themeColors.primary || colors.primary }]}
                        onPress={() => handleAcceptRequest(req.id)}
                        activeOpacity={0.7}
                        accessibilityLabel={`Accept ${req.name}'s friend request`}
                        accessibilityRole="button"
                      >
                        <CheckIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.declineBtn, { borderColor: themeColors.border }]}
                        onPress={() => handleDeclineRequest(req.id)}
                        activeOpacity={0.7}
                        accessibilityLabel={`Decline ${req.name}'s friend request`}
                        accessibilityRole="button"
                      >
                        <XIcon size={16} color={themeColors.textMuted} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Add friends button */}
            <TouchableOpacity
              style={[s.addFriendsBtn, { backgroundColor: themeColors.primary || colors.primary }]}
              onPress={() => setInviteModalVisible(true)}
              activeOpacity={0.7}
              accessibilityLabel="Add friends"
              accessibilityRole="button"
            >
              <PlusIcon size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={s.addFriendsBtnText}>Add Friends</Text>
            </TouchableOpacity>

            {/* Friends list header */}
            {filteredFriends.length > 0 && (
              <Text style={[s.sectionLabel, { color: themeColors.textMuted }]}>
                Your Friends ({filteredFriends.length})
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
            activeOpacity={0.7}
            accessibilityLabel={`${item.name}, member since ${formatMemberSince(item.memberSince)}`}
            accessibilityRole="button"
          >
            <View style={[s.avatar, { backgroundColor: themeColors.primary || colors.primary }]}>
              <Text style={s.avatarText}>{getInitials(item.name)}</Text>
            </View>
            <View style={s.cardContent}>
              <Text style={[s.friendName, { color: themeColors.text }]}>{item.name}</Text>
              <Text style={[s.friendMeta, { color: themeColors.textMuted }]}>
                Member since {formatMemberSince(item.memberSince)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveFriend(item.id)}
              activeOpacity={0.6}
              style={s.removeBtn}
              accessibilityLabel={`Remove ${item.name}`}
              accessibilityRole="button"
            >
              <XIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          friendSearch.trim() ? (
            <View style={s.empty}>
              <Text style={[s.emptyTitle, { color: themeColors.text }]}>No results</Text>
              <Text style={[s.emptySub, { color: themeColors.textMuted }]}>No friends match your search</Text>
            </View>
          ) : (
            <View style={s.empty}>
              <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <UsersIcon size={36} color={themeColors.textMuted} strokeWidth={1.5} />
              </View>
              <Text style={[s.emptyTitle, { color: themeColors.text }]}>No friends yet</Text>
              <Text style={[s.emptySub, { color: themeColors.textMuted }]}>Invite friends to join ConnectMe</Text>
            </View>
          )
        }
      />
    );
  }

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
              {t === 'friends' && friendRequests.length > 0 ? ` (${friendRequests.length})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {filter === 'friends' ? renderFriendsList() : renderVendorList()}

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
