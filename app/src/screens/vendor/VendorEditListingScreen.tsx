import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts } from '../../theme';
import {
  ChevronLeftIcon, CameraIcon, FileTextIcon, DollarIcon, MapPinIcon, SettingsIcon, ClockIcon,
  ChevronRightIcon, MessageIcon,
} from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'VendorEditListing'>;

const SECTIONS = [
  { Icon: CameraIcon, label: 'Photos', sub: 'Add or remove photos', screen: 'EditPhotos' },
  { Icon: FileTextIcon, label: 'Description', sub: 'Update your bio', screen: 'EditDescription' },
  { Icon: DollarIcon, label: 'Pricing', sub: 'Change your rates', screen: 'EditPricing' },
  { Icon: MapPinIcon, label: 'Location', sub: 'Update your address', screen: 'EditLocation' },
  { Icon: SettingsIcon, label: 'Category', sub: 'Change business type', screen: 'EditCategory' },
  { Icon: ClockIcon, label: 'Service radius', sub: 'Adjust your service area', screen: 'EditRadius' },
  { Icon: MessageIcon, label: 'Booking Questions', sub: 'Customize client intake form', screen: 'EditBookingQuestions' },
];

export default function VendorEditListingScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Edit listing</Text>
        <View style={s.backBtn} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        {SECTIONS.map((item) => {
          const RowIcon = item.Icon;
          return (
          <TouchableOpacity key={item.label} style={s.row} activeOpacity={0.6} onPress={() => navigation.navigate(item.screen)} accessibilityLabel={`${item.label}: ${item.sub}`} accessibilityRole="button">
            <View style={s.rowIconBox}>
              <RowIcon size={20} color={colors.text} />
            </View>
            <View style={s.rowContent}>
              <Text style={s.rowLabel}>{item.label}</Text>
              <Text style={s.rowSub}>{item.sub}</Text>
            </View>
            <ChevronRightIcon size={18} color={colors.textMuted} strokeWidth={1.5} />
          </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  scroll: { padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.cardBackground,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  rowSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  rowArrow: { fontSize: 22, color: colors.textMuted },
});
