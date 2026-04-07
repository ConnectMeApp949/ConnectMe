import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import { VendorSetupParamList, CATEGORIES } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { TruckIcon, MusicIcon, UtensilsIcon, RingsIcon, CameraIcon, SparklesIcon } from '../../components/Icons';

const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string; strokeWidth?: number }>> = {
  truck: TruckIcon,
  music: MusicIcon,
  utensils: UtensilsIcon,
  rings: RingsIcon,
  aperture: CameraIcon,
  sparkles: SparklesIcon,
};

type Props = NativeStackScreenProps<VendorSetupParamList, 'Category'>;

export default function CategoryScreen({ navigation, route }: Props) {
  const draft = route.params.draft;
  const [selected, setSelected] = useState<string>(draft.category ?? '');

  return (
    <ProfileSetupLayout
      step={2}
      totalSteps={7}
      title="What do you offer?"
      subtitle="Choose the category that best describes your services."
      onBack={() => navigation.goBack()}
      onContinue={() =>
        navigation.navigate('Bio', { draft: { ...draft, category: selected } })
      }
      continueDisabled={!selected}
    >
      <View style={styles.grid}>
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelected(cat.id)}
              activeOpacity={0.7}
            >
              {ICON_MAP[cat.icon] ? React.createElement(ICON_MAP[cat.icon], { size: 28, color: isSelected ? colors.primary : colors.textMuted }) : null}
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {cat.label}
              </Text>
              {isSelected && (
                <View style={styles.check}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
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
  icon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.primary,
  },
  check: {
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
});
