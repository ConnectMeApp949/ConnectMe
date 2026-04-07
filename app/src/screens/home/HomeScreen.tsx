import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import VendorCard, { VendorCardSkeleton } from '../../components/VendorCard';
import { useVendorSearch } from '../../hooks/useVendors';
import { useAuth } from '../../context/AuthContext';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { useLanguage } from '../../context/LanguageContext';
import { TrendingIcon, TruckIcon, MusicIcon, UtensilsIcon, RingsIcon, ApertureIcon, SparklesIcon, BellIcon, MapIcon, SearchIcon, CalendarIcon, ChevronRightIcon } from '../../components/Icons';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import NotificationPrompt from '../../components/NotificationPrompt';
import RateAppPrompt from '../../components/RateAppPrompt';

const CATEGORIES = [
  { id: '', label: 'All', Icon: TrendingIcon },
  { id: 'FOOD_TRUCK', label: 'Food Trucks', Icon: TruckIcon },
  { id: 'DJ', label: 'Event Entertainment', Icon: MusicIcon },
  { id: 'CATERING', label: 'Catering', Icon: UtensilsIcon },
  { id: 'WEDDING_SERVICES', label: 'Weddings', Icon: RingsIcon },
  { id: 'PHOTOGRAPHY', label: 'Photography', Icon: ApertureIcon },
  { id: 'ENTERTAINMENT', label: 'Entertainment', Icon: SparklesIcon },
];

type Props = NativeStackScreenProps<any, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const auth = useAuth();
  const { t } = useLanguage();
  const { recentlyViewed } = useRecentlyViewed();
  const [activeCategory, setActiveCategory] = React.useState('');

  const featured = useVendorSearch({ city: 'San Antonio' });
  const recent = useVendorSearch({
    category: activeCategory || undefined,
    city: 'San Antonio',
  });

  const featuredVendors = featured.data?.pages.flatMap((p) => p.vendors) ?? [];
  const recentVendors = recent.data?.pages.flatMap((p) => p.vendors) ?? [];
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([featured.refetch(), recent.refetch()]);
    setRefreshing(false);
  }, [featured, recent]);

  function navigateToVendor(vendor: any) {
    navigation.navigate('VendorDetail', { vendor });
  }

  // Use FlatList as the root scroller — renders the entire page as list items
  // This avoids the nested ScrollView problem entirely
  // Group vendors into pairs for 2-column grid
  const vendorRows: any[][] = [];
  for (let i = 0; i < recentVendors.length; i += 2) {
    vendorRows.push(recentVendors.slice(i, i + 2));
  }

  const sections = [
    { key: 'header' },
    { key: 'notification_prompt' },
    { key: 'search' },
    { key: 'chips' },
    { key: 'plan_event' },
    { key: 'featured_title' },
    { key: 'featured' },
    ...(recentlyViewed.length > 0 ? [
      { key: 'recently_viewed_title' },
      { key: 'recently_viewed' },
    ] : []),
    { key: 'recent_title' },
    ...vendorRows.map((row, i) => ({ key: `vendor_row_${i}`, vendorRow: row })),
    ...(recentVendors.length === 0 && !recent.isLoading ? [{ key: 'empty' }] : []),
    ...(recent.isLoading ? [{ key: 'loading' }] : []),
    { key: 'spacer' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        onEndReached={() => { if (recent.hasNextPage) recent.fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => {
          switch (item.key) {
            case 'header':
              return (
                <View style={styles.topBar}>
                  <Image
                    source={require('../../assets/connectme-logo.png')}
                    style={styles.headerLogo}
                    resizeMode="contain"
                    accessibilityLabel="ConnectMe logo"
                    accessibilityRole="image"
                  />
                  <TouchableOpacity
                    style={styles.bellBtn}
                    onPress={() => navigation.navigate('Notifications')}
                    activeOpacity={0.6}
                    accessibilityLabel="Notifications"
                    accessibilityRole="button"
                    accessibilityHint="Opens your notifications"
                  >
                    <BellIcon size={22} color={colors.text} strokeWidth={1.5} />
                  </TouchableOpacity>
                </View>
              );

            case 'notification_prompt':
              return <NotificationPrompt />;

            case 'search':
              return (
                <TouchableOpacity
                  style={styles.searchBar}
                  onPress={() => navigation.navigate('Search')}
                  activeOpacity={0.8}
                  accessibilityLabel="Search vendors"
                  accessibilityRole="search"
                  accessibilityHint="Opens the vendor search screen"
                >
                  <View style={styles.searchIconWrap}>
                    <SearchIcon size={18} color={colors.textMuted} />
                  </View>
                  <View style={styles.searchTextWrap}>
                    <Text style={styles.searchTitle}>Where to?</Text>
                    <Text style={styles.searchSubtitle}>Search vendors · Any date</Text>
                  </View>
                </TouchableOpacity>
              );

            case 'plan_event':
              return (
                <TouchableOpacity
                  style={styles.planEventCard}
                  onPress={() => navigation.navigate('EventPlanner')}
                  activeOpacity={0.7}
                  accessibilityLabel="Plan an event"
                  accessibilityRole="button"
                  accessibilityHint="Opens the event planner to organize vendors for your event"
                >
                  <View style={styles.planEventIconWrap}>
                    <CalendarIcon size={22} color={colors.primary} />
                  </View>
                  <View style={styles.planEventText}>
                    <Text style={styles.planEventTitle}>Plan an Event</Text>
                    <Text style={styles.planEventSub}>Organize vendors, budgets, and checklists</Text>
                  </View>
                  <ChevronRightIcon size={20} color={colors.textMuted} />
                </TouchableOpacity>
              );

            case 'chips':
              return (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                >
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const CatIcon = cat.Icon;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={styles.chip}
                        onPress={() => setActiveCategory(cat.id)}
                        accessibilityLabel={cat.label}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isActive }}
                        accessibilityHint={`Filter vendors by ${cat.label}`}
                      >
                        <View style={[styles.chipIconWrap, isActive && styles.chipIconWrapActive]}>
                          <CatIcon size={22} color={isActive ? colors.white : colors.textMuted} strokeWidth={isActive ? 2 : 1.5} />
                        </View>
                        <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                          {cat.label}
                        </Text>
                        {isActive && <View style={styles.chipUnderline} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              );

            case 'featured_title':
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t('featuredVendors')}</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Search', { filter: 'featured' })}
                    accessibilityLabel="See all featured vendors"
                    accessibilityRole="link"
                  >
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
              );

            case 'featured':
              if (featured.isLoading) {
                return (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
                    {[1, 2, 3].map((i) => <VendorCardSkeleton key={i} variant="featured" />)}
                  </ScrollView>
                );
              }
              if (featuredVendors.length === 0) {
                return <Text style={[styles.emptyText, { marginLeft: spacing.lg }]}>No featured vendors yet</Text>;
              }
              return (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
                  {featuredVendors.slice(0, 10).map((v) => (
                    <View key={v.id} style={styles.featuredCardWrap}>
                      <VendorCard vendor={v} onPress={() => navigateToVendor(v)} variant="featured" />
                    </View>
                  ))}
                </ScrollView>
              );

            case 'recently_viewed_title':
              return (
                <View style={styles.sectionHeader} accessibilityRole="header">
                  <Text style={styles.sectionTitle}>
                    {t('recentlyViewed')} ({recentlyViewed.length})
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Search', { filter: 'recent' })}
                    accessibilityLabel="See all recently viewed"
                    accessibilityRole="link"
                  >
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
              );

            case 'recently_viewed':
              return (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredRow}
                  accessibilityLabel={`Recently viewed vendors, ${recentlyViewed.length} items`}
                  accessibilityRole="list"
                >
                  {recentlyViewed.map((v) => (
                    <View key={v.id} style={styles.featuredCardWrap} accessibilityRole="none">
                      <VendorCard vendor={v} onPress={() => navigateToVendor(v)} variant="featured" />
                    </View>
                  ))}
                </ScrollView>
              );

            case 'recent_title':
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t('recentlyAdded')}</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Search')}
                    accessibilityLabel="See all recently added"
                    accessibilityRole="link"
                  >
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
              );

            case 'empty':
              return <Text style={[styles.emptyText, { textAlign: 'center', marginTop: 40 }]}>No vendors found</Text>;

            case 'loading':
              return (
                <View style={[styles.grid, { paddingHorizontal: spacing.lg }]}>
                  {[1, 2, 3, 4].map((i) => <VendorCardSkeleton key={i} />)}
                </View>
              );

            case 'spacer':
              return <View style={{ height: 100 }} />;

            default:
              // Vendor card row (2 columns)
              if ((item as any).vendorRow) {
                const row = (item as any).vendorRow as any[];
                return (
                  <View style={styles.vendorRow}>
                    {row.map((v: any) => (
                      <View key={v.id} style={styles.vendorCol}>
                        <VendorCard vendor={v} onPress={() => navigateToVendor(v)} />
                      </View>
                    ))}
                    {row.length === 1 && <View style={styles.vendorCol} />}
                  </View>
                );
              }
              return null;
          }
        }}
      />

      {/* ─── Floating Map button ─── */}
      <TouchableOpacity
        style={styles.mapFab}
        onPress={() => navigation.navigate('Search', { initialView: 'map' })}
        activeOpacity={0.8}
        accessibilityLabel="Map"
        accessibilityRole="button"
        accessibilityHint="Opens search screen in map view"
      >
        <MapIcon size={16} color={colors.white} strokeWidth={2} />
        <Text style={styles.mapFabText}>{t('map')}</Text>
      </TouchableOpacity>

      {/* ─── Rate the App prompt ─── */}
      <RateAppPrompt onNavigateToHelp={() => navigation.navigate('Profile', { screen: 'GetHelp' })} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* ─── Top bar ──────────────────────────────────── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.white,
  },

  /* ─── Search bar (Airbnb pill) ─────────────────── */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: spacing.sm,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIconWrap: {
    marginRight: 14,
  },
  searchTextWrap: {
    flexShrink: 1,
  },
  searchTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  searchSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
    lineHeight: 16,
  },

  /* ─── Category chips (tab-style) ───────────────── */
  chipRow: {
    paddingHorizontal: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 20,
  },
  chip: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
  },
  chipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBackground,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipIconWrapActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  chipLabelActive: {
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  chipUnderline: {
    marginTop: 6,
    height: 2,
    width: '100%',
    backgroundColor: colors.text,
    borderRadius: 1,
  },

  /* ─── Section headers ──────────────────────────── */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: spacing.md,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  seeAll: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },

  /* ─── Featured row ─────────────────────────────── */
  featuredRow: {
    paddingHorizontal: 20,
    gap: spacing.md,
  },
  featuredCardWrap: {
    marginRight: 4,
  },

  /* ─── Vendor grid ──────────────────────────────── */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  vendorRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: spacing.md,
    marginBottom: 4,
  },
  vendorCol: {
    flex: 1,
  },

  /* ─── Empty state ──────────────────────────────── */
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    paddingVertical: spacing.xl,
  },

  /* ─── Floating map FAB ─────────────────────────── */
  mapFab: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: borderRadius.full,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mapFabIcon: {
    fontSize: 16,
  },
  mapFabText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.white,
    letterSpacing: 0.3,
  },

  /* ─── Plan Event card ─────────────────────────── */
  planEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.backgroundWarm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planEventIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  planEventText: {
    flex: 1,
  },
  planEventTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  planEventSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
