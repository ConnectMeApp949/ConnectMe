import React, { useState, useCallback, useRef } from 'react';
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
  Animated,
  FlatList,
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
  CameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from '../../components/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_CAPTION = 2200;
const MAX_IMAGES = 10;
const MAX_TAGS = 10;

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
    <View
      style={[
        styles.chip,
        {
          backgroundColor: `${themeColors.primary}20`,
          borderColor: `${themeColors.primary}40`,
        },
      ]}
    >
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

// ─── Inline Tag Section (for Step 3 expanded rows) ─────

function InlineTagSection({
  tags,
  onRemoveTag,
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectResult,
  placeholder,
  themeColors,
}: {
  tags: string[];
  onRemoveTag: (tag: string) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  searchResults: string[];
  onSelectResult: (result: string) => void;
  placeholder: string;
  themeColors: any;
}) {
  return (
    <View style={styles.inlineTagContainer}>
      {tags.length > 0 && (
        <View style={styles.chipRow}>
          {tags.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              onRemove={() => onRemoveTag(tag)}
              themeColors={themeColors}
            />
          ))}
        </View>
      )}

      {tags.length < MAX_TAGS && (
        <View
          style={[
            styles.tagSearchRow,
            {
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.border,
            },
          ]}
        >
          <SearchIcon size={16} color={themeColors.textMuted} strokeWidth={1.5} />
          <TextInput
            style={[styles.tagSearchInput, { color: themeColors.text }]}
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder={placeholder}
            placeholderTextColor={themeColors.textMuted}
            accessibilityLabel={placeholder}
          />
        </View>
      )}

      {searchQuery.length > 0 && searchResults.length > 0 && (
        <View
          style={[
            styles.searchResults,
            {
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.border,
            },
          ]}
        >
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
              <Text style={[styles.searchResultText, { color: themeColors.text }]}>
                {result}
              </Text>
              <PlusIcon size={18} color={themeColors.primary} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Step 1: Photo Selection ────────────────────────────

function StepPhotoSelection({
  images,
  onImagesChange,
  themeColors,
}: {
  images: string[];
  onImagesChange: (imgs: string[]) => void;
  themeColors: any;
}) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'camera'>('gallery');

  const handlePickFromGallery = useCallback(async () => {
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
      onImagesChange([...images, ...newUris].slice(0, MAX_IMAGES));
    }
  }, [images, onImagesChange]);

  const handleTakePhoto = useCallback(async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Maximum Photos', `You can add up to ${MAX_IMAGES} photos per post.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      onImagesChange([...images, result.assets[0].uri].slice(0, MAX_IMAGES));
    }
  }, [images, onImagesChange]);

  const handleRemoveImage = useCallback(
    (idx: number) => {
      onImagesChange(images.filter((_, i) => i !== idx));
    },
    [images, onImagesChange],
  );

  return (
    <View style={styles.stepContainer}>
      {/* Preview area - top half */}
      <View
        style={[
          styles.previewArea,
          { backgroundColor: themeColors.cardBackground },
        ]}
      >
        {images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {images.map((uri, idx) => (
              <View key={`${uri}-${idx}`} style={styles.previewImageContainer}>
                <Image
                  source={{ uri }}
                  style={styles.previewImage}
                  accessibilityLabel={`Selected photo ${idx + 1}`}
                  accessibilityRole="image"
                />
                <TouchableOpacity
                  onPress={() => handleRemoveImage(idx)}
                  style={styles.removeImageBtn}
                  activeOpacity={0.7}
                  accessibilityLabel={`Remove photo ${idx + 1}`}
                  accessibilityRole="button"
                >
                  <XIcon size={16} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>
                {images.length > 1 && (
                  <View style={styles.imageCountBadge}>
                    <Text style={styles.imageCountBadgeText}>
                      {idx + 1}/{images.length}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyPreview}>
            <ImageIcon size={64} color={themeColors.textMuted} />
            <Text style={[styles.emptyPreviewText, { color: themeColors.textMuted }]}>
              No photos selected
            </Text>
          </View>
        )}
      </View>

      {/* Selected photos strip */}
      {images.length > 0 && (
        <View style={styles.selectedStripContainer}>
          <Text style={[styles.selectedCount, { color: themeColors.text }]}>
            {images.length}/{MAX_IMAGES} selected
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedStrip}
          >
            {images.map((uri, idx) => (
              <View key={`thumb-${uri}-${idx}`} style={styles.thumbContainer}>
                <Image source={{ uri }} style={styles.thumbImage} />
                <TouchableOpacity
                  onPress={() => handleRemoveImage(idx)}
                  style={styles.thumbRemoveBtn}
                  accessibilityLabel={`Remove photo ${idx + 1}`}
                >
                  <XIcon size={10} color="#fff" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tabs: Gallery / Camera */}
      <View style={[styles.tabBar, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'gallery' && {
              borderBottomColor: themeColors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab('gallery')}
          activeOpacity={0.7}
          accessibilityLabel="Gallery tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'gallery' }}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'gallery' ? themeColors.primary : themeColors.textMuted,
              },
            ]}
          >
            Gallery
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'camera' && {
              borderBottomColor: themeColors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab('camera')}
          activeOpacity={0.7}
          accessibilityLabel="Camera tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'camera' }}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'camera' ? themeColors.primary : themeColors.textMuted,
              },
            ]}
          >
            Camera
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action buttons */}
      <View style={styles.actionArea}>
        {activeTab === 'gallery' ? (
          <TouchableOpacity
            onPress={handlePickFromGallery}
            style={[
              styles.actionButton,
              {
                backgroundColor: themeColors.primary,
              },
            ]}
            activeOpacity={0.7}
            accessibilityLabel="Select from gallery"
            accessibilityRole="button"
          >
            <ImageIcon size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Select from Gallery</Text>
            {images.length > 0 && (
              <Text style={styles.actionButtonSub}>
                {MAX_IMAGES - images.length} remaining
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleTakePhoto}
            style={[
              styles.actionButton,
              {
                backgroundColor: themeColors.primary,
              },
            ]}
            activeOpacity={0.7}
            accessibilityLabel="Take a photo"
            accessibilityRole="button"
          >
            <CameraIcon size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>
        )}

        {images.length > 0 && activeTab === 'gallery' && (
          <TouchableOpacity
            onPress={handlePickFromGallery}
            style={[
              styles.selectMultipleBtn,
              { borderColor: themeColors.primary },
            ]}
            activeOpacity={0.7}
            accessibilityLabel="Select multiple photos"
            accessibilityRole="button"
          >
            <PlusIcon size={18} color={themeColors.primary} strokeWidth={2} />
            <Text style={[styles.selectMultipleText, { color: themeColors.primary }]}>
              Select Multiple
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Step 2: Edit/Filter ────────────────────────────────

function StepEdit({
  images,
  themeColors,
}: {
  images: string[];
  themeColors: any;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      if (index !== activeIndex && index >= 0 && index < images.length) {
        setActiveIndex(index);
      }
    },
    [activeIndex, images.length],
  );

  return (
    <View style={styles.stepContainer}>
      {/* Carousel */}
      <View style={styles.editCarouselContainer}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item, idx) => `${item}-${idx}`}
          renderItem={({ item }) => (
            <View style={styles.editImageWrapper}>
              <Image
                source={{ uri: item }}
                style={styles.editImage}
                accessibilityRole="image"
              />
            </View>
          )}
        />

        {/* Dot indicators */}
        {images.length > 1 && (
          <View style={styles.dotRow}>
            {images.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      idx === activeIndex ? themeColors.primary : `${themeColors.text}30`,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Filter placeholder */}
      <View
        style={[
          styles.filterPlaceholder,
          { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border },
        ]}
      >
        <Text style={[styles.filterPlaceholderTitle, { color: themeColors.text }]}>
          Filters coming soon
        </Text>
        <Text style={[styles.filterPlaceholderSub, { color: themeColors.textMuted }]}>
          Advanced editing tools and filters will be available in a future update.
        </Text>
      </View>
    </View>
  );
}

// ─── Step 3: Share Details ──────────────────────────────

function StepShare({
  images,
  caption,
  onCaptionChange,
  taggedVendors,
  onTaggedVendorsChange,
  taggedFriends,
  onTaggedFriendsChange,
  location,
  onLocationChange,
  themeColors,
}: {
  images: string[];
  caption: string;
  onCaptionChange: (text: string) => void;
  taggedVendors: string[];
  onTaggedVendorsChange: (tags: string[]) => void;
  taggedFriends: string[];
  onTaggedFriendsChange: (tags: string[]) => void;
  location: string;
  onLocationChange: (text: string) => void;
  themeColors: any;
}) {
  const [vendorSearch, setVendorSearch] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const [expandedSection, setExpandedSection] = useState<
    'vendors' | 'people' | 'location' | null
  >(null);

  const vendorResults =
    vendorSearch.length > 0
      ? DEMO_VENDORS.filter(
          (v) =>
            v.toLowerCase().includes(vendorSearch.toLowerCase()) &&
            !taggedVendors.includes(v),
        ).slice(0, 4)
      : [];

  const friendResults =
    friendSearch.length > 0
      ? DEMO_FRIENDS.filter(
          (f) =>
            f.toLowerCase().includes(friendSearch.toLowerCase()) &&
            !taggedFriends.includes(f),
        ).slice(0, 4)
      : [];

  const toggleSection = useCallback(
    (section: 'vendors' | 'people' | 'location') => {
      setExpandedSection((prev) => (prev === section ? null : section));
    },
    [],
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Caption row with thumbnail */}
        <View
          style={[
            styles.captionRow,
            { borderBottomColor: themeColors.border },
          ]}
        >
          {images.length > 0 && (
            <Image source={{ uri: images[0] }} style={styles.captionThumbnail} />
          )}
          <TextInput
            style={[styles.captionInput, { color: themeColors.text }]}
            value={caption}
            onChangeText={(t) => t.length <= MAX_CAPTION && onCaptionChange(t)}
            placeholder="Write a caption..."
            placeholderTextColor={themeColors.textMuted}
            multiline
            textAlignVertical="top"
            maxLength={MAX_CAPTION}
            accessibilityLabel="Caption"
            accessibilityHint="Write a caption for your post"
          />
        </View>
        <Text
          style={[
            styles.captionCounter,
            { color: themeColors.textMuted },
            caption.length >= MAX_CAPTION && { color: themeColors.error },
          ]}
        >
          {caption.length}/{MAX_CAPTION}
        </Text>

        {/* Tag Vendors row */}
        <TouchableOpacity
          style={[styles.settingsRow, { borderBottomColor: themeColors.border }]}
          onPress={() => toggleSection('vendors')}
          activeOpacity={0.6}
          accessibilityLabel="Tag vendors"
          accessibilityRole="button"
        >
          <UserIcon size={20} color={themeColors.text} />
          <Text style={[styles.settingsRowText, { color: themeColors.text }]}>
            Tag Vendors
          </Text>
          {taggedVendors.length > 0 && (
            <Text style={[styles.settingsRowCount, { color: themeColors.textMuted }]}>
              {taggedVendors.length}
            </Text>
          )}
          <ChevronRightIcon
            size={20}
            color={themeColors.textMuted}
            strokeWidth={1.5}
          />
        </TouchableOpacity>

        {expandedSection === 'vendors' && (
          <View style={[styles.expandedContent, { borderBottomColor: themeColors.border }]}>
            <InlineTagSection
              tags={taggedVendors}
              onRemoveTag={(tag) =>
                onTaggedVendorsChange(taggedVendors.filter((t) => t !== tag))
              }
              searchQuery={vendorSearch}
              onSearchChange={setVendorSearch}
              searchResults={vendorResults}
              onSelectResult={(result) => {
                onTaggedVendorsChange([...taggedVendors, result]);
                setVendorSearch('');
              }}
              placeholder="Search vendors..."
              themeColors={themeColors}
            />
          </View>
        )}

        {/* Tag People row */}
        <TouchableOpacity
          style={[styles.settingsRow, { borderBottomColor: themeColors.border }]}
          onPress={() => toggleSection('people')}
          activeOpacity={0.6}
          accessibilityLabel="Tag people"
          accessibilityRole="button"
        >
          <UserIcon size={20} color={themeColors.text} />
          <Text style={[styles.settingsRowText, { color: themeColors.text }]}>
            Tag People
          </Text>
          {taggedFriends.length > 0 && (
            <Text style={[styles.settingsRowCount, { color: themeColors.textMuted }]}>
              {taggedFriends.length}
            </Text>
          )}
          <ChevronRightIcon
            size={20}
            color={themeColors.textMuted}
            strokeWidth={1.5}
          />
        </TouchableOpacity>

        {expandedSection === 'people' && (
          <View style={[styles.expandedContent, { borderBottomColor: themeColors.border }]}>
            <InlineTagSection
              tags={taggedFriends}
              onRemoveTag={(tag) =>
                onTaggedFriendsChange(taggedFriends.filter((t) => t !== tag))
              }
              searchQuery={friendSearch}
              onSearchChange={setFriendSearch}
              searchResults={friendResults}
              onSelectResult={(result) => {
                onTaggedFriendsChange([...taggedFriends, result]);
                setFriendSearch('');
              }}
              placeholder="Search people..."
              themeColors={themeColors}
            />
          </View>
        )}

        {/* Add Location row */}
        <TouchableOpacity
          style={[styles.settingsRow, { borderBottomColor: themeColors.border }]}
          onPress={() => toggleSection('location')}
          activeOpacity={0.6}
          accessibilityLabel="Add location"
          accessibilityRole="button"
        >
          <MapPinIcon size={20} color={themeColors.text} />
          <Text style={[styles.settingsRowText, { color: themeColors.text }]}>
            Add Location
          </Text>
          {location.length > 0 && (
            <Text
              style={[styles.settingsRowValue, { color: themeColors.textMuted }]}
              numberOfLines={1}
            >
              {location}
            </Text>
          )}
          <ChevronRightIcon
            size={20}
            color={themeColors.textMuted}
            strokeWidth={1.5}
          />
        </TouchableOpacity>

        {expandedSection === 'location' && (
          <View style={[styles.expandedContent, { borderBottomColor: themeColors.border }]}>
            <View
              style={[
                styles.tagSearchRow,
                {
                  backgroundColor: themeColors.cardBackground,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <MapPinIcon size={16} color={themeColors.textMuted} strokeWidth={1.5} />
              <TextInput
                style={[styles.tagSearchInput, { color: themeColors.text }]}
                value={location}
                onChangeText={onLocationChange}
                placeholder="e.g. The Pearl, San Antonio"
                placeholderTextColor={themeColors.textMuted}
                accessibilityLabel="Location"
                accessibilityHint="Add a location to your post"
                autoFocus
              />
              {location.length > 0 && (
                <TouchableOpacity
                  onPress={() => onLocationChange('')}
                  accessibilityLabel="Clear location"
                >
                  <XIcon size={16} color={themeColors.textMuted} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Post Creation Screen ───────────────────────────────

export default function PostCreationScreen({ navigation }: any) {
  const { colors: themeColors } = useTheme();
  const { user } = useAuth();
  const { addPost } = useFeed();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [taggedVendors, setTaggedVendors] = useState<string[]>([]);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [location, setLocation] = useState('');

  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = useCallback(
    (toStep: 1 | 2 | 3, direction: 'forward' | 'back') => {
      const startValue = direction === 'forward' ? SCREEN_WIDTH : -SCREEN_WIDTH;
      slideAnim.setValue(startValue);
      setStep(toStep);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    },
    [slideAnim],
  );

  const handleNext = useCallback(() => {
    if (step === 1 && images.length > 0) {
      animateTransition(2, 'forward');
    } else if (step === 2) {
      animateTransition(3, 'forward');
    }
  }, [step, images.length, animateTransition]);

  const handleBack = useCallback(() => {
    if (step === 2) {
      animateTransition(1, 'back');
    } else if (step === 3) {
      animateTransition(2, 'back');
    }
  }, [step, animateTransition]);

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

  // Header config per step
  const headerConfig = {
    1: {
      left: 'close' as const,
      title: 'New Post',
      right: 'next' as const,
      rightDisabled: images.length === 0,
    },
    2: {
      left: 'back' as const,
      title: 'Edit',
      right: 'next' as const,
      rightDisabled: false,
    },
    3: {
      left: 'back' as const,
      title: 'Share',
      right: 'share' as const,
      rightDisabled: false,
    },
  };

  const config = headerConfig[step];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        {/* Left button */}
        <TouchableOpacity
          onPress={config.left === 'close' ? () => navigation.goBack() : handleBack}
          style={styles.headerSideBtn}
          activeOpacity={0.6}
          accessibilityLabel={config.left === 'close' ? 'Close' : 'Go back'}
          accessibilityRole="button"
        >
          {config.left === 'close' ? (
            <XIcon size={24} color={themeColors.text} strokeWidth={2} />
          ) : (
            <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
          )}
        </TouchableOpacity>

        {/* Title */}
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {config.title}
        </Text>

        {/* Right button */}
        <TouchableOpacity
          onPress={config.right === 'share' ? handleShare : handleNext}
          style={[styles.headerRightBtn, { opacity: config.rightDisabled ? 0.4 : 1 }]}
          activeOpacity={0.6}
          disabled={config.rightDisabled}
          accessibilityLabel={config.right === 'share' ? 'Share post' : 'Next step'}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.headerRightText,
              {
                color:
                  config.right === 'share' ? '#fff' : themeColors.primary,
              },
              config.right === 'share' && {
                backgroundColor: themeColors.primary,
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: borderRadius.md,
                overflow: 'hidden',
              },
            ]}
          >
            {config.right === 'share' ? 'Share' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Step indicator */}
      <View style={styles.stepIndicatorRow}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.stepIndicator,
              {
                backgroundColor:
                  s <= step ? themeColors.primary : `${themeColors.text}20`,
              },
            ]}
          />
        ))}
      </View>

      {/* Animated step content */}
      <Animated.View
        style={[styles.stepContent, { transform: [{ translateX: slideAnim }] }]}
      >
        {step === 1 && (
          <StepPhotoSelection
            images={images}
            onImagesChange={setImages}
            themeColors={themeColors}
          />
        )}

        {step === 2 && <StepEdit images={images} themeColors={themeColors} />}

        {step === 3 && (
          <StepShare
            images={images}
            caption={caption}
            onCaptionChange={setCaption}
            taggedVendors={taggedVendors}
            onTaggedVendorsChange={setTaggedVendors}
            taggedFriends={taggedFriends}
            onTaggedFriendsChange={setTaggedFriends}
            location={location}
            onLocationChange={setLocation}
            themeColors={themeColors}
          />
        )}
      </Animated.View>
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
  headerRightBtn: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    minWidth: 50,
    alignItems: 'flex-end',
  },
  headerRightText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },

  // Step indicator
  stepIndicatorRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  stepIndicator: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },

  // Step content
  stepContent: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },

  // ── Step 1: Photo Selection ──

  previewArea: {
    width: SCREEN_WIDTH,
    aspectRatio: 1,
  },
  previewImageContainer: {
    width: SCREEN_WIDTH,
    aspectRatio: 1,
  },
  previewImage: {
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
  imageCountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  imageCountBadgeText: {
    color: '#fff',
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyPreviewText: {
    fontFamily: fonts.medium,
    fontSize: 16,
  },

  selectedStripContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  selectedCount: {
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: 6,
  },
  selectedStrip: {
    gap: 6,
  },
  thumbContainer: {
    width: 56,
    height: 56,
    borderRadius: 6,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbRemoveBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },

  actionArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: 16,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontFamily: fonts.semiBold,
    fontSize: 17,
  },
  actionButtonSub: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  selectMultipleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  selectMultipleText: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },

  // ── Step 2: Edit ──

  editCarouselContainer: {
    width: SCREEN_WIDTH,
    aspectRatio: 1,
  },
  editImageWrapper: {
    width: SCREEN_WIDTH,
    aspectRatio: 1,
  },
  editImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterPlaceholder: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  filterPlaceholderTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
  filterPlaceholderSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'center',
  },

  // ── Step 3: Share ──

  captionRow: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  captionThumbnail: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
  captionInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 60,
    maxHeight: 160,
    padding: 0,
    textAlignVertical: 'top',
  },
  captionCounter: {
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'right',
    paddingHorizontal: spacing.md,
    paddingTop: 4,
    paddingBottom: 8,
  },

  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  settingsRowText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  settingsRowCount: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  settingsRowValue: {
    fontFamily: fonts.regular,
    fontSize: 14,
    maxWidth: 140,
  },

  expandedContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },

  // ── Shared: Tags ──

  inlineTagContainer: {
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
});
