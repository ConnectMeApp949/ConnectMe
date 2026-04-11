import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, Share, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import { VendorBadgesRow } from '../../components/VendorBadges';
import CollapsibleSection from './CollapsibleSection';
import AvailabilityCalendar from './AvailabilityCalendar';
import PhotoGalleryModal from './PhotoGalleryModal';
import ReviewsSection from './ReviewsSection';
import { VendorDetail } from './types';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { ChevronLeftIcon, FlagIcon, ShareIcon, HeartIcon, HeartFilledIcon, MapPinIcon, StarIcon, CalendarIcon, MessageIcon, CameraIcon, SparklesIcon, CheckIcon } from '../../components/Icons';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 300;
const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCtFg5weRBNkpbZWmjaQrLpYyegYLGapqs';

const UNIT_LABELS: Record<string, string> = {
  PER_HOUR: 'per hour',
  PER_EVENT: 'per event',
  CUSTOM: 'custom quote',
};

const CATEGORY_LABELS: Record<string, string> = {
  FOOD_TRUCK: 'Food Truck', DJ: 'DJ', CATERING: 'Catering',
  WEDDING_SERVICES: 'Wedding Services', PHOTOGRAPHY: 'Photography',
  ENTERTAINMENT: 'Entertainment', OTHER: 'Other',
};

const CANCELLATION_POLICY = `Free cancellation up to 48 hours before the event. Cancellations within 48 hours are subject to a 50% charge. No-shows are charged the full amount. Vendors may cancel with 72 hours notice for a full refund.`;

// ─── Bio with read more ──────────────────────────────────

function BioText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 150;
  const display = isLong && !expanded ? text.slice(0, 150) + '...' : text;

  return (
    <View>
      <Text style={bioStyles.text}>{display}</Text>
      {isLong && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={bioStyles.toggle}>{expanded ? 'Read less' : 'Read more'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const bioStyles = StyleSheet.create({
  text: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, lineHeight: 24 },
  toggle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.accent, marginTop: spacing.sm },
});

// ─── Quick stat pill ─────────────────────────────────────

type IconComp = React.FC<{ size?: number; color?: string; strokeWidth?: number }>;

function QuickStat({ Icon, label, value }: { Icon: IconComp; label: string; value: string }) {
  return (
    <View style={statStyles.container}>
      <View style={statStyles.iconWrap}>
        <Icon size={18} color={colors.primary} strokeWidth={1.5} />
      </View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.border },
  value: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  label: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
});

// ─── Main screen ─────────────────────────────────────────

type Props = NativeStackScreenProps<any, 'VendorDetail'>;

export default function VendorDetailScreen({ navigation, route }: Props) {
  const vendor = route.params!.vendor as any;
  const coverPhoto = vendor.coverPhoto ?? null;
  const portfolioPhotos = vendor.portfolioPhotos ?? [];
  const allPhotos = [coverPhoto, ...portfolioPhotos].filter(Boolean) as string[];
  const recentReviews = vendor.recentReviews ?? [];

  const [heroIndex, setHeroIndex] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [heroImgError, setHeroImgError] = useState(false);
  const [portfolioImgErrors, setPortfolioImgErrors] = useState<Record<number, boolean>>({});
  const [mapImgError, setMapImgError] = useState(false);

  const { addViewed } = useRecentlyViewed();
  useEffect(() => {
    addViewed(vendor);
  }, [vendor?.id]);

  const memberYear = new Date(vendor.createdAt).getFullYear();
  const averageRating = Number(vendor.averageRating ?? 0);
  const totalReviews = Number(vendor.totalReviews ?? 0);
  const totalBookings = Number(vendor.totalBookings ?? 0);
  const basePrice = Number(vendor.basePrice ?? 0);

  // Vendors with even-numbered totalBookings get instant book
  const isInstantBook = totalBookings % 2 === 0 && totalBookings > 0;

  function onHeroScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setHeroIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
  }

  function openGallery(index: number) {
    setGalleryStartIndex(index);
    setGalleryVisible(true);
  }

  async function handleShare() {
    const descriptionPreview = vendor.bio
      ? vendor.bio.length > 80 ? vendor.bio.slice(0, 80) + '...' : vendor.bio
      : '';
    const message = descriptionPreview
      ? `Check out ${vendor.businessName} on ConnectMe! ${descriptionPreview} Book them for your next event!`
      : `Check out ${vendor.businessName} on ConnectMe! Book them for your next event!`;
    try {
      await Share.share({
        title: vendor.businessName,
        message,
        url: `https://connectmeapp.services/vendor/${vendor.id}`,
      });
    } catch {
      // User cancelled share
    }
  }

  function handleBookNow() {
    navigation.navigate('RequestBooking', { vendor, instantBook: isInstantBook });
  }

  function handleReport() {
    navigation.navigate('Report', {
      name: vendor.businessName,
      photo: vendor.coverPhoto,
      vendorId: vendor.id,
    });
  }

  const mapUrl = GOOGLE_MAPS_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(`${vendor.city}, ${vendor.state}`)}&zoom=10&size=600x300&key=${GOOGLE_MAPS_KEY}`
    : null;

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ─── Hero image ─── */}
        <View style={styles.heroContainer}>
          {allPhotos.length > 0 && !heroImgError ? (
            <TouchableOpacity activeOpacity={0.95} onPress={() => openGallery(0)}>
              <Image source={{ uri: allPhotos[0] }} style={styles.heroImage} onError={() => setHeroImgError(true)} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.heroImage, styles.heroFallback]}>
              <CameraIcon size={48} color="rgba(255,255,255,0.6)" strokeWidth={1.5} />
            </View>
          )}

          {/* Dots */}
          {allPhotos.length > 1 && (
            <View style={styles.heroDots}>
              {allPhotos.map((_, i) => (
                <View key={i} style={[styles.dot, i === heroIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          {/* Overlays on hero bottom-left */}
          <View style={styles.heroOverlay}>
            {vendor.user?.isVerified && (
              <View style={styles.verifiedBadge}>
                <CheckIcon size={12} color={colors.white} strokeWidth={2.5} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>
                {CATEGORY_LABELS[vendor.category] ?? vendor.category}
              </Text>
            </View>
          </View>

          {/* Top-right actions */}
          <SafeAreaView style={styles.heroActions} edges={['top']}>
            <TouchableOpacity style={styles.heroActionButton} onPress={() => navigation.goBack()} accessibilityLabel="Go back" accessibilityRole="button">
              <ChevronLeftIcon size={22} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.heroActionsRight}>
              <TouchableOpacity
                style={styles.heroActionButton}
                onPress={handleReport}
                accessibilityLabel="Report this vendor"
                accessibilityRole="button"
              >
                <FlagIcon size={20} color={colors.text} strokeWidth={1.5} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroActionButton} onPress={handleShare} accessibilityLabel="Share this vendor" accessibilityRole="button">
                <ShareIcon size={20} color={colors.text} strokeWidth={1.5} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroActionButton} onPress={() => setSaved(!saved)} accessibilityLabel={saved ? 'Remove from saved' : 'Save vendor'} accessibilityRole="button">
                {saved ? <HeartFilledIcon size={20} color={colors.secondary} /> : <HeartIcon size={20} color={colors.text} strokeWidth={1.5} />}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* ─── Vendor info header ─── */}
        <View style={styles.infoHeader}>
          <Text style={styles.vendorName}>{vendor.businessName}</Text>
          <VendorBadgesRow vendor={vendor} />
          <View style={styles.locationRow}>
            <MapPinIcon size={16} color={colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.location}>{vendor.city}, {vendor.state}</Text>
          </View>
          <View style={styles.ratingRow}>
            <StarIcon size={16} color={colors.star} />
            <Text style={styles.ratingText}>
              {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
            </Text>
            {totalReviews > 0 && (
              <Text style={styles.reviewCountText}>({totalReviews} reviews)</Text>
            )}
          </View>
        </View>

        {/* ─── Quick stats ─── */}
        <View style={styles.statsRow}>
          <QuickStat Icon={SparklesIcon} label="Events" value={String(totalBookings)} />
          <View style={styles.statDivider} />
          <QuickStat Icon={CalendarIcon} label="Member since" value={String(memberYear)} />
          <View style={styles.statDivider} />
          <QuickStat Icon={MessageIcon} label="Response" value="98%" />
        </View>

        {/* ─── Collapsible sections ─── */}
        <CollapsibleSection title={`About ${vendor.businessName}`} defaultOpen>
          {vendor.bio ? <BioText text={vendor.bio} /> : (
            <Text style={styles.emptyText}>No bio yet.</Text>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Services & Pricing" defaultOpen>
          <View style={styles.priceCard}>
            <Text style={styles.priceAmount}>
              ${basePrice.toFixed(0)}
            </Text>
            <Text style={styles.priceUnit}>
              {UNIT_LABELS[vendor.priceUnit] ?? vendor.priceUnit}
            </Text>
          </View>
        </CollapsibleSection>

        <CollapsibleSection title="Service Area">
          <Text style={styles.serviceAreaText}>
            {vendor.city}, {vendor.state} · {vendor.serviceRadius} mile radius
          </Text>
          {mapUrl && !mapImgError ? (
            <Image source={{ uri: mapUrl }} style={styles.mapImage} resizeMode="cover" onError={() => setMapImgError(true)} />
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.emptyText}>Map preview unavailable</Text>
            </View>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Portfolio">
          {portfolioPhotos.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {portfolioPhotos.map((uri: string, i: number) => (
                <TouchableOpacity key={i} onPress={() => openGallery(i + 1)} activeOpacity={0.9}>
                  {!portfolioImgErrors[i] ? (
                    <Image source={{ uri }} style={styles.portfolioImage} onError={() => setPortfolioImgErrors(prev => ({ ...prev, [i]: true }))} />
                  ) : (
                    <View style={[styles.portfolioImage, styles.portfolioFallback]}>
                      <CameraIcon size={24} color={colors.textMuted} strokeWidth={1.5} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No portfolio photos yet.</Text>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Reviews" defaultOpen={totalReviews > 0}>
          {totalReviews > 0 ? (
            <ReviewsSection
              averageRating={averageRating}
              totalReviews={totalReviews}
              reviews={recentReviews}
              onSeeAll={() => navigation.navigate('VendorReviews', { vendorId: vendor.id, businessName: vendor.businessName })}
            />
          ) : (
            <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Availability">
          <AvailabilityCalendar vendorId={vendor.id} />
        </CollapsibleSection>

        <CollapsibleSection title="Cancellation Policy">
          <Text style={styles.policyText}>{CANCELLATION_POLICY}</Text>
        </CollapsibleSection>

        {/* Bottom padding for sticky button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── Sticky Book Now ─── */}
      <View style={styles.stickyFooter}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceAmount}>
            ${basePrice.toFixed(0)}
          </Text>
          <Text style={styles.footerPriceUnit}>
            {UNIT_LABELS[vendor.priceUnit] ?? ''}
          </Text>
        </View>
        <View style={styles.footerBookSection}>
          <Button
            title={isInstantBook ? 'Instant Book' : 'Reserve'}
            onPress={handleBookNow}
            style={styles.bookButton}
          />
        </View>
      </View>

      {/* ─── Full-screen gallery modal ─── */}
      <PhotoGalleryModal
        visible={galleryVisible}
        photos={allPhotos}
        initialIndex={galleryStartIndex}
        onClose={() => setGalleryVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // Hero
  heroContainer: {
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  heroDots: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: colors.white,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  verifiedText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.white,
  },
  categoryPill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryPillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.white,
  },
  heroActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
  },
  heroActionsRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  heroActionIcon: {
    fontSize: 20,
    color: colors.text,
  },
  heroActionSaved: {
    color: colors.error,
  },

  // Info header
  infoHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  vendorName: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  location: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 4,
  },
  ratingText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  reviewCountText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },

  // Sections
  priceCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  priceAmount: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.primary,
  },
  priceUnit: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
  },
  serviceAreaText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  mapImage: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.md,
  },
  mapPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  portfolioImage: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  portfolioFallback: {
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroFallback: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  policyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Sticky footer — Airbnb-style
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 28,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerPrice: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  footerPriceAmount: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  footerPriceUnit: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },
  bookButton: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 28,
  },
  footerBookSection: {
    alignItems: 'flex-end',
  },
});
