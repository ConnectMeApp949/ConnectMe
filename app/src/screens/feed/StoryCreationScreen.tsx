import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image,
  Alert, Dimensions, KeyboardAvoidingView, Platform, Animated, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFeed, FeedStory } from '../../context/FeedContext';
import { fonts, spacing, borderRadius } from '../../theme';
import {
  XIcon, CameraIcon, ImageIcon, MapPinIcon, UserIcon, SearchIcon,
  ChevronLeftIcon, CheckIcon, SunIcon, ContrastIcon, ThermometerIcon, DropletIcon, CropIcon, FlipIcon, RotateIcon, SparklesIcon,
} from '../../components/Icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_ASPECT = 16 / 9;
const MAX_CAPTION = 250;

// ─── Filters ──────────────────────────────────────────────

const FILTERS = [
  { id: 'normal', name: 'Normal', overlay: 'transparent' },
  { id: 'clarendon', name: 'Clarendon', overlay: 'rgba(127,187,227,0.15)' },
  { id: 'gingham', name: 'Gingham', overlay: 'rgba(230,230,250,0.2)' },
  { id: 'moon', name: 'Moon', overlay: 'rgba(160,160,160,0.3)' },
  { id: 'lark', name: 'Lark', overlay: 'rgba(245,224,180,0.15)' },
  { id: 'reyes', name: 'Reyes', overlay: 'rgba(239,205,173,0.2)' },
  { id: 'juno', name: 'Juno', overlay: 'rgba(255,200,150,0.12)' },
  { id: 'slumber', name: 'Slumber', overlay: 'rgba(125,105,120,0.2)' },
  { id: 'aden', name: 'Aden', overlay: 'rgba(66,10,14,0.1)' },
  { id: 'perpetua', name: 'Perpetua', overlay: 'rgba(130,200,180,0.15)' },
  { id: 'mayfair', name: 'Mayfair', overlay: 'rgba(255,200,200,0.12)' },
  { id: 'rise', name: 'Rise', overlay: 'rgba(236,205,169,0.15)' },
  { id: 'valencia', name: 'Valencia', overlay: 'rgba(250,180,90,0.12)' },
  { id: 'xpro2', name: 'X-Pro II', overlay: 'rgba(230,80,120,0.12)' },
];

// ─── Demo data ────────────────────────────────────────────

const DEMO_VENDORS = [
  'AlamoCityCatering', 'DJAlamoBeats', 'TacoLibreSA', 'BloomSA',
  'SAPhotoStudio', 'EventVibesSA', 'SAPlanners', 'FiestaDecorSA',
];

const DEMO_FRIENDS = [
  'Mike Johnson', 'Jessica Lee', 'Carlos Ruiz', 'Ana Flores',
  'Emily Cooper', 'Nicole Brown', 'Katie Wilson', 'Derek Hall',
];

// ─── Adjustments ──────────────────────────────────────────

interface Adjustments {
  brightness: number;
  contrast: number;
  warmth: number;
  saturation: number;
}

const DEFAULT_ADJUSTMENTS: Adjustments = { brightness: 0, contrast: 0, warmth: 0, saturation: 0 };
type AdjustKey = keyof Adjustments;

const ADJUST_TOOLS: { key: AdjustKey; label: string; Icon: React.FC<any> }[] = [
  { key: 'brightness', label: 'Brightness', Icon: SunIcon },
  { key: 'contrast', label: 'Contrast', Icon: ContrastIcon },
  { key: 'warmth', label: 'Warmth', Icon: ThermometerIcon },
  { key: 'saturation', label: 'Saturation', Icon: DropletIcon },
];

function buildAdjustOverlays(adj: Adjustments) {
  const overlays: { color: string }[] = [];
  if (adj.brightness > 0) overlays.push({ color: `rgba(255,255,255,${adj.brightness * 0.5})` });
  else if (adj.brightness < 0) overlays.push({ color: `rgba(0,0,0,${Math.abs(adj.brightness) * 0.5})` });
  if (adj.contrast > 0) overlays.push({ color: `rgba(0,0,0,${adj.contrast * 0.15})` });
  else if (adj.contrast < 0) overlays.push({ color: `rgba(128,128,128,${Math.abs(adj.contrast) * 0.3})` });
  if (adj.warmth > 0) overlays.push({ color: `rgba(255,165,0,${adj.warmth * 0.2})` });
  else if (adj.warmth < 0) overlays.push({ color: `rgba(100,149,237,${Math.abs(adj.warmth) * 0.2})` });
  if (adj.saturation < 0) overlays.push({ color: `rgba(128,128,128,${Math.abs(adj.saturation) * 0.45})` });
  else if (adj.saturation > 0) overlays.push({ color: `rgba(255,0,128,${adj.saturation * 0.08})` });
  return overlays;
}

// ─── Tag Chip ─────────────────────────────────────────────

function TagChip({ label, onRemove, themeColors }: { label: string; onRemove: () => void; themeColors: any }) {
  return (
    <View style={[s.chip, { borderColor: themeColors.border }]}>
      <Text style={[s.chipText, { color: themeColors.text }]}>@{label}</Text>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <XIcon size={12} color={themeColors.textMuted} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────

export default function StoryCreationScreen({ navigation }: any) {
  const { colors: themeColors } = useTheme();
  const { user } = useAuth();
  const { addStory } = useFeed();

  const [step, setStep] = useState<'select' | 'edit' | 'details'>('select');
  const [image, setImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [activeTool, setActiveTool] = useState<AdjustKey | null>(null);
  const [caption, setCaption] = useState('');
  const [taggedVendors, setTaggedVendors] = useState<string[]>([]);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [friendSearch, setFriendSearch] = useState('');

  const slideAnim = useRef(new Animated.Value(0)).current;

  const adjustOverlays = buildAdjustOverlays(adjustments);
  const filterOverlay = FILTERS.find(f => f.id === selectedFilter)?.overlay || 'transparent';

  const animateForward = useCallback((toStep: 'select' | 'edit' | 'details') => {
    slideAnim.setValue(SCREEN_WIDTH);
    setStep(toStep);
    Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
  }, [slideAnim]);

  const animateBack = useCallback((toStep: 'select' | 'edit' | 'details') => {
    slideAnim.setValue(-SCREEN_WIDTH);
    setStep(toStep);
    Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
  }, [slideAnim]);

  // ── Photo selection ──

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission Needed', 'Photo library access is required.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.9, allowsEditing: true, aspect: [9, 16],
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      animateForward('edit');
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission Needed', 'Camera access is required.'); return; }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.9, allowsEditing: true, aspect: [9, 16],
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      animateForward('edit');
    }
  }

  // ── Adjust slider ──

  const handleSliderChange = useCallback((key: AdjustKey, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: Math.round(value * 100) / 100 }));
  }, []);

  const handleReset = useCallback((key: AdjustKey) => {
    setAdjustments(prev => ({ ...prev, [key]: 0 }));
  }, []);

  // ── Share ──

  function handleShare() {
    if (!image) return;
    const userName = user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'You';
    addStory({
      userId: user?.id ?? 'current_user',
      userName,
      userAvatar: user?.profilePhoto ?? null,
      image,
      caption,
      taggedVendors,
      taggedFriends,
      location,
    });
    Alert.alert('Story Shared!', 'Your story has been added.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  // ── Tag search helpers ──

  const availableVendors = DEMO_VENDORS.filter(v => !taggedVendors.includes(v));
  const vendorResults = vendorSearch.length > 0
    ? availableVendors.filter(v => v.toLowerCase().includes(vendorSearch.toLowerCase())).slice(0, 5)
    : availableVendors.slice(0, 5);

  const availableFriends = DEMO_FRIENDS.filter(f => !taggedFriends.includes(f));
  const friendResults = friendSearch.length > 0
    ? availableFriends.filter(f => f.toLowerCase().includes(friendSearch.toLowerCase())).slice(0, 5)
    : availableFriends.slice(0, 5);

  // ── Header config ──

  const headers: Record<string, { left: string; title: string; right: string }> = {
    select: { left: 'close', title: 'New Story', right: '' },
    edit: { left: 'back', title: 'Edit', right: 'next' },
    details: { left: 'back', title: 'Share Story', right: 'share' },
  };
  const h = headers[step];

  function handleLeftPress() {
    if (step === 'select') navigation.goBack();
    else if (step === 'edit') animateBack('select');
    else if (step === 'details') animateBack('edit');
  }

  function handleRightPress() {
    if (step === 'edit') animateForward('details');
    else if (step === 'details') handleShare();
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={handleLeftPress} style={s.headerSideBtn} activeOpacity={0.6}
          accessibilityLabel={h.left === 'close' ? 'Close' : 'Go back'} accessibilityRole="button">
          {h.left === 'close'
            ? <XIcon size={24} color={themeColors.text} strokeWidth={2} />
            : <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />}
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>{h.title}</Text>
        {h.right ? (
          <TouchableOpacity onPress={handleRightPress} style={s.headerRightBtn} activeOpacity={0.6}
            accessibilityLabel={h.right === 'share' ? 'Share story' : 'Next step'} accessibilityRole="button">
            <Text style={[
              s.headerRightText,
              { color: h.right === 'share' ? '#fff' : themeColors.primary },
              h.right === 'share' && {
                backgroundColor: themeColors.primary, paddingHorizontal: 16, paddingVertical: 6,
                borderRadius: borderRadius.md, overflow: 'hidden',
              },
            ]}>{h.right === 'share' ? 'Share' : 'Next'}</Text>
          </TouchableOpacity>
        ) : <View style={s.headerSideBtn} />}
      </View>

      {/* Step indicator */}
      <View style={s.stepRow}>
        {['select', 'edit', 'details'].map((st, i) => (
          <View key={st} style={[s.stepDot, {
            backgroundColor: ['select', 'edit', 'details'].indexOf(step) >= i ? themeColors.primary : `${themeColors.text}20`,
          }]} />
        ))}
      </View>

      {/* Content */}
      <Animated.View style={[s.content, { transform: [{ translateX: slideAnim }] }]}>

        {/* ─── Step 1: Select Photo ─── */}
        {step === 'select' && (
          <View style={s.selectContainer}>
            <View style={[s.selectPlaceholder, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <CameraIcon size={48} color={themeColors.textMuted} strokeWidth={1} />
              <Text style={[s.selectTitle, { color: themeColors.text }]}>Create Your Story</Text>
              <Text style={[s.selectSub, { color: themeColors.textMuted }]}>Choose a photo to share with your followers</Text>
            </View>
            <View style={s.selectActions}>
              <TouchableOpacity style={[s.selectBtn, { backgroundColor: themeColors.primary }]} onPress={pickFromLibrary} activeOpacity={0.7}
                accessibilityLabel="Select from Camera Roll" accessibilityRole="button">
                <ImageIcon size={20} color="#fff" strokeWidth={1.5} />
                <Text style={s.selectBtnText}>Camera Roll</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.selectBtn, { backgroundColor: themeColors.accent }]} onPress={takePhoto} activeOpacity={0.7}
                accessibilityLabel="Take Photo" accessibilityRole="button">
                <CameraIcon size={20} color="#fff" strokeWidth={1.5} />
                <Text style={s.selectBtnText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ─── Step 2: Edit / Filters ─── */}
        {step === 'edit' && image && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Preview */}
            <View style={s.previewContainer}>
              <Image source={{ uri: image }} style={s.previewImage} resizeMode="cover" accessibilityRole="image" />
              {selectedFilter !== 'normal' && <View style={[s.overlay, { backgroundColor: filterOverlay }]} />}
              {adjustOverlays.map((o, i) => <View key={i} style={[s.overlay, { backgroundColor: o.color }]} />)}
            </View>

            {/* Filters */}
            <Text style={[s.sectionTitle, { color: themeColors.text }]}>Filters</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterStrip}>
              {FILTERS.map(f => {
                const active = selectedFilter === f.id;
                return (
                  <TouchableOpacity key={f.id} style={[s.filterItem, active && { borderColor: themeColors.primary, borderWidth: 2 }]}
                    onPress={() => setSelectedFilter(f.id)} activeOpacity={0.7}
                    accessibilityLabel={`${f.name} filter`} accessibilityRole="button" accessibilityState={{ selected: active }}>
                    <View style={s.filterThumbWrap}>
                      <Image source={{ uri: image }} style={s.filterThumb} />
                      <View style={[s.overlay, { backgroundColor: f.overlay }]} />
                    </View>
                    <Text style={[s.filterLabel, { color: active ? themeColors.primary : themeColors.textSecondary }]}>{f.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Adjust */}
            <Text style={[s.sectionTitle, { color: themeColors.text, marginTop: 16 }]}>Adjust</Text>
            <View style={s.adjustRow}>
              {ADJUST_TOOLS.map(tool => {
                const isActive = activeTool === tool.key;
                const isModified = adjustments[tool.key] !== 0;
                return (
                  <TouchableOpacity key={tool.key}
                    style={[s.adjustBtn, {
                      backgroundColor: isActive ? themeColors.primary : themeColors.cardBackground,
                      borderColor: isModified && !isActive ? themeColors.primary : themeColors.border,
                    }]}
                    onPress={() => setActiveTool(isActive ? null : tool.key)} activeOpacity={0.7}
                    accessibilityLabel={`${tool.label} adjustment`} accessibilityRole="button">
                    <tool.Icon size={20} color={isActive ? '#fff' : isModified ? themeColors.primary : themeColors.textSecondary} strokeWidth={1.5} />
                    <Text style={[s.adjustLabel, { color: isActive ? '#fff' : isModified ? themeColors.primary : themeColors.textSecondary }]}>{tool.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tools: Crop & Flip */}
            <Text style={[s.sectionTitle, { color: themeColors.text, marginTop: 16 }]}>Tools</Text>
            <View style={s.adjustRow}>
              <TouchableOpacity
                style={[s.adjustBtn, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
                onPress={async () => {
                  try {
                    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.9 });
                    if (!result.canceled && result.assets[0]) setImage(result.assets[0].uri);
                  } catch {}
                }}
                activeOpacity={0.7} accessibilityLabel="Crop image" accessibilityRole="button">
                <CropIcon size={20} color={themeColors.textSecondary} strokeWidth={1.5} />
                <Text style={[s.adjustLabel, { color: themeColors.textSecondary }]}>Crop</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.adjustBtn, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
                onPress={async () => {
                  if (!image) return;
                  try {
                    const result = await ImageManipulator.manipulateAsync(image, [{ flip: ImageManipulator.FlipType.Horizontal }], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
                    setImage(result.uri);
                  } catch { Alert.alert('Error', 'Unable to flip the image.'); }
                }}
                activeOpacity={0.7} accessibilityLabel="Flip image horizontally" accessibilityRole="button">
                <FlipIcon size={20} color={themeColors.textSecondary} strokeWidth={1.5} />
                <Text style={[s.adjustLabel, { color: themeColors.textSecondary }]}>Flip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.adjustBtn, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
                onPress={async () => {
                  if (!image) return;
                  try {
                    const result = await ImageManipulator.manipulateAsync(image, [{ rotate: 90 }], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
                    setImage(result.uri);
                  } catch { Alert.alert('Error', 'Unable to rotate the image.'); }
                }}
                activeOpacity={0.7} accessibilityLabel="Rotate image" accessibilityRole="button">
                <RotateIcon size={20} color={themeColors.textSecondary} strokeWidth={1.5} />
                <Text style={[s.adjustLabel, { color: themeColors.textSecondary }]}>Rotate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.adjustBtn, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]}
                onPress={() => {
                  setAdjustments({ brightness: 0.12, contrast: 0.08, warmth: 0.06, saturation: 0.1 });
                  if (selectedFilter === 'normal') setSelectedFilter('clarendon');
                }}
                activeOpacity={0.7} accessibilityLabel="Auto enhance" accessibilityRole="button">
                <SparklesIcon size={20} color="#fff" strokeWidth={1.5} />
                <Text style={[s.adjustLabel, { color: '#fff' }]}>Auto</Text>
              </TouchableOpacity>
            </View>

            {/* Slider */}
            {activeTool && (
              <View style={[s.sliderContainer, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <View style={s.sliderHeader}>
                  <Text style={[s.sliderLabel, { color: themeColors.text }]}>
                    {ADJUST_TOOLS.find(t => t.key === activeTool)?.label}
                  </Text>
                  <View style={s.sliderValueRow}>
                    <Text style={[s.sliderValue, { color: themeColors.primary }]}>
                      {adjustments[activeTool] > 0 ? '+' : ''}{Math.round(adjustments[activeTool] * 100)}
                    </Text>
                    {adjustments[activeTool] !== 0 && (
                      <TouchableOpacity onPress={() => handleReset(activeTool)} style={[s.resetBtn, { borderColor: themeColors.border }]} activeOpacity={0.6}>
                        <Text style={[s.resetBtnText, { color: themeColors.textMuted }]}>Reset</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <View style={s.sliderTrackRow}>
                  <Text style={[s.sliderBound, { color: themeColors.textMuted }]}>-100</Text>
                  <Slider style={s.slider} minimumValue={-1} maximumValue={1} value={adjustments[activeTool]}
                    onValueChange={(v: number) => handleSliderChange(activeTool, v)}
                    minimumTrackTintColor={themeColors.primary} maximumTrackTintColor={`${themeColors.text}20`}
                    thumbTintColor={themeColors.primary} />
                  <Text style={[s.sliderBound, { color: themeColors.textMuted }]}>+100</Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* ─── Step 3: Details ─── */}
        {step === 'details' && image && (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
              {/* Caption + thumbnail */}
              <View style={[s.captionRow, { borderBottomColor: themeColors.border }]}>
                <View style={s.captionThumbWrap}>
                  <Image source={{ uri: image }} style={s.captionThumb} />
                  {selectedFilter !== 'normal' && <View style={[s.overlay, { backgroundColor: filterOverlay, borderRadius: borderRadius.md }]} />}
                </View>
                <TextInput style={[s.captionInput, { color: themeColors.text }]} value={caption}
                  onChangeText={t => t.length <= MAX_CAPTION && setCaption(t)}
                  placeholder="Add a caption to your story..." placeholderTextColor={themeColors.textMuted}
                  multiline textAlignVertical="top" maxLength={MAX_CAPTION}
                  accessibilityLabel="Story caption" />
              </View>
              <Text style={[s.captionCounter, { color: themeColors.textMuted }]}>{caption.length}/{MAX_CAPTION}</Text>

              {/* Tag Vendors */}
              <TouchableOpacity style={[s.detailRow, { borderBottomColor: themeColors.border }]} activeOpacity={0.7}>
                <UserIcon size={20} color={themeColors.primary} strokeWidth={1.5} />
                <Text style={[s.detailRowText, { color: themeColors.text }]}>Tag Vendors</Text>
                {taggedVendors.length > 0 && <Text style={[s.detailCount, { color: themeColors.primary }]}>{taggedVendors.length}</Text>}
              </TouchableOpacity>
              <View style={[s.tagSection, { borderBottomColor: themeColors.border }]}>
                {taggedVendors.length > 0 && (
                  <View style={s.chipRow}>
                    {taggedVendors.map(v => <TagChip key={v} label={v} themeColors={themeColors}
                      onRemove={() => setTaggedVendors(prev => prev.filter(x => x !== v))} />)}
                  </View>
                )}
                <View style={[s.searchBar, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                  <SearchIcon size={16} color={themeColors.textMuted} strokeWidth={1.5} />
                  <TextInput style={[s.searchInput, { color: themeColors.text }]} value={vendorSearch}
                    onChangeText={setVendorSearch} placeholder="Search vendors..." placeholderTextColor={themeColors.textMuted} />
                </View>
                {vendorResults.length > 0 && (
                  <View style={[s.searchResults, { borderColor: themeColors.border }]}>
                    {vendorResults.map(v => (
                      <TouchableOpacity key={v} style={[s.searchResultItem, { borderBottomColor: themeColors.border }]}
                        onPress={() => { setTaggedVendors(prev => [...prev, v]); setVendorSearch(''); }}>
                        <View style={[s.searchAvatar, { backgroundColor: themeColors.primary }]}>
                          <Text style={s.searchAvatarText}>{v[0]}</Text>
                        </View>
                        <Text style={[s.searchResultText, { color: themeColors.text }]}>@{v}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Tag Friends */}
              <TouchableOpacity style={[s.detailRow, { borderBottomColor: themeColors.border }]} activeOpacity={0.7}>
                <UserIcon size={20} color={themeColors.primary} strokeWidth={1.5} />
                <Text style={[s.detailRowText, { color: themeColors.text }]}>Tag People</Text>
                {taggedFriends.length > 0 && <Text style={[s.detailCount, { color: themeColors.primary }]}>{taggedFriends.length}</Text>}
              </TouchableOpacity>
              <View style={[s.tagSection, { borderBottomColor: themeColors.border }]}>
                {taggedFriends.length > 0 && (
                  <View style={s.chipRow}>
                    {taggedFriends.map(f => <TagChip key={f} label={f} themeColors={themeColors}
                      onRemove={() => setTaggedFriends(prev => prev.filter(x => x !== f))} />)}
                  </View>
                )}
                <View style={[s.searchBar, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                  <SearchIcon size={16} color={themeColors.textMuted} strokeWidth={1.5} />
                  <TextInput style={[s.searchInput, { color: themeColors.text }]} value={friendSearch}
                    onChangeText={setFriendSearch} placeholder="Search people..." placeholderTextColor={themeColors.textMuted} />
                </View>
                {friendResults.length > 0 && (
                  <View style={[s.searchResults, { borderColor: themeColors.border }]}>
                    {friendResults.map(f => (
                      <TouchableOpacity key={f} style={[s.searchResultItem, { borderBottomColor: themeColors.border }]}
                        onPress={() => { setTaggedFriends(prev => [...prev, f]); setFriendSearch(''); }}>
                        <View style={[s.searchAvatar, { backgroundColor: themeColors.accent }]}>
                          <Text style={s.searchAvatarText}>{f[0]}</Text>
                        </View>
                        <Text style={[s.searchResultText, { color: themeColors.text }]}>{f}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Location */}
              <View style={[s.detailRow, { borderBottomColor: themeColors.border }]}>
                <MapPinIcon size={20} color={themeColors.primary} strokeWidth={1.5} />
                <TextInput style={[s.locationInput, { color: themeColors.text }]} value={location}
                  onChangeText={setLocation} placeholder="Add location..." placeholderTextColor={themeColors.textMuted}
                  accessibilityLabel="Location" />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: 8, borderBottomWidth: 1,
  },
  headerSideBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17 },
  headerRightBtn: { minWidth: 44, height: 44, alignItems: 'flex-end', justifyContent: 'center' },
  headerRightText: { fontFamily: fonts.semiBold, fontSize: 15 },
  stepRow: { flexDirection: 'row', gap: 4, paddingHorizontal: spacing.md, paddingVertical: 8 },
  stepDot: { flex: 1, height: 3, borderRadius: 1.5 },
  content: { flex: 1 },

  // ── Select ──
  selectContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  selectPlaceholder: {
    alignItems: 'center', paddingVertical: 48, borderRadius: 20, borderWidth: 1, gap: 12, marginBottom: 24,
  },
  selectTitle: { fontFamily: fonts.bold, fontSize: 22 },
  selectSub: { fontFamily: fonts.regular, fontSize: 15, textAlign: 'center', paddingHorizontal: 20 },
  selectActions: { flexDirection: 'row', gap: 12 },
  selectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, gap: 8,
  },
  selectBtnText: { color: '#fff', fontFamily: fonts.semiBold, fontSize: 15 },

  // ── Preview ──
  previewContainer: {
    width: SCREEN_WIDTH, aspectRatio: 1,
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject },

  // ── Filters ──
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 14, paddingHorizontal: spacing.md, paddingTop: 14, paddingBottom: 8 },
  filterStrip: { paddingHorizontal: spacing.md, gap: 12 },
  filterItem: { alignItems: 'center', borderRadius: 8, borderWidth: 2, borderColor: 'transparent', padding: 2 },
  filterThumbWrap: { width: 72, height: 72, borderRadius: 6, overflow: 'hidden' },
  filterThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  filterLabel: { fontFamily: fonts.medium, fontSize: 11, marginTop: 4, textAlign: 'center' },

  // ── Adjust ──
  adjustRow: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: 10, paddingBottom: 8 },
  adjustBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1, gap: 4 },
  adjustLabel: { fontFamily: fonts.medium, fontSize: 11 },

  // ── Slider ──
  sliderContainer: { marginHorizontal: spacing.md, marginTop: 4, marginBottom: 16, padding: 16, borderRadius: 12, borderWidth: 1 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sliderLabel: { fontFamily: fonts.semiBold, fontSize: 15 },
  sliderValueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sliderValue: { fontFamily: fonts.bold, fontSize: 15, minWidth: 40, textAlign: 'right' },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  resetBtnText: { fontFamily: fonts.medium, fontSize: 12 },
  sliderTrackRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slider: { flex: 1, height: 40 },
  sliderBound: { fontFamily: fonts.regular, fontSize: 11, width: 30, textAlign: 'center' },

  // ── Details ──
  captionRow: { flexDirection: 'row', padding: spacing.md, borderBottomWidth: 0.5, gap: 12 },
  captionThumbWrap: { width: 60, height: 100, borderRadius: borderRadius.md, overflow: 'hidden' },
  captionThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  captionInput: { flex: 1, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, minHeight: 60, maxHeight: 160, padding: 0, textAlignVertical: 'top' },
  captionCounter: { fontFamily: fonts.regular, fontSize: 12, textAlign: 'right', paddingHorizontal: spacing.md, paddingTop: 4, paddingBottom: 8 },

  detailRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 14, borderBottomWidth: 0.5, gap: 12 },
  detailRowText: { flex: 1, fontFamily: fonts.medium, fontSize: 15 },
  detailCount: { fontFamily: fonts.semiBold, fontSize: 14 },
  locationInput: { flex: 1, fontFamily: fonts.medium, fontSize: 15, padding: 0 },

  // ── Tags ──
  tagSection: { paddingHorizontal: spacing.md, paddingVertical: 10, borderBottomWidth: 0.5, gap: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontFamily: fonts.medium, fontSize: 13 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: borderRadius.md, borderWidth: 1 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, padding: 0 },
  searchResults: { borderRadius: borderRadius.md, borderWidth: 1, overflow: 'hidden' },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 10, borderBottomWidth: 0.5 },
  searchAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  searchAvatarText: { fontFamily: fonts.bold, fontSize: 12, color: '#fff' },
  searchResultText: { fontFamily: fonts.medium, fontSize: 14, flex: 1 },
});
