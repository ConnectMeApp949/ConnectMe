import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFeed } from '../../context/FeedContext';
import { fonts, spacing, borderRadius } from '../../theme';
import {
  XIcon,
  ImageIcon,
  MapPinIcon,
  UserIcon,
  PlusIcon,
  SearchIcon,
} from '../../components/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_CAPTION = 2000;
const MAX_IMAGES = 5;
const MAX_TAGS = 5;

// Demo vendors and friends for searching
const DEMO_VENDORS = [
  'AlamoCityCatering',
  'DJAlamoBeats',
  'TacoLibreSA',
  'BloomSA',
  'SAPhotoStudio',
  'EventVibesSA',
  'SAPlanners',
  'FiestaDecorSA',
  'LoneStarBands',
  'RiverCityDJs',
];

const DEMO_FRIENDS = [
  'Mike Johnson',
  'Jessica Lee',
  'Carlos Ruiz',
  'Ana Flores',
  'Emily Cooper',
  'Nicole Brown',
  'Katie Wilson',
  'Derek Hall',
  'Rachel Adams',
  'Tom Williams',
];

// ─── Tag Chip ───────────────────────────────────────────

function TagChip({
  label,
  onRemove,
  themeColors,
}: {
  label: string;
  onRemove: () => void;
  themeColors: any;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: themeColors.primary + '20', borderColor: themeColors.primary + '40' }]}>
      <Text style={[styles.chipText, { color: themeColors.primary }]}>@{label}</Text>
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={`Remove ${label}`}
        accessibilityRole="button"
      >
        <XIcon size={14} color={themeColors.primary} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Tag Section ────────────────────────────────────────

function TagSection({
  title,
  icon,
  tags,
  onRemoveTag,
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectResult,
  maxTags,
  themeColors,
}: {
  title: string;
  icon: React.ReactNode;
  tags: string[];
  onRemoveTag: (tag: string) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  searchResults: string[];
  onSelectResult: (result: string) => void;
  maxTags: number;
  themeColors: any;
}) {
  return (
    <View style={[styles.tagSection, { borderBottomColor: themeColors.border }]}>
      <View style={styles.tagSectionHeader}>
        {icon}
        <Text style={[styles.tagSectionTitle, { color: themeColors.text }]}>{title}</Text>
        <Text style={[styles.tagCount, { color: themeColors.textMuted }]}>
          {tags.length}/{maxTags}
        </Text>
      </View>

      {tags.length > 0 && (
        <View style={styles.chipRow}>
          {tags.map((tag) => (
            <TagChip key={tag} label={tag} onRemove={() => onRemoveTag(tag)} themeColors={themeColors} />
          ))}
        </View>
      )}

      {tags.length < maxTags && (
        <View style={[styles.tagSearchRow, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <SearchIcon size={16} color={themeColors.textMuted} strokeWidth={1.5} />
          <TextInput
            style={[styles.tagSearchInput, { color: themeColors.text }]}
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder={`Search ${title.toLowerCase()}...`}
            placeholderTextColor={themeColors.textMuted}
            accessibilityLabel={`Search ${title.toLowerCase()}`}
          />
        </View>
      )}

      {searchQuery.length > 0 && searchResults.length > 0 && (
        <View style={[styles.searchResults, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          {searchResults.map((result) => (
            <TouchableOpacity
              key={result}
              style={[styles.searchResultItem, { borderBottomColor: themeColors.border }]}
              onPress={() => onSelectResult(result)}
              activeOpacity={0.6}
              accessibilityLabel={`Tag ${result}`}
              accessibilityRole="button"
            >
              <View style={[styles.searchResultAvatar, { backgroundColor: themeColors.primary }]}>
                <Text style={styles.searchResultAvatarText}>{result[0]}</Text>
              </View>
              <Text style={[styles.searchResultText, { color: themeColors.text }]}>{result}</Text>
              <PlusIcon size={18} color={themeColors.primary} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Post Creation Screen ───────────────────────────────

export default function PostCreationScreen({ navigation }: any) {
  const { colors: themeColors } = useTheme();
  const { user } = useAuth();
  const { addPost } = useFeed();

  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [taggedVendors, setTaggedVendors] = useState<string[]>([]);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [friendSearch, setFriendSearch] = useState('');

  const vendorResults = vendorSearch.length > 0
    ? DEMO_VENDORS.filter(
        (v) => v.toLowerCase().includes(vendorSearch.toLowerCase()) && !taggedVendors.includes(v),
      ).slice(0, 4)
    : [];

  const friendResults = friendSearch.length > 0
    ? DEMO_FRIENDS.filter(
        (f) => f.toLowerCase().includes(friendSearch.toLowerCase()) && !taggedFriends.includes(f),
      ).slice(0, 4)
    : [];

  const handlePickImages = useCallback(async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Maximum Photos', `You can add up to ${MAX_IMAGES} photos per post.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, MAX_IMAGES));
    }
  }, [images.length]);

  const handleRemoveImage = useCallback((idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleShare = useCallback(() => {
    if (images.length === 0) {
      Alert.alert('No Photo', 'Please select at least one photo for your post.');
      return;
    }

    const userName = user?.firstName
      ? `${user.firstName} ${user.lastName ?? ''}`.trim()
      : 'You';

    addPost({
      userId: user?.id ?? 'current_user',
      userName,
      userAvatar: user?.profilePhoto ?? null,
      images,
      caption,
      taggedVendors,
      taggedFriends,
      location,
    });

    Alert.alert('Posted!', 'Your post has been shared with the community.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }, [images, caption, taggedVendors, taggedFriends, location, user, addPost, navigation]);

  const canShare = images.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerSideBtn}
          activeOpacity={0.6}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <XIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>New Post</Text>
        <TouchableOpacity
          onPress={handleShare}
          style={[styles.shareBtn, { opacity: canShare ? 1 : 0.4 }]}
          activeOpacity={0.6}
          disabled={!canShare}
          accessibilityLabel="Share post"
          accessibilityRole="button"
        >
          <Text style={[styles.shareBtnText, { color: themeColors.primary }]}>Share</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            {images.length > 0 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={images.length === 1 ? undefined : { width: SCREEN_WIDTH * images.length }}
              >
                {images.map((uri, idx) => (
                  <View key={idx} style={styles.imagePreviewContainer}>
                    <Image source={{ uri }} style={styles.imagePreview} accessibilityLabel={`Selected photo ${idx + 1}`} accessibilityRole="image" />
                    <TouchableOpacity
                      onPress={() => handleRemoveImage(idx)}
                      style={styles.removeImageBtn}
                      activeOpacity={0.7}
                      accessibilityLabel={`Remove photo ${idx + 1}`}
                      accessibilityRole="button"
                    >
                      <XIcon size={16} color="#fff" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <TouchableOpacity
                onPress={handlePickImages}
                style={[styles.photoPlaceholder, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
                activeOpacity={0.7}
                accessibilityLabel="Select photos"
                accessibilityRole="button"
              >
                <ImageIcon size={48} color={themeColors.textMuted} />
                <Text style={[styles.photoPlaceholderText, { color: themeColors.textMuted }]}>
                  Tap to select photos
                </Text>
                <Text style={[styles.photoPlaceholderSub, { color: themeColors.textMuted }]}>
                  Up to {MAX_IMAGES} photos
                </Text>
              </TouchableOpacity>
            )}

            {images.length > 0 && images.length < MAX_IMAGES && (
              <TouchableOpacity
                onPress={handlePickImages}
                style={[styles.addMoreBtn, { borderColor: themeColors.primary }]}
                activeOpacity={0.6}
                accessibilityLabel="Add more photos"
                accessibilityRole="button"
              >
                <PlusIcon size={16} color={themeColors.primary} strokeWidth={2} />
                <Text style={[styles.addMoreText, { color: themeColors.primary }]}>
                  Add More ({images.length}/{MAX_IMAGES})
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Caption */}
          <View style={[styles.captionSection, { borderBottomColor: themeColors.border }]}>
            <TextInput
              style={[styles.captionInput, { color: themeColors.text }]}
              value={caption}
              onChangeText={(t) => t.length <= MAX_CAPTION && setCaption(t)}
              placeholder="Write a caption..."
              placeholderTextColor={themeColors.textMuted}
              multiline
              textAlignVertical="top"
              maxLength={MAX_CAPTION}
              accessibilityLabel="Caption"
              accessibilityHint="Write a caption for your post"
            />
            <Text
              style={[
                styles.captionCounter,
                { color: themeColors.textMuted },
                caption.length >= MAX_CAPTION && { color: themeColors.error },
              ]}
            >
              {caption.length}/{MAX_CAPTION}
            </Text>
          </View>

          {/* Tag Vendors */}
          <TagSection
            title="Tag Vendors"
            icon={<UserIcon size={18} color={themeColors.text} />}
            tags={taggedVendors}
            onRemoveTag={(tag) => setTaggedVendors((prev) => prev.filter((t) => t !== tag))}
            searchQuery={vendorSearch}
            onSearchChange={setVendorSearch}
            searchResults={vendorResults}
            onSelectResult={(result) => {
              setTaggedVendors((prev) => [...prev, result]);
              setVendorSearch('');
            }}
            maxTags={MAX_TAGS}
            themeColors={themeColors}
          />

          {/* Tag Friends */}
          <TagSection
            title="Tag Friends"
            icon={<UserIcon size={18} color={themeColors.text} />}
            tags={taggedFriends}
            onRemoveTag={(tag) => setTaggedFriends((prev) => prev.filter((t) => t !== tag))}
            searchQuery={friendSearch}
            onSearchChange={setFriendSearch}
            searchResults={friendResults}
            onSelectResult={(result) => {
              setTaggedFriends((prev) => [...prev, result]);
              setFriendSearch('');
            }}
            maxTags={MAX_TAGS}
            themeColors={themeColors}
          />

          {/* Location */}
          <View style={[styles.locationSection, { borderBottomColor: themeColors.border }]}>
            <View style={styles.locationHeader}>
              <MapPinIcon size={18} color={themeColors.text} />
              <Text style={[styles.tagSectionTitle, { color: themeColors.text }]}>Add Location</Text>
            </View>
            <View style={[styles.tagSearchRow, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <MapPinIcon size={16} color={themeColors.textMuted} strokeWidth={1.5} />
              <TextInput
                style={[styles.tagSearchInput, { color: themeColors.text }]}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. The Pearl, San Antonio"
                placeholderTextColor={themeColors.textMuted}
                accessibilityLabel="Location"
                accessibilityHint="Add a location to your post"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  headerSideBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
  },
  shareBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  shareBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },

  // Photo Section
  photoSection: {
    paddingBottom: spacing.md,
  },
  imagePreviewContainer: {
    width: SCREEN_WIDTH,
    aspectRatio: 1,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholder: {
    width: SCREEN_WIDTH - spacing.md * 2,
    aspectRatio: 1,
    alignSelf: 'center',
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoPlaceholderText: {
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  photoPlaceholderSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  addMoreText: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },

  // Caption
  captionSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
  },
  captionInput: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 80,
    maxHeight: 200,
  },
  captionCounter: {
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },

  // Tag Sections
  tagSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
  },
  tagSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  tagSectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    flex: 1,
  },
  tagCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  tagSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  tagSearchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    padding: 0,
  },
  searchResults: {
    marginTop: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 0.5,
  },
  searchResultAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultAvatarText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#fff',
  },
  searchResultText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    flex: 1,
  },

  // Location
  locationSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
});
