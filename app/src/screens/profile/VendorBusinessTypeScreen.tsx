import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import {
  ChevronLeftIcon, TruckIcon, MusicIcon, UtensilsIcon, RingsIcon, CameraIcon, SparklesIcon,
  CompassIcon, WellnessIcon, CheckIcon,
} from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'VendorBusinessType'>;

const CATEGORIES = [
  { id: 'FOOD_TRUCK', label: 'Food Truck', Icon: TruckIcon },
  { id: 'DJ', label: 'Music', Icon: MusicIcon },
  { id: 'CATERING', label: 'Catering', Icon: UtensilsIcon },
  { id: 'WEDDING_SERVICES', label: 'Wedding Services', Icon: RingsIcon },
  { id: 'PHOTOGRAPHY', label: 'Photography', Icon: CameraIcon },
  { id: 'ENTERTAINMENT', label: 'Entertainment', Icon: SparklesIcon },
  { id: 'EXPERIENCES', label: 'Experiences', Icon: CompassIcon },
  { id: 'WELLNESS', label: 'Wellness', Icon: WellnessIcon },
  { id: 'OTHER', label: 'Other', Icon: SparklesIcon },
];

export default function VendorBusinessTypeScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.title}>Which of these best describes your business?</Text>

        <View style={s.grid}>
          {CATEGORIES.map((cat) => {
            const isSelected = selected === cat.id;
            const CatIcon = cat.Icon;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[s.card, isSelected && s.cardSelected]}
                onPress={() => setSelected(cat.id)}
                activeOpacity={0.7}
                accessibilityLabel={`Select ${cat.label} category`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <CatIcon size={36} color={isSelected ? colors.text : colors.textMuted} />
                <Text style={[s.cardLabel, isSelected && s.cardLabelSelected]}>{cat.label}</Text>
                {isSelected && (
                  <View style={s.checkBadge}>
                    <CheckIcon size={14} color={colors.white} strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.nextBtn, !selected && s.nextBtnDisabled]}
          activeOpacity={0.7}
          disabled={!selected}
          onPress={() => navigation.navigate('VendorLocation')}
          accessibilityLabel="Next"
          accessibilityRole="button"
          accessibilityHint="Proceed to enter your location"
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
  scroll: { paddingHorizontal: 24, paddingBottom: 100 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.text, marginBottom: 24 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  cardSelected: {
    borderColor: colors.text,
    backgroundColor: colors.lightBlue,
  },
  cardIconWrap: {
    marginBottom: 10,
  },
  cardLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: colors.text,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: colors.white,
    fontSize: 14,
  },

  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border },
  nextBtn: { backgroundColor: colors.text, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.3 },
  nextBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
