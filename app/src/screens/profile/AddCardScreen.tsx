import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeftIcon, XIcon, CheckIcon } from '../../components/Icons';
import { apiHeaders } from '../../services/headers';

type Props = NativeStackScreenProps<any, 'AddCard'>;

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
  'Madagascar', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mexico', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua',
  'Niger', 'Nigeria', 'North Korea', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia',
  'Senegal', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'South Korea',
  'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tanzania', 'Thailand',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen',
  'Zambia', 'Zimbabwe',
];

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export default function AddCardScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [cardNumber, setCardNumber] = useState('');
  const [expiration, setExpiration] = useState('');
  const [cvv, setCvv] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  function formatCardNumber(text: string) {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  }

  function formatExpiration(text: string) {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length > 2) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    return cleaned;
  }

  async function handleDone() {
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 13) { Alert.alert('Invalid', 'Please enter a valid card number.'); return; }
    if (!luhnCheck(cleanCard)) { Alert.alert('Invalid', 'Please enter a valid card number.'); return; }
    if (expiration.length < 5) { Alert.alert('Invalid', 'Please enter a valid expiration date.'); return; }
    if (cvv.length < 3) { Alert.alert('Invalid', 'Please enter a valid CVV.'); return; }
    if (!zipCode.trim()) { Alert.alert('Invalid', 'Please enter your zip code.'); return; }

    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
      const res = await fetch(`${API_URL}/payment-methods`, {
        method: 'POST',
        headers: apiHeaders(token),
        body: JSON.stringify({
          cardNumber: cleanCard,
          expiration,
          cvv,
          zipCode,
          country,
        }),
      });
      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to add card');
      }
      Alert.alert('Card Added', 'Your payment method has been saved.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not add your card. Please try again.');
    }
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Add Card Details</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Card Number */}
        <Text style={s.label}>Card number</Text>
        <TextInput
          style={s.input}
          value={cardNumber}
          onChangeText={(t) => setCardNumber(formatCardNumber(t))}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={19}
          accessibilityLabel="Card number"
          accessibilityRole="text"
        />

        {/* Expiration + CVV row */}
        <View style={s.row}>
          <View style={s.halfField}>
            <Text style={s.label}>Expiration</Text>
            <TextInput
              style={s.input}
              value={expiration}
              onChangeText={(t) => setExpiration(formatExpiration(t))}
              placeholder="MM/YY"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={5}
              accessibilityLabel="Expiration date"
              accessibilityRole="text"
            />
          </View>
          <View style={s.halfField}>
            <Text style={s.label}>CVV</Text>
            <TextInput
              style={s.input}
              value={cvv}
              onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              accessibilityLabel="CVV"
              accessibilityRole="text"
            />
          </View>
        </View>

        {/* Zip Code */}
        <Text style={s.label}>Zip code</Text>
        <TextInput
          style={s.input}
          value={zipCode}
          onChangeText={setZipCode}
          placeholder="78201"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={10}
          accessibilityLabel="Zip code"
          accessibilityRole="text"
        />

        {/* Country/Region */}
        <Text style={s.label}>Country/Region</Text>
        <TouchableOpacity style={s.dropdownBtn} onPress={() => setCountryModalVisible(true)} activeOpacity={0.6} accessibilityLabel={`Country/Region, currently ${country}`} accessibilityRole="button" accessibilityHint="Opens country selector">
          <Text style={s.dropdownText}>{country}</Text>
          <Text style={s.dropdownArrow}>▾</Text>
        </TouchableOpacity>

        {/* Action buttons */}
        <View style={s.actions}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} accessibilityLabel="Cancel" accessibilityRole="button">
            <Text style={s.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.doneBtn} onPress={handleDone} activeOpacity={0.7} accessibilityLabel="Done" accessibilityRole="button" accessibilityHint="Save card details">
            <Text style={s.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── Country Picker Modal ─── */}
      <Modal visible={countryModalVisible} animationType="slide" transparent accessibilityViewIsModal={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Country/Region</Text>
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
  scroll: { padding: 20, paddingBottom: 40 },

  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginBottom: 6, marginTop: 16 },
  input: {
    fontFamily: fonts.regular, fontSize: 16, color: colors.text,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md,
    paddingHorizontal: 16, height: 50, backgroundColor: colors.cardBackground,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },

  dropdownBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md,
    paddingHorizontal: 16, height: 50, backgroundColor: colors.cardBackground,
  },
  dropdownText: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  dropdownArrow: { fontSize: 16, color: colors.textMuted },

  actions: { flexDirection: 'row', gap: 12, marginTop: 32 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.text, alignItems: 'center' },
  cancelBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  doneBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: colors.text, alignItems: 'center' },
  doneBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },

  // Country modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '70%' },
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
