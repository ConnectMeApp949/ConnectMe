import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList, ScrollView,
  TouchableOpacity, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// Using inline calendar instead of DateTimePicker
import VendorCard, { VendorCardSkeleton } from '../../components/VendorCard';
import { useVendorSearch } from '../../hooks/useVendors';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, XIcon, SearchIcon, ClockIcon, TrendingIcon, BookmarkIcon, BookmarkFilledIcon } from '../../components/Icons';
import { useSavedSearches } from '../../hooks/useSavedSearches';

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'FOOD_TRUCK', label: 'Food Trucks' },
  { id: 'DJ', label: 'DJs' },
  { id: 'CATERING', label: 'Catering' },
  { id: 'WEDDING_SERVICES', label: 'Weddings' },
  { id: 'PHOTOGRAPHY', label: 'Photography' },
  { id: 'ENTERTAINMENT', label: 'Entertainment' },
];

const RATINGS = [0, 3, 3.5, 4, 4.5];

const TRENDING_SEARCHES = [
  'Wedding DJ',
  'Food Trucks',
  'Photography',
  'Catering near me',
  'Party Entertainment',
];

const POPULAR_TERMS = [
  'Wedding DJ',
  'Food Trucks',
  'Photography',
  'Catering near me',
  'Party Entertainment',
  'Live Band',
  'Bartender',
  'Florist',
  'Event Planner',
  'Photo Booth',
];

const CATEGORY_NAMES = CATEGORIES.filter((c) => c.id !== '').map((c) => c.label);
const ALL_SEARCHABLE = [...new Set([...CATEGORY_NAMES, ...POPULAR_TERMS])];
const MAX_RECENT = 5;
const MAX_SUGGESTIONS = 5;

type Props = NativeStackScreenProps<any, 'Search'>;

// Renders matched text with the matching portion in bold
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) {
    return <Text style={suggestStyles.itemText}>{text}</Text>;
  }
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) {
    return <Text style={suggestStyles.itemText}>{text}</Text>;
  }
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <Text style={suggestStyles.itemText}>
      {before}
      <Text style={suggestStyles.itemTextBold}>{match}</Text>
      {after}
    </Text>
  );
}

export default function SearchScreen({ navigation, route }: Props) {
  const initialView = (route.params as any)?.initialView === 'map' ? 'map' : 'list';
  const prefilledSearch = (route.params as any)?.prefilledSearch;
  const inputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState(prefilledSearch?.query ?? '');
  const [committedSearch, setCommittedSearch] = useState(prefilledSearch?.query ?? '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState(prefilledSearch?.category ?? '');
  const [maxPrice, setMaxPrice] = useState(prefilledSearch?.maxPrice ?? 500);
  const [minRating, setMinRating] = useState(prefilledSearch?.minRating ?? 0);
  const [eventDate, setEventDate] = useState<Date | null>(
    prefilledSearch?.eventDate ? new Date(prefilledSearch.eventDate) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentCalMonth, setCurrentCalMonth] = useState(new Date());
  const [showCustomPrice, setShowCustomPrice] = useState(false);
  const [customPrice, setCustomPrice] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>(initialView);
  const [inputFocused, setInputFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [saveToastVisible, setSaveToastVisible] = useState(false);

  const { addSearch, hasSearch } = useSavedSearches();
  const isCurrentSearchSaved = hasSearch(committedSearch, category);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useVendorSearch({
      category: category || undefined,
      city: committedSearch || undefined,
      date: eventDate ? eventDate.toISOString() : undefined,
      maxPrice: maxPrice < 500 ? maxPrice : undefined,
      minRating: minRating > 0 ? minRating : undefined,
    });

  const vendors = data?.pages.flatMap((p) => p.vendors) ?? [];

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== term));
  }, []);

  const clearAllRecent = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const executeSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearchText(trimmed);
    setCommittedSearch(trimmed);
    addRecentSearch(trimmed);
    setInputFocused(false);
    inputRef.current?.blur();
  }, [addRecentSearch]);

  const autocompleteSuggestions = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return [];
    return ALL_SEARCHABLE
      .filter((term) => term.toLowerCase().includes(query))
      .slice(0, MAX_SUGGESTIONS);
  }, [searchText]);

  // Determine which suggestion panel to show
  const showSuggestions = inputFocused && !filtersOpen;
  const showAutocomplete = showSuggestions && searchText.trim().length > 0 && autocompleteSuggestions.length > 0;
  const showRecentAndTrending = showSuggestions && searchText.trim().length === 0;
  const showSuggestionPanel = showAutocomplete || showRecentAndTrending;

  function navigateToVendor(vendor: any) {
    navigation.navigate('VendorDetail', { vendor });
  }

  function handleSubmitEditing() {
    executeSearch(searchText);
  }

  function handleSaveSearch() {
    if (!committedSearch && !category) return;
    addSearch({
      query: committedSearch,
      category,
      maxPrice,
      minRating,
      eventDate: eventDate ? eventDate.toISOString() : null,
    });
    setSaveToastVisible(true);
    setTimeout(() => setSaveToastVisible(false), 2500);
  }

  function handleCompare() {
    const toCompare = vendors.slice(0, 3);
    navigation.navigate('CompareVendors', { vendors: toCompare });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ---- Search header ---- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search by city or vendor..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setInputFocused(true)}
            onBlur={() => {
              // Small delay to allow tap events on suggestion rows to fire
              setTimeout(() => setInputFocused(false), 150);
            }}
            onSubmitEditing={handleSubmitEditing}
            returnKeyType="search"
            accessibilityLabel="Search vendors"
            accessibilityRole="search"
            accessibilityHint="Type a city or vendor name to search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); setCommittedSearch(''); }} style={styles.clearBtn} accessibilityLabel="Clear search" accessibilityRole="button">
              <XIcon size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, filtersOpen && styles.filterBtnActive]}
          onPress={() => setFiltersOpen(!filtersOpen)}
          accessibilityLabel={filtersOpen ? 'Close filters' : 'Open filters'}
          accessibilityRole="button"
          accessibilityState={{ expanded: filtersOpen }}
        >
          <Text style={[styles.filterIcon, filtersOpen && styles.filterIconActive]}>&#x2699;</Text>
        </TouchableOpacity>
        {(committedSearch || category) && (
          <TouchableOpacity
            style={[styles.filterBtn, isCurrentSearchSaved && styles.saveSearchBtnSaved]}
            onPress={handleSaveSearch}
            disabled={isCurrentSearchSaved}
            accessibilityLabel={isCurrentSearchSaved ? 'Search already saved' : 'Save this search'}
            accessibilityRole="button"
          >
            {isCurrentSearchSaved ? (
              <BookmarkFilledIcon size={18} color={colors.primary} />
            ) : (
              <BookmarkIcon size={18} color={colors.textSecondary} strokeWidth={1.5} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ---- Suggestion panel ---- */}
      {showSuggestionPanel && (
        <View style={suggestStyles.panel}>
          {showRecentAndTrending && (
            <>
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <View style={suggestStyles.section}>
                  <View style={suggestStyles.sectionHeaderRow}>
                    <Text style={suggestStyles.sectionHeader} accessibilityRole="header">Recent</Text>
                    <TouchableOpacity
                      onPress={clearAllRecent}
                      accessibilityLabel="Clear all recent searches"
                      accessibilityRole="button"
                    >
                      <Text style={suggestStyles.clearAllText}>Clear all</Text>
                    </TouchableOpacity>
                  </View>
                  {recentSearches.map((term) => (
                    <TouchableOpacity
                      key={term}
                      style={suggestStyles.row}
                      onPress={() => executeSearch(term)}
                      activeOpacity={0.6}
                      accessibilityLabel={`Recent search: ${term}`}
                      accessibilityRole="button"
                    >
                      <ClockIcon size={18} color={colors.textMuted} strokeWidth={1.5} />
                      <Text style={suggestStyles.itemText} numberOfLines={1}>{term}</Text>
                      <TouchableOpacity
                        onPress={() => removeRecentSearch(term)}
                        style={suggestStyles.removeBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={`Remove ${term} from recent searches`}
                        accessibilityRole="button"
                      >
                        <XIcon size={14} color={colors.textMuted} strokeWidth={2} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Trending searches */}
              <View style={suggestStyles.section}>
                <Text style={suggestStyles.sectionHeader} accessibilityRole="header">Trending</Text>
                {TRENDING_SEARCHES.map((term) => (
                  <TouchableOpacity
                    key={term}
                    style={suggestStyles.row}
                    onPress={() => executeSearch(term)}
                    activeOpacity={0.6}
                    accessibilityLabel={`Trending search: ${term}`}
                    accessibilityRole="button"
                  >
                    <TrendingIcon size={18} color={colors.textMuted} strokeWidth={1.5} />
                    <Text style={suggestStyles.itemText} numberOfLines={1}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {showAutocomplete && (
            <View style={suggestStyles.section}>
              <Text style={suggestStyles.sectionHeader} accessibilityRole="header">Suggestions</Text>
              {autocompleteSuggestions.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={suggestStyles.row}
                  onPress={() => executeSearch(term)}
                  activeOpacity={0.6}
                  accessibilityLabel={`Search suggestion: ${term}`}
                  accessibilityRole="button"
                >
                  <SearchIcon size={18} color={colors.textMuted} strokeWidth={1.5} />
                  <HighlightedText text={term} query={searchText.trim()} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ---- Filters panel ---- */}
      {filtersOpen && (
        <View style={styles.filters}>
          {/* Category */}
          <Text style={styles.filterLabel}>Category</Text>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterChip, category === item.id && styles.filterChipActive]}
                onPress={() => setCategory(item.id)}
                accessibilityLabel={item.label}
                accessibilityRole="tab"
                accessibilityState={{ selected: category === item.id }}
              >
                <Text style={[styles.filterChipText, category === item.id && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* When */}
          <TouchableOpacity
            style={styles.whenRow}
            onPress={() => setShowDatePicker(!showDatePicker)}
            activeOpacity={0.6}
            accessibilityLabel={eventDate ? `Event date: ${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Select event date'}
            accessibilityRole="button"
            accessibilityHint="Opens a date picker"
          >
            <Text style={styles.whenLabel}>When</Text>
            <Text style={styles.whenValue}>
              {eventDate
                ? eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Add dates'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (() => {
            const today = new Date();
            const calMonth = currentCalMonth;
            const year = calMonth.getFullYear();
            const month = calMonth.getMonth();
            const monthLabel = calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const days: (number | null)[] = [];
            for (let i = 0; i < firstDay; i++) days.push(null);
            for (let i = 1; i <= daysInMonth; i++) days.push(i);
            while (days.length % 7 !== 0) days.push(null);

            const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSelected = (d: number) => eventDate && d === eventDate.getDate() && month === eventDate.getMonth() && year === eventDate.getFullYear();
            const isPast = (d: number) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            return (
              <View style={styles.calendar}>
                <View style={styles.calMonthRow}>
                  <TouchableOpacity onPress={() => setCurrentCalMonth(new Date(year, month - 1, 1))} activeOpacity={0.6} accessibilityLabel="Previous month" accessibilityRole="button">
                    <ChevronLeftIcon size={28} color={colors.primary} strokeWidth={1.5} />
                  </TouchableOpacity>
                  <Text style={styles.calMonthLabel}>{monthLabel}</Text>
                  <TouchableOpacity onPress={() => setCurrentCalMonth(new Date(year, month + 1, 1))} activeOpacity={0.6} accessibilityLabel="Next month" accessibilityRole="button">
                    <ChevronRightIcon size={28} color={colors.primary} strokeWidth={1.5} />
                  </TouchableOpacity>
                </View>
                <View style={styles.calWeekRow}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <Text key={d} style={styles.calWeekDay}>{d}</Text>
                  ))}
                </View>
                <View style={styles.calGrid}>
                  {days.map((day, i) => {
                    if (day === null) return <View key={i} style={styles.calCell} />;
                    const past = isPast(day);
                    const sel = isSelected(day);
                    const tod = isToday(day);
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.calCell, sel && styles.calCellSelected, tod && !sel && styles.calCellToday]}
                        onPress={() => !past && setEventDate(new Date(year, month, day))}
                        disabled={past}
                        activeOpacity={0.6}
                        accessibilityLabel={`${monthLabel.split(' ')[0]} ${day}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: !!sel, disabled: past }}
                      >
                        <Text style={[
                          styles.calDayText,
                          past && styles.calDayPast,
                          sel && styles.calDaySelected,
                          tod && !sel && styles.calDayToday,
                        ]}>{day}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {eventDate && (
                  <TouchableOpacity onPress={() => setEventDate(null)} activeOpacity={0.6} style={styles.calClear} accessibilityLabel="Clear date" accessibilityRole="button">
                    <Text style={styles.calClearText}>Clear date</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })()}

          {/* Price range */}
          <Text style={styles.filterLabel}>Max price</Text>
          <View style={styles.ratingRow}>
            {[100, 250, 500].map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.ratingChip, maxPrice === p && !showCustomPrice && styles.ratingChipActive]}
                onPress={() => { setMaxPrice(p); setShowCustomPrice(false); setCustomPrice(''); }}
                accessibilityLabel={`Max price $${p}`}
                accessibilityRole="button"
                accessibilityState={{ selected: maxPrice === p && !showCustomPrice }}
              >
                <Text style={[styles.ratingChipText, maxPrice === p && !showCustomPrice && styles.ratingChipTextActive]}>
                  ${p}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.ratingChip, showCustomPrice && styles.ratingChipActive]}
              onPress={() => setShowCustomPrice(true)}
              accessibilityLabel="Custom max price"
              accessibilityRole="button"
              accessibilityState={{ selected: showCustomPrice }}
            >
              <Text style={[styles.ratingChipText, showCustomPrice && styles.ratingChipTextActive]}>
                Other
              </Text>
            </TouchableOpacity>
          </View>
          {showCustomPrice && (
            <View style={styles.customPriceRow}>
              <Text style={styles.customPriceDollar}>$</Text>
              <TextInput
                style={styles.customPriceInput}
                value={customPrice}
                onChangeText={(t) => {
                  const cleaned = t.replace(/[^0-9]/g, '');
                  setCustomPrice(cleaned);
                  if (cleaned) setMaxPrice(parseInt(cleaned));
                }}
                placeholder="Enter amount"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                autoFocus
                maxLength={6}
                accessibilityLabel="Custom max price amount"
                accessibilityHint="Enter a custom maximum price in dollars"
              />
            </View>
          )}

          {/* Rating */}
          <Text style={styles.filterLabel}>Minimum rating</Text>
          <View style={styles.ratingRow}>
            {RATINGS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.ratingChip, minRating === r && styles.ratingChipActive]}
                onPress={() => setMinRating(r)}
                accessibilityLabel={r === 0 ? 'Any rating' : `Minimum ${r} stars`}
                accessibilityRole="button"
                accessibilityState={{ selected: minRating === r }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.ratingChipText, minRating === r && styles.ratingChipTextActive]}>
                    {r === 0 ? 'Any' : `${r}+`}
                  </Text>
                  {r > 0 && <StarIcon size={12} color={minRating === r ? colors.white : colors.star} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ---- View toggle ---- */}
      {!showSuggestionPanel && !isLoading && vendors.length > 0 && (
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.7}
            accessibilityLabel="List view"
            accessibilityRole="tab"
            accessibilityState={{ selected: viewMode === 'list' }}
          >
            <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'map' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.7}
            accessibilityLabel="Map view"
            accessibilityRole="tab"
            accessibilityState={{ selected: viewMode === 'map' }}
          >
            <Text style={[styles.viewToggleText, viewMode === 'map' && styles.viewToggleTextActive]}>Map</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ---- Results ---- */}
      {!showSuggestionPanel && (
        <>
          {isLoading ? (
            <View style={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <VendorCardSkeleton key={i} />
              ))}
            </View>
          ) : vendors.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <SearchIcon size={36} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No vendors found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your filters or search in a different area
              </Text>
            </View>
          ) : viewMode === 'map' ? (
            <ScrollView contentContainerStyle={styles.mapGrid} showsVerticalScrollIndicator={false}>
              {vendors.map((v: any) => (
                <TouchableOpacity key={v.id} style={styles.mapCard} activeOpacity={0.8} onPress={() => navigateToVendor(v)} accessibilityLabel={`${v.businessName}, $${Number(v.basePrice).toFixed(0)}, rated ${Number(v.averageRating).toFixed(1)} stars`} accessibilityRole="button" accessibilityHint="Opens vendor detail page">
                  <View style={styles.mapPin}>
                    <Text style={styles.mapPinText}>${Number(v.basePrice).toFixed(0)}</Text>
                  </View>
                  <Text style={styles.mapCardName} numberOfLines={1}>{v.businessName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}><StarIcon size={12} color={colors.star} /><Text style={styles.mapCardSub}> {Number(v.averageRating).toFixed(1)} · {v.city}</Text></View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <FlatList
              data={vendors}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <VendorCard vendor={item} onPress={() => navigateToVendor(item)} />
              )}
              onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <ActivityIndicator color={colors.primary} style={styles.loadingMore} />
                ) : null
              }
            />
          )}
        </>
      )}
      {/* Floating Compare pill */}
      {!showSuggestionPanel && !isLoading && vendors.length >= 2 && (
        <TouchableOpacity
          style={styles.comparePill}
          onPress={handleCompare}
          activeOpacity={0.8}
          accessibilityLabel="Compare vendors"
          accessibilityRole="button"
        >
          <Text style={styles.comparePillText}>Compare</Text>
        </TouchableOpacity>
      )}

      {/* Save search toast */}
      {saveToastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Search saved! We'll notify you of new matches</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const suggestStyles = StyleSheet.create({
  panel: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionHeader: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  clearAllText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  itemText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  itemTextBold: {
    fontFamily: fonts.bold,
    color: colors.text,
  },
  removeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 24,
    color: colors.text,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  clearBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  filterIconActive: {
    color: colors.white,
  },

  // Filters
  filters: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  whenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.sm,
  },
  whenLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  whenValue: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.primary,
  },
  calendar: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  calMonthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calArrow: { fontSize: 28, color: colors.primary, paddingHorizontal: 8 },
  calMonthLabel: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text },
  calWeekRow: { flexDirection: 'row', marginBottom: 4 },
  calWeekDay: {
    flex: 1, textAlign: 'center', fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted,
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: 999,
  },
  calCellSelected: { backgroundColor: colors.primary },
  calCellToday: { borderWidth: 1.5, borderColor: colors.primary },
  calDayText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  calDayPast: { color: colors.border },
  calDaySelected: { color: colors.white, fontFamily: fonts.bold },
  calDayToday: { color: colors.primary, fontFamily: fonts.bold },
  calClear: { alignItems: 'center', paddingVertical: 8 },
  calClearText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  customPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: colors.cardBackground,
  },
  customPriceDollar: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.primary,
    marginRight: 4,
  },
  customPriceInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.text,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratingChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
  ratingChipTextActive: {
    color: colors.white,
  },

  // Results grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  gridRow: {
    gap: spacing.sm,
  },
  gridContent: {
    padding: spacing.lg,
  },
  loadingMore: {
    paddingVertical: spacing.lg,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // View toggle
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewToggleBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  viewToggleText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  viewToggleTextActive: {
    color: colors.text,
    fontFamily: fonts.semiBold,
  },

  // Map view
  mapGrid: {
    padding: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mapCard: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  mapPin: {
    backgroundColor: colors.text,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  mapPinText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
  },
  mapCardName: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
  },
  mapCardSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Save search button
  saveSearchBtnSaved: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundWarm,
  },

  // Compare pill
  comparePill: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: colors.text,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  comparePillText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.white,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 80,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  toastText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.white,
  },
});
