import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, XIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'EditPhotos'>;

export default function EditPhotosScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const [photos, setPhotos] = useState<string[]>([]);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6 - photos.length,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 6));
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Edit Photos</Text>
        <TouchableOpacity onPress={() => { Alert.alert('Saved', 'Photos updated!'); navigation.goBack(); }} activeOpacity={0.6} accessibilityLabel="Save changes" accessibilityRole="button"><Text style={s.saveText}>Save</Text></TouchableOpacity>
      </View>
      <View style={s.content}>
        <View style={s.grid}>
          {Array.from({ length: 6 }).map((_, i) => {
            const photo = photos[i];
            if (photo) {
              return (
                <TouchableOpacity key={i} style={[s.slot, i === 0 && s.coverSlot]} activeOpacity={0.8} onPress={() => removePhoto(i)} accessibilityLabel={`Photo ${i + 1}${i === 0 ? ', cover photo' : ''}, tap to remove`} accessibilityRole="button">
                  <Image source={{ uri: photo }} style={s.slotImage} accessibilityLabel={`Uploaded photo ${i + 1}${i === 0 ? ', cover' : ''}`} accessibilityRole="image" />
                  {i === 0 && <View style={s.coverBadge}><Text style={s.coverBadgeText}>Cover</Text></View>}
                  <View style={s.removeBtn}><XIcon size={14} color={colors.white} strokeWidth={2} /></View>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity key={i} style={[s.slot, s.emptySlot, i === 0 && s.coverSlot]} activeOpacity={0.7} onPress={pickPhoto} accessibilityLabel={`Add photo to slot ${i + 1}${i === 0 ? ', cover photo' : ''}`} accessibilityRole="button" accessibilityHint="Opens photo picker">
                <Text style={s.plusIcon}>+</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={s.hint}>Tap + to add, tap photo to remove. First photo is your cover.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  saveText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.primary },
  content: { padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { width: '47%', aspectRatio: 4 / 3, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  coverSlot: { width: '100%', aspectRatio: 16 / 9 },
  emptySlot: { borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center' },
  slotImage: { width: '100%', height: '100%' },
  plusIcon: { fontSize: 32, color: colors.textMuted },
  coverBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.text, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  coverBadgeText: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.white },
  removeBtn: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  removeText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  hint: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 16 },
});
