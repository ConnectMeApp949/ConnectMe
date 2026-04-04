import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, XIcon, CheckIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'SetupPayouts'>;

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China',
  'Colombia', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark',
  'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Estonia', 'Ethiopia', 'Fiji', 'Finland',
  'France', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
  'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Libya', 'Lithuania', 'Luxembourg',
  'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan',
  'Panama', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia',
  'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand',
  'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Venezuela', 'Vietnam', 'Zimbabwe',
];

interface PayoutOption {
  id: string;
  title: string;
  bullets: string[];
}

const PAYOUT_OPTIONS: PayoutOption[] = [
  {
    id: 'fast_pay',
    title: 'Fast Pay',
    bullets: [
      'Visa or Mastercard debit required',
      '30 minutes or less',
      '1.5% fee (maximum $15 USD)',
    ],
  },
  {
    id: 'bank_account',
    title: 'Bank Account',
    bullets: [
      '3–5 business days',
      'No fees',
    ],
  },
  {
    id: 'paypal',
    title: 'PayPal',
    bullets: [
      '1 business day',
      'PayPal fees may apply',
    ],
  },
];

export default function SetupPayoutsScreen({ navigation }: Props) {
  const [country, setCountry] = useState('United States');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Payout Method</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.title}>Let's add a payout method</Text>
        <Text style={s.subtitle}>To start, let us know where you'd like us to send your money.</Text>

        {/* Country selector */}
        <Text style={s.sectionLabel}>Billing country/region</Text>
        <TouchableOpacity style={s.dropdownBtn} onPress={() => setCountryModalVisible(true)} activeOpacity={0.6} accessibilityLabel={`Billing country/region, currently ${country}`} accessibilityRole="button" accessibilityHint="Opens country selector">
          <Text style={s.dropdownHint}>Billing country/region</Text>
          <Text style={s.dropdownValue}>{country}</Text>
          <Text style={s.dropdownArrow}>▾</Text>
        </TouchableOpacity>
        <Text style={s.dropdownNote}>This is where you opened your financial account.</Text>

        {/* Payout options */}
        <Text style={s.sectionLabel}>How would you like to get paid?</Text>
        <Text style={s.payoutNote}>Payouts will be sent in USD.</Text>

        {PAYOUT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[s.optionCard, selectedOption === option.id && s.optionCardSelected]}
            onPress={() => setSelectedOption(option.id)}
            activeOpacity={0.7}
            accessibilityLabel={option.title}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedOption === option.id }}
          >
            <View style={s.optionHeader}>
              <Text style={s.optionTitle}>{option.title}</Text>
              <View style={[s.radio, selectedOption === option.id && s.radioSelected]}>
                {selectedOption === option.id && <View style={s.radioInner} />}
              </View>
            </View>
            {option.bullets.map((bullet, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{bullet}</Text>
              </View>
            ))}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Continue button */}
      {selectedOption && (
        <View style={s.footer}>
          <TouchableOpacity
            style={s.continueBtn}
            onPress={() => {
              Alert.alert('Payout Method Saved', 'Your payout preference has been updated. You\'ll receive payments via your selected method.', [{ text: 'Done', onPress: () => navigation.goBack() }]);
            }}
            activeOpacity={0.7}
            accessibilityLabel="Continue"
            accessibilityRole="button"
            accessibilityHint="Save your payout method selection"
          >
            <Text style={s.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Country Picker Modal ─── */}
      <Modal visible={countryModalVisible} animationType="slide" transparent accessibilityViewIsModal={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Billing Country/Region</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)} accessibilityLabel="Close" accessibilityRole="button">
                <XIcon size={18} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item}
              style={s.countryList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.countryRow, item === country && s.countryRowActive]}
                  onPress={() => { setCountry(item); setCountryModalVisible(false); }}
                  activeOpacity={0.6}
                  accessibilityLabel={item}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item === country }}
                >
                  <Text style={[s.countryText, item === country && s.countryTextActive]}>{item}</Text>
                  {item === country && <CheckIcon size={16} color={colors.primary} strokeWidth={2.5} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  scroll: { padding: 20, paddingBottom: 100 },

  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 8 },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: 28 },

  sectionLabel: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginBottom: 10 },

  dropdownBtn: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md,
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.cardBackground,
  },
  dropdownHint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  dropdownValue: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  dropdownArrow: { position: 'absolute', right: 16, top: 20, fontSize: 16, color: colors.textMuted },
  dropdownNote: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 6, marginBottom: 28 },

  payoutNote: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginBottom: 16 },

  optionCard: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md,
    padding: 16, marginBottom: 12, backgroundColor: colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  optionCardSelected: { borderColor: colors.text },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  optionTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },

  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.text },
  radioInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.text },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, paddingLeft: 4 },
  bulletDot: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginRight: 8, marginTop: 1 },
  bulletText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, flex: 1 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  continueBtn: { backgroundColor: colors.text, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  continueBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },

  // Country modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '70%', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  modalClose: { fontSize: 20, color: colors.textMuted, padding: 4 },
  countryList: { maxHeight: 400 },
  countryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  countryRowActive: { backgroundColor: colors.cardBackground },
  countryText: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  countryTextActive: { fontFamily: fonts.semiBold, color: colors.primary },
  countryCheck: { fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
});
