import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { VendorSetupParamList, CATEGORIES } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { MapPinIcon, DollarIcon } from '../../components/Icons';

const UNIT_LABELS: Record<string, string> = {
  PER_HOUR: 'per hour',
  PER_EVENT: 'per event',
  CUSTOM: 'custom quote',
};

type Props = NativeStackScreenProps<VendorSetupParamList, 'Preview'>;

export default function PreviewScreen({ navigation, route }: Props) {
  const { draft } = route.params;
  const [publishing, setPublishing] = useState(false);

  const categoryLabel = CATEGORIES.find((c) => c.id === draft.category)?.label ?? draft.category;
  const coverPhoto = draft.photos?.[0];
  const portfolioPhotos = draft.photos?.slice(1) ?? [];
  const priceNum = parseFloat(draft.basePrice ?? '0');

  async function handlePublish() {
    setPublishing(true);
    try {
      // TODO: call POST /vendors/profile with draft data, then upload photos
      // navigation.replace('VendorHome');
    } catch {
      // handle error
    } finally {
      setPublishing(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover photo */}
        {coverPhoto && (
          <Image source={{ uri: coverPhoto }} style={styles.cover} />
        )}

        <View style={styles.body}>
          {/* Business name + category */}
          <Text style={styles.businessName}>{draft.businessName}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>

          {/* Location + radius */}
          <View style={styles.infoRow}>
            <MapPinIcon size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {draft.city}, {draft.state} · {draft.serviceRadius} mi radius
            </Text>
          </View>

          {/* Pricing */}
          <View style={styles.infoRow}>
            <DollarIcon size={16} color={colors.textSecondary} />
            <Text style={styles.priceText}>
              ${priceNum.toFixed(0)}{' '}
              <Text style={styles.priceUnit}>
                {UNIT_LABELS[draft.priceUnit ?? 'PER_HOUR']}
              </Text>
            </Text>
          </View>

          {/* Bio */}
          {draft.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{draft.bio}</Text>
            </View>
          )}

          {/* Portfolio */}
          {portfolioPhotos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Portfolio</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {portfolioPhotos.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.portfolioImage} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Rating placeholder */}
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>★ New vendor</Text>
            <Text style={styles.ratingSubtext}>0 reviews · 0 bookings</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Looks good — publish my profile"
          onPress={handlePublish}
          loading={publishing}
          style={styles.publishButton}
        />
        <Button
          title="Edit"
          onPress={() => navigation.navigate('BusinessName', { draft })}
          variant="outline"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cover: {
    width: '100%',
    height: 220,
  },
  body: {
    padding: spacing.lg,
  },
  businessName: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.text,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.lightBlue,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
  },
  priceText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.primary,
  },
  priceUnit: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  bioText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  portfolioImage: {
    width: 160,
    height: 120,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  ratingRow: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  ratingSubtext: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  publishButton: {
    marginBottom: 0,
  },
});
