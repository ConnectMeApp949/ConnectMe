import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius } from '../../theme';
import {
  ChevronLeftIcon, TruckIcon, MusicIcon, UtensilsIcon, RingsIcon, CameraIcon, SparklesIcon,
  CompassIcon, WellnessIcon, CoffeeIcon,
} from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'EditCategory'>;

const CATEGORIES = [
  { id: 'FOOD_TRUCK', label: 'Mobile Eats', Icon: TruckIcon },
  { id: 'DJ', label: 'Music', Icon: MusicIcon },
  { id: 'CATERING', label: 'Catering', Icon: UtensilsIcon },
  { id: 'WEDDING_SERVICES', label: 'Wedding Services', Icon: RingsIcon },
  { id: 'PHOTOGRAPHY', label: 'Photography', Icon: CameraIcon },
  { id: 'ENTERTAINMENT', label: 'Entertainment', Icon: SparklesIcon },
  { id: 'EXPERIENCES', label: 'Experiences', Icon: CompassIcon },
  { id: 'WELLNESS', label: 'Wellness', Icon: WellnessIcon },
  { id: 'BEVERAGES', label: 'Beverages', Icon: CoffeeIcon },
  { id: 'OTHER', label: 'Other', Icon: SparklesIcon },
];

export default function EditCategoryScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const [selected, setSelected] = useState('');

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Edit Category</Text>
        <TouchableOpacity onPress={() => { if (selected) { Alert.alert('Saved', 'Category updated!'); navigation.goBack(); } }} activeOpacity={0.6} accessibilityLabel="Save changes" accessibilityRole="button"><Text style={s.saveText}>Save</Text></TouchableOpacity>
      </View>
      <View style={s.content}>
        <View style={s.grid}>
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.Icon;
            return (
            <TouchableOpacity key={cat.id} style={[s.card, selected === cat.id && s.cardActive]} onPress={() => setSelected(cat.id)} activeOpacity={0.7} accessibilityLabel={`Select ${cat.label} category`} accessibilityRole="button" accessibilityState={{ selected: selected === cat.id }}>
              <CatIcon size={28} color={selected === cat.id ? colors.text : colors.textMuted} />
              <Text style={[s.cardLabel, selected === cat.id && s.cardLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
            );
          })}
        </View>
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
  card: { width: '47%', backgroundColor: colors.cardBackground, borderRadius: 12, borderWidth: 2, borderColor: colors.border, paddingVertical: 20, alignItems: 'center' },
  cardActive: { borderColor: colors.text, backgroundColor: colors.lightBlue },
  cardIconWrap: { marginBottom: 8 },
  cardLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text },
  cardLabelActive: { color: colors.text },
});
