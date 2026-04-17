import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSavedVendors } from '../../hooks/useSavedVendors';
import { useSavedSearches, SavedSearch } from '../../hooks/useSavedSearches';
import {
  HeartIcon, HeartFilledIcon, SearchIcon, BellIcon, BellFilledIcon,
  XIcon, ClockIcon, UserIcon,
} from '../../components/Icons';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const CATEGORY_LABELS: Record<string, string> = {
  FOOD_TRUCK: 'Mobile Eats', DJ: 'Music', CATERING: 'Catering',
  WEDDING_SERVICES: 'Venues', PHOTOGRAPHY: 'Photography',
  ENTERTAINMENT: 'Entertainment', EXPERIENCES: 'Experiences', WELLNESS: 'Wellness', BEVERAGES: 'Beverages', ARTISTRY: 'Artistry', OTHER: 'Other',
};

type Props = NativeStackScreenProps<any, 'Wishlists'>;

export default function WishlistsScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const auth = useAuth();
  const { saved, toggle } = useSavedVendors();
  const { searches, removeSearch, toggleAlert } = useSavedSearches();
  const vendors = Array.from(saved.values());
  const [activeTab, setActiveTab] = useState<'vendors' | 'searches'>('vendors');

  function handleTapSavedSearch(search: SavedSearch) {
    (navigation as any).navigate('Explore', {
      screen: 'Search',
      params: {
        prefilledSearch: {
          query: search.query,
          category: search.category,
          maxPrice: search.maxPrice,
          minRating: search.minRating,
          eventDate: search.eventDate,
        },
      },
    });
  }

  function formatDate(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function renderVendorsTab() {
    if (vendors.length === 0) {
      return (
        <View style={s.empty}>
          <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <HeartIcon size={36} color={themeColors.textSecondary} strokeWidth={1.5} />
          </View>
          <Text style={[s.emptyTitle, { color: themeColors.text }]}>No saved vendors yet</Text>
          <Text style={[s.emptySub, { color: themeColors.textSecondary }]}>Tap the heart icon on any vendor to save them here</Text>
          <TouchableOpacity
            style={s.exploreBtn}
            onPress={() => navigation.navigate('Explore')}
            activeOpacity={0.7}
            accessibilityLabel="Start exploring"
            accessibilityRole="button"
            accessibilityHint="Browse vendors to save"
          >
            <Text style={s.exploreBtnText}>Start exploring</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={vendors}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('VendorDetail', { vendor: item })}
            accessibilityLabel={`${item.businessName}, ${item.category?.replace(/_/g, ' ')}`}
            accessibilityRole="button"
            accessibilityHint="Opens vendor detail page"
          >
            {item.coverPhoto ? (
              <Image
                source={{ uri: item.coverPhoto }}
                style={s.cardImage}
                accessibilityLabel={`${item.businessName} photo`}
                accessibilityRole="image"
              />
            ) : (
              <View style={[s.cardImage, s.cardImageFb]}>
                <Text style={s.cardImageText}>{item.businessName?.[0]}</Text>
              </View>
            )}
            <TouchableOpacity
              style={s.heartBtn}
              onPress={() => toggle(item)}
              activeOpacity={0.6}
              accessibilityLabel={`Remove ${item.businessName} from saved`}
              accessibilityRole="button"
            >
              <HeartFilledIcon size={20} color={colors.secondary} />
            </TouchableOpacity>
            <Text style={[s.cardName, { color: themeColors.text }]} numberOfLines={1}>{item.businessName}</Text>
            <Text style={[s.cardCategory, { color: themeColors.textSecondary }]}>{item.category?.replace(/_/g, ' ')}</Text>
          </TouchableOpacity>
        )}
      />
    );
  }

  function renderSearchesTab() {
    if (searches.length === 0) {
      return (
        <View style={s.empty}>
          <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <SearchIcon size={36} color={themeColors.textSecondary} strokeWidth={1.5} />
          </View>
          <Text style={[s.emptyTitle, { color: themeColors.text }]}>No saved searches yet</Text>
          <Text style={[s.emptySub, { color: themeColors.textSecondary }]}>
            Save a search from the search screen to get notified of new matches
          </Text>
          <TouchableOpacity
            style={s.exploreBtn}
            onPress={() => navigation.navigate('Explore')}
            activeOpacity={0.7}
            accessibilityLabel="Start searching"
            accessibilityRole="button"
          >
            <Text style={s.exploreBtnText}>Start searching</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={searches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.searchList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.searchCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
            activeOpacity={0.7}
            onPress={() => handleTapSavedSearch(item)}
            accessibilityLabel={`Saved search: ${item.query || 'All'}, ${CATEGORY_LABELS[item.category] || 'All categories'}`}
            accessibilityRole="button"
            accessibilityHint="Opens search with these filters"
          >
            <View style={s.searchCardLeft}>
              <View style={s.searchIconWrap}>
                <SearchIcon size={18} color={colors.primary} strokeWidth={1.5} />
              </View>
              <View style={s.searchCardInfo}>
                <Text style={[s.searchCardQuery, { color: themeColors.text }]} numberOfLines={1}>
                  {item.query || 'All vendors'}
                </Text>
                <View style={s.searchCardMeta}>
                  {item.category ? (
                    <Text style={s.searchCardTag}>
                      {CATEGORY_LABELS[item.category] || item.category}
                    </Text>
                  ) : null}
                  {item.maxPrice < 500 && (
                    <Text style={s.searchCardDetail}>Up to ${item.maxPrice}</Text>
                  )}
                  {item.minRating > 0 && (
                    <Text style={s.searchCardDetail}>{item.minRating}+ stars</Text>
                  )}
                  {item.eventDate && (
                    <View style={s.searchCardDateRow}>
                      <ClockIcon size={11} color={colors.textMuted} strokeWidth={1.5} />
                      <Text style={s.searchCardDetail}>
                        {formatDate(item.eventDate)}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={s.searchCardSavedDate}>
                  Saved {formatDate(item.savedAt)}
                </Text>
              </View>
            </View>
            <View style={s.searchCardActions}>
              <TouchableOpacity
                onPress={() => toggleAlert(item.id)}
                style={s.alertBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={item.alertsEnabled ? 'Disable alerts' : 'Enable alerts'}
                accessibilityRole="button"
              >
                {item.alertsEnabled ? (
                  <BellFilledIcon size={20} color={colors.primary} strokeWidth={1.5} />
                ) : (
                  <BellIcon size={20} color={colors.textMuted} strokeWidth={1.5} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeSearch(item.id)}
                style={s.deleteBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={`Delete saved search: ${item.query || 'All'}`}
                accessibilityRole="button"
              >
                <XIcon size={16} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <View style={s.headerSpacer} />
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Favorites</Text>
        <View style={s.headerSpacer} />
      </View>

      {/* Tab toggle */}
      <View style={[s.tabRow, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          style={[s.tab, { borderBottomColor: 'transparent' }, activeTab === 'vendors' && { borderBottomColor: themeColors.primary }]}
          onPress={() => setActiveTab('vendors')}
          activeOpacity={0.7}
          accessibilityLabel="Vendors tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'vendors' }}
        >
          <Text style={[s.tabText, { color: themeColors.textMuted }, activeTab === 'vendors' && { color: themeColors.text, fontFamily: fonts.semiBold }]}>
            Vendors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, { borderBottomColor: 'transparent' }, activeTab === 'searches' && { borderBottomColor: themeColors.primary }]}
          onPress={() => setActiveTab('searches')}
          activeOpacity={0.7}
          accessibilityLabel="Searches tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'searches' }}
        >
          <Text style={[s.tabText, { color: themeColors.textMuted }, activeTab === 'searches' && { color: themeColors.text, fontFamily: fonts.semiBold }]}>
            Searches{searches.length > 0 ? ` (${searches.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {!auth.user ? (
        <View style={s.empty}>
          <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <UserIcon size={36} color={themeColors.textSecondary} strokeWidth={1.5} />
          </View>
          <Text style={[s.emptyTitle, { color: themeColors.text }]}>Sign in to save your favorite vendors</Text>
          <Text style={[s.emptySub, { color: themeColors.textSecondary }]}>Create an account to save vendors and searches</Text>
          <TouchableOpacity
            style={s.exploreBtn}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.7}
            accessibilityLabel="Sign In"
            accessibilityRole="button"
          >
            <Text style={s.exploreBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.exploreBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary, marginTop: 12 }]}
            onPress={() => navigation.navigate('Explore')}
            activeOpacity={0.7}
            accessibilityLabel="Start exploring"
            accessibilityRole="button"
          >
            <Text style={[s.exploreBtnText, { color: colors.primary }]}>Start exploring</Text>
          </TouchableOpacity>
        </View>
      ) : (
        activeTab === 'vendors' ? renderVendorsTab() : renderSearchesTab()
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
  },
  headerSpacer: { width: 44 },

  // Tab toggle
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2 },
  tabText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted },
  _tabBtnText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  tabBtnTextActive: {
    color: colors.text,
    fontFamily: fonts.semiBold,
  },
  tabBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.white,
  },

  // Vendors tab
  list: { paddingHorizontal: 20 },
  row: { gap: 12 },
  card: { flex: 1, marginBottom: 16, position: 'relative' },
  cardImage: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12 },
  cardImageFb: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageText: { fontFamily: fonts.bold, fontSize: 24, color: colors.white },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    marginTop: 6,
  },
  cardCategory: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Searches tab
  searchList: {
    paddingHorizontal: 20,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  searchCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  searchIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCardInfo: {
    flex: 1,
  },
  searchCardQuery: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  searchCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  searchCardTag: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.primary,
    backgroundColor: colors.backgroundWarm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  searchCardDetail: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  searchCardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  searchCardSavedDate: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  searchCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  alertBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  exploreBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.white,
  },
});
