import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { fonts, spacing, borderRadius } from '../theme';
import { BadgeDefinition, getVendorBadges } from '../constants/badges';
import { useTheme } from '../context/ThemeContext';

// ─── Full badge row (for VendorDetailScreen) ───────────────

interface VendorBadgesProps {
  vendor: any;
}

export function VendorBadgesRow({ vendor }: VendorBadgesProps) {
  const { colors: themeColors } = useTheme();
  const badges = getVendorBadges(vendor);
  if (badges.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={detailStyles.container}
      accessibilityRole="list"
      accessibilityLabel="Vendor badges"
    >
      {badges.map((badge) => (
        <View
          key={badge.type}
          style={[detailStyles.pill, { backgroundColor: badge.backgroundColor }]}
          accessibilityRole="text"
          accessibilityLabel={`${badge.label} badge`}
        >
          <Text style={detailStyles.icon}>{badge.icon}</Text>
          <Text style={[detailStyles.label, { color: badge.textColor }]}>
            {badge.label}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const detailStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  icon: {
    fontSize: 13,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
});

// ─── Compact badges overlay (for VendorCard) ───────────────

interface VendorBadgesOverlayProps {
  vendor: any;
  maxBadges?: number;
}

export function VendorBadgesOverlay({ vendor, maxBadges = 1 }: VendorBadgesOverlayProps) {
  const { colors: themeColors } = useTheme();
  const badges = getVendorBadges(vendor).slice(0, maxBadges);
  if (badges.length === 0) return null;

  return (
    <View style={overlayStyles.container} accessibilityRole="list" accessibilityLabel="Vendor badges">
      {badges.map((badge) => (
        <View
          key={badge.type}
          style={[overlayStyles.pill, { backgroundColor: badge.backgroundColor }]}
          accessibilityRole="text"
          accessibilityLabel={`${badge.label} badge`}
        >
          <Text style={overlayStyles.icon}>{badge.icon}</Text>
          <Text style={[overlayStyles.label, { color: badge.textColor }]}>
            {badge.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const overlayStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    fontSize: 10,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
});
