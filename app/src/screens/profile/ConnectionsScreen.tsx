import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import Skeleton from '../../components/Skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, HeartFilledIcon, HeartIcon, UsersIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
type Props = NativeStackScreenProps<any, 'Connections'>;

export default function ConnectionsScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const { token } = useAuth();
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [connections, setConnections] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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

  const filtered = filter === 'favorites' ? connections.filter(c => favorites.has(c.id)) : connections;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Connections</Text>
        <View style={s.backBtn} />
      </View>
      <View style={s.tabs}>
        {(['all', 'favorites'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tab, { borderColor: themeColors.border }, filter === t && s.tabActive]} onPress={() => setFilter(t)} activeOpacity={0.7} accessibilityLabel={t === 'all' ? 'All connections' : 'Favorite connections'} accessibilityRole="button" accessibilityState={{ selected: filter === t }}>
            <Text style={[s.tabText, { color: themeColors.text }, filter === t && s.tabTextActive]}>{t === 'all' ? 'All' : 'Favorites'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
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
      ) : filtered.length === 0 ? (
        <View style={s.empty}><View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}><UsersIcon size={36} color={themeColors.textMuted} strokeWidth={1.5} /></View><Text style={[s.emptyTitle, { color: themeColors.text }]}>No connections yet</Text><Text style={[s.emptySub, { color: themeColors.textMuted }]}>Book a vendor to start building your network</Text></View>
      ) : (
        <FlatList data={filtered} keyExtractor={i => i.id} contentContainerStyle={s.list} showsVerticalScrollIndicator={false} renderItem={({ item }) => (
          <TouchableOpacity style={[s.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]} activeOpacity={0.7} onPress={() => navigation.navigate('VendorDetail', { vendor: item })} accessibilityLabel={`${item.businessName}, ${item.category?.replace(/_/g, ' ')}`} accessibilityRole="button" accessibilityHint="View vendor profile">
            {item.coverPhoto ? <Image source={{ uri: item.coverPhoto }} style={s.vendorPhoto} accessibilityLabel={`${item.businessName} photo`} accessibilityRole="image" /> : <View style={s.vendorPhotoFb}><Text style={s.vendorPhotoText}>{item.businessName?.[0]}</Text></View>}
            <View style={s.cardContent}>
              <Text style={[s.vendorName, { color: themeColors.text }]}>{item.businessName}</Text>
              <Text style={[s.category, { color: themeColors.textMuted }]}>{item.category?.replace(/_/g, ' ')}</Text>
              <Text style={[s.bookCount, { color: themeColors.textMuted }]}>Booked {item.bookCount} time{item.bookCount > 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleFav(item.id)} activeOpacity={0.6} accessibilityLabel={favorites.has(item.id) ? `Remove ${item.businessName} from favorites` : `Add ${item.businessName} to favorites`} accessibilityRole="button">{favorites.has(item.id) ? <HeartFilledIcon size={22} color={colors.error} /> : <HeartIcon size={22} color={themeColors.textMuted} strokeWidth={1.5} />}</TouchableOpacity>
          </TouchableOpacity>
        )} />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  tabTextActive: { color: colors.white },
  list: { padding: 20 },
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
});
