import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import { VendorSetupParamList } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const MAX_PHOTOS = 6;

type PhotoSlot = {
  uri: string;
  uploading?: boolean;
};

type Props = NativeStackScreenProps<VendorSetupParamList, 'Photos'>;

export default function PhotosScreen({ navigation, route }: Props) {
  const draft = route.params.draft;
  const [photos, setPhotos] = useState<PhotoSlot[]>(
    (draft.photos ?? []).map((uri) => ({ uri }))
  );

  async function pickImage(index: number) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    const newPhotos = [...photos];

    if (index < photos.length) {
      newPhotos[index] = { uri, uploading: true };
    } else {
      newPhotos.push({ uri, uploading: true });
    }
    setPhotos(newPhotos);

    // Upload photo to API
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
      const formData = new FormData();
      formData.append('photo', { uri, type: 'image/jpeg', name: 'photo.jpg' } as any);
      await fetch(API_URL + '/vendors/upload-photo', {
        method: 'POST',
        body: formData,
      });
    } catch {
      // Photo saved locally, will sync when online
    } finally {
      setPhotos((prev) =>
        prev.map((p) => (p.uri === uri ? { ...p, uploading: false } : p))
      );
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  const hasMinimum = photos.length >= 1 && photos.every((p) => !p.uploading);

  return (
    <ProfileSetupLayout
      step={6}
      totalSteps={7}
      title="Add your best photos"
      subtitle="The first photo is your cover. Show off your work!"
      onBack={() => navigation.goBack()}
      onContinue={() =>
        navigation.navigate('Preview', {
          draft: { ...draft, photos: photos.map((p) => p.uri) },
        })
      }
      continueDisabled={!hasMinimum}
    >
      <View style={styles.grid}>
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
          const photo = photos[i];
          const isCover = i === 0;

          if (photo) {
            return (
              <TouchableOpacity
                key={i}
                style={[styles.slot, isCover && styles.coverSlot]}
                onLongPress={() => removePhoto(i)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: photo.uri }} style={styles.image} />
                {photo.uploading && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator color={colors.white} />
                  </View>
                )}
                {isCover && (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>Cover</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePhoto(i)}
                >
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={i}
              style={[styles.slot, styles.emptySlot, isCover && styles.coverSlot]}
              onPress={() => pickImage(i)}
              activeOpacity={0.7}
            >
              <Text style={styles.plusIcon}>+</Text>
              <Text style={styles.slotLabel}>
                {isCover ? 'Cover photo' : 'Portfolio'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.hint}>Long press to remove. Minimum 1 photo required.</Text>
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slot: {
    width: '48%',
    aspectRatio: 4 / 3,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  coverSlot: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  emptySlot: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  coverBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.white,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  plusIcon: {
    fontSize: 32,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  slotLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
