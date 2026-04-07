import { colors } from '../theme';

export type BadgeType = 'TOP_RATED' | 'SUPER_VENDOR' | 'QUICK_RESPONDER' | 'VERIFIED' | 'NEW';

export interface BadgeDefinition {
  type: BadgeType;
  label: string;
  icon: string;
  backgroundColor: string;
  textColor: string;
}

export const BADGES: Record<BadgeType, BadgeDefinition> = {
  TOP_RATED: {
    type: 'TOP_RATED',
    label: 'Top Rated',
    icon: '⭐',
    backgroundColor: colors.star,
    textColor: '#1A1A1A',
  },
  SUPER_VENDOR: {
    type: 'SUPER_VENDOR',
    label: 'Super Vendor',
    icon: '🏆',
    backgroundColor: colors.primary,
    textColor: colors.white,
  },
  QUICK_RESPONDER: {
    type: 'QUICK_RESPONDER',
    label: 'Quick Responder',
    icon: '⚡',
    backgroundColor: colors.success,
    textColor: colors.white,
  },
  VERIFIED: {
    type: 'VERIFIED',
    label: 'Verified',
    icon: '✓',
    backgroundColor: colors.accent,
    textColor: colors.white,
  },
  NEW: {
    type: 'NEW',
    label: 'New',
    icon: '✨',
    backgroundColor: '#8B5CF6',
    textColor: colors.white,
  },
};

/**
 * Compute which badges a vendor qualifies for based on their data.
 */
export function getVendorBadges(vendor: any): BadgeDefinition[] {
  const badges: BadgeDefinition[] = [];

  const averageRating = Number(vendor.averageRating ?? 0);
  const totalBookings = Number(vendor.totalBookings ?? 0);

  if (averageRating >= 4.8) {
    badges.push(BADGES.TOP_RATED);
  }

  if (totalBookings >= 50) {
    badges.push(BADGES.SUPER_VENDOR);
  }

  if (vendor.quickResponder || vendor.isQuickResponder) {
    badges.push(BADGES.QUICK_RESPONDER);
  }

  if (vendor.user?.isVerified || vendor.isVerified) {
    badges.push(BADGES.VERIFIED);
  }

  if (vendor.createdAt) {
    const created = new Date(vendor.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (created >= thirtyDaysAgo) {
      badges.push(BADGES.NEW);
    }
  }

  return badges;
}
