import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, XIcon, CheckIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'VendorPhotos'>;

export default function VendorPhotosScreen({ navigation }: Props) {
  const [photos, setPhotos] = useState<string[]>([]);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6 - photos.length,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...newUris].slice(0, 6));
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        <Text style={s.title}>Add some photos of your work</Text>
        <Text style={s.subtitle}>You'll need at least 5 photos to get started. You can add more later.</Text>

        <View style={s.grid}>
          {Array.from({ length: 6 }).map((_, i) => {
            const photo = photos[i];
            const isCover = i === 0;
            if (photo) {
              return (
                <TouchableOpacity key={i} style={[s.slot, isCover && s.coverSlot]} activeOpacity={0.8} onPress={() => removePhoto(i)} accessibilityLabel={`Photo ${i + 1}${isCover ? ', cover photo' : ''}, tap to remove`} accessibilityRole="button">
                  <Image source={{ uri: photo }} style={s.slotImage} accessibilityLabel={`Uploaded photo ${i + 1}${isCover ? ', cover' : ''}`} accessibilityRole="image" />
                  {isCover && <View style={s.coverBadge}><Text style={s.coverBadgeText}>Cover</Text></View>}
                  <View style={s.removeBtn}><XIcon size={14} color={colors.white} strokeWidth={2} /></View>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity key={i} style={[s.slot, s.emptySlot, isCover && s.coverSlot]} activeOpacity={0.7} onPress={pickPhoto} accessibilityLabel={isCover ? 'Add cover photo' : `Add photo to slot ${i + 1}`} accessibilityRole="button" accessibilityHint="Opens photo picker">
                <Text style={s.plusIcon}>+</Text>
                <Text style={s.slotLabel}>{isCover ? 'Cover photo' : 'Add photo'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
          <Text style={s.hint}>{photos.length}/6 photos added{photos.length < 5 ? ` · Need at least ${5 - photos.length} more` : ' '}</Text>
          {photos.length >= 5 && <CheckIcon size={14} color={colors.success} strokeWidth={2.5} />}
        </View>
      </View>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.nextBtn, photos.length < 5 && s.nextBtnDisabled]}
          activeOpacity={0.7}
          disabled={photos.length < 5}
          onPress={() => navigation.navigate('VendorPricing')}
          accessibilityLabel="Next"
          accessibilityRole="button"
          accessibilityHint="Proceed to set your pricing"
        >
          <Text style={s.nextBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: 20, paddingVertical: 8 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  content: { flex: 1, paddingHorizontal: 24 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.text, marginBottom: 8 },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { width: '47%', aspectRatio: 4 / 3, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  coverSlot: { width: '100%', aspectRatio: 16 / 9 },
  emptySlot: { borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center' },
  slotImage: { width: '100%', height: '100%' },
  plusIcon: { fontSize: 32, color: colors.textMuted, marginBottom: 4 },
  slotLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  coverBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.text, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  coverBadgeText: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.white },
  removeBtn: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  removeText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border },
  nextBtn: { backgroundColor: colors.text, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.3 },
  nextBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
