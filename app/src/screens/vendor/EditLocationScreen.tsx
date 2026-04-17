import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TextInput from '../../components/TextInput';
import { colors, fonts } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'EditLocation'>;

export default function EditLocationScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Edit Location</Text>
        <TouchableOpacity onPress={() => { if (!address.trim() || !city.trim()) { Alert.alert('Required', 'Please fill in at least the street address and city.'); return; } Alert.alert('Saved', 'Location updated!'); navigation.goBack(); }} activeOpacity={0.6} accessibilityLabel="Save changes" accessibilityRole="button"><Text style={[s.saveText, { color: themeColors.primary }]}>Save</Text></TouchableOpacity>
      </View>
      <View style={s.content}>
        <TextInput label="Street address" placeholder="123 Main St" value={address} onChangeText={setAddress} />
        <View style={s.row}>
          <View style={s.flex2}><TextInput label="City" placeholder="San Antonio" value={city} onChangeText={setCity} /></View>
          <View style={s.flex1}><TextInput label="State" placeholder="TX" value={state} onChangeText={setState} maxLength={2} autoCapitalize="characters" /></View>
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
  row: { flexDirection: 'row', gap: 10 },
  flex2: { flex: 2 },
  flex1: { flex: 1 },
});
