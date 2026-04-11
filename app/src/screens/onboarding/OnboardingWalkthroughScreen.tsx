import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { SearchIcon, CalendarIcon, MessageIcon, SparklesIcon } from '../../components/Icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ONBOARDING_KEY = 'hasSeenOnboarding';

interface SlideData {
  id: string;
  Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  description: string;
}

const slides: SlideData[] = [
  {
    id: '1',
    Icon: SearchIcon,
    title: 'Discover Amazing Vendors',
    description:
      'Browse top-rated DJs, caterers, photographers, food trucks, and more — all in your area.',
  },
  {
    id: '2',
    Icon: CalendarIcon,
    title: 'Book with Confidence',
    description:
      'Read reviews, compare prices, and book your perfect vendor in just a few taps. Secure payments protected by ConnectMe.',
  },
  {
    id: '3',
    Icon: MessageIcon,
    title: 'Stay Connected',
    description:
      'Message vendors directly, get real-time updates, and manage all your bookings in one place.',
  },
  {
    id: '4',
    Icon: SparklesIcon,
    title: "Let's Make It Happen",
    description:
      'Join thousands of people finding the best event vendors in your area.',
  },
];

export async function checkHasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
  } catch {
    // Silently fail — worst case user sees onboarding again
  }
}

interface Props {
  navigation: any;
}

export default function OnboardingWalkthroughScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<SlideData>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === slides.length - 1;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleComplete = useCallback(async () => {
    await markOnboardingSeen();
    navigation.replace('Welcome');
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  }, [currentIndex]);

  const renderSlide = useCallback(
    ({ item, index }: { item: SlideData; index: number }) => {
      const SlideIcon = item.Icon;
      return (
      <View
        style={styles.slide}
        accessibilityLabel={`Onboarding slide ${index + 1} of ${slides.length}: ${item.title}`}
        accessibilityRole="summary"
      >
        <View style={styles.iconContainer}>
          <SlideIcon size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
      );
    },
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Skip button */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + spacing.md }]}
        onPress={handleComplete}
        accessibilityLabel="Skip onboarding walkthrough"
        accessibilityRole="button"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        style={styles.flatList}
      />

      {/* Bottom controls */}
      <View style={styles.bottomContainer}>
        {/* Dot indicators */}
        <View style={styles.dotsContainer} accessibilityLabel={`Page ${currentIndex + 1} of ${slides.length}`}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
              accessibilityLabel={`Dot ${index + 1}${index === currentIndex ? ', current page' : ''}`}
            />
          ))}
        </View>

        {/* Action button */}
        {isLastSlide ? (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleComplete}
            accessibilityLabel="Get Started"
            accessibilityRole="button"
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            accessibilityLabel="Next slide"
            accessibilityRole="button"
          >
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textSecondary,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  bottomContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: spacing.xs,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  nextText: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.white,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  getStartedText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.white,
  },
});
