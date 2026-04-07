import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { CheckIcon, TruckIcon, MusicIcon, UtensilsIcon, RingsIcon, CameraIcon, SparklesIcon } from '../../components/Icons';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'VendorType'>;

const CATEGORIES = [
  { id: 'FOOD_TRUCK', label: 'Food Truck', icon: 'truck' },
  { id: 'DJ', label: 'Music', icon: 'music' },
  { id: 'CATERING', label: 'Catering', icon: 'utensils' },
  { id: 'WEDDING_SERVICES', label: 'Wedding Services', icon: 'rings' },
  { id: 'PHOTOGRAPHY', label: 'Photography', icon: 'aperture' },
  { id: 'ENTERTAINMENT', label: 'Entertainment', icon: 'sparkles' },
  { id: 'OTHER', label: 'Other', icon: 'sparkles' },
] as const;

const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string; strokeWidth?: number }>> = {
  truck: TruckIcon,
  music: MusicIcon,
  utensils: UtensilsIcon,
  rings: RingsIcon,
  aperture: CameraIcon,
  sparkles: SparklesIcon,
};

export default function VendorTypeScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  function toggleCategory(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleContinue() {
    if (selected.size === 0) return;

    setLoading(true);
    try {
      // TODO: save vendor categories to profile via API
      Alert.alert(
        'Welcome!',
        'Your vendor preferences have been saved. You can set up your vendor profile from the Profile tab.',
        [{ text: 'Get Started', onPress: () => setLoading(false) }],
      );
    } catch {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What do you offer?</Text>
        <Text style={styles.subtitle}>
          Select all categories that apply. You can change this later.
        </Text>

        <View style={styles.grid}>
          {CATEGORIES.map((cat) => {
            const isSelected = selected.has(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggleCategory(cat.id)}
                activeOpacity={0.7}
                accessibilityLabel={`${cat.label}${isSelected ? ', selected' : ''}`}
                accessibilityRole="button"
                accessibilityHint={`Double tap to ${isSelected ? 'deselect' : 'select'} ${cat.label}`}
                accessibilityState={{ selected: isSelected }}
              >
                {ICON_MAP[cat.icon] ? React.createElement(ICON_MAP[cat.icon], { size: 28, color: isSelected ? colors.primary : colors.textMuted }) : null}
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                  {cat.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <CheckIcon size={16} color={colors.white} strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Continue${selected.size > 0 ? ` (${selected.size})` : ''}`}
          onPress={handleContinue}
          loading={loading}
          disabled={selected.size === 0}
          accessibilityLabel={`Continue with ${selected.size} ${selected.size === 1 ? 'category' : 'categories'} selected`}
          accessibilityRole="button"
          accessibilityHint="Double tap to save your vendor preferences"
          accessibilityState={{ disabled: selected.size === 0 || loading }}
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
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.lightBlue,
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: colors.primary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
