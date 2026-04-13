import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeftIcon, ChevronRightIcon, XIcon, DollarIcon } from '../../components/Icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

type Props = NativeStackScreenProps<any, 'PaymentMethods'>;

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  label: string;
  last4?: string;
  brand?: string;
  email?: string;
  isDefault: boolean;
}

const CARD_LOGOS: Record<string, string> = {
  visa: 'https://img.icons8.com/color/48/visa.png',
  mastercard: 'https://img.icons8.com/color/48/mastercard-logo.png',
  amex: 'https://img.icons8.com/color/48/amex.png',
  discover: 'https://img.icons8.com/color/48/discover.png',
};

const CARD_FALLBACKS: Record<string, { label: string; color: string }> = {
  visa: { label: 'VISA', color: '#1A1F71' },
  mastercard: { label: 'MC', color: '#EB001B' },
  amex: { label: 'AMEX', color: '#006FCF' },
  discover: { label: 'DISC', color: '#FF6000' },
  paypal: { label: 'PP', color: '#003087' },
};

export default function PaymentMethodsScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const { token } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'paypal' | 'card' | null>(null);
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/payment-methods`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMethods(data.data);
      }
    } catch {
      // Silently fail -- the empty state is already handled in the UI
    }
  }, [token]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Refresh when returning from AddCard screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPaymentMethods();
    });
    return unsubscribe;
  }, [navigation, fetchPaymentMethods]);

  const handleLogoError = useCallback((key: string) => {
    setLogoErrors(prev => ({ ...prev, [key]: true }));
  }, []);

  function renderLogoOrFallback(key: string, uri: string, style: any, accessLabel: string) {
    if (logoErrors[key]) {
      const baseKey = key.replace(/_modal$|_option$/, '');
      const fallback = CARD_FALLBACKS[baseKey] ?? { label: baseKey.toUpperCase(), color: colors.textMuted };
      return (
        <View style={[style, { backgroundColor: colors.cardBackground, alignItems: 'center' as const, justifyContent: 'center' as const, borderWidth: 1, borderColor: colors.border, borderRadius: 4 }]}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 10, color: fallback.color }}>{fallback.label}</Text>
        </View>
      );
    }
    return (
      <Image source={{ uri }} style={style} onError={() => handleLogoError(key)} accessibilityLabel={accessLabel} accessibilityRole="image" />
    );
  }

  function handleConnectPayPal() {
    Alert.alert(
      'ConnectMe Wants to Use "www.paypal.com" to Sign In',
      'This allows the app and website to share information about you.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            setAddModalVisible(false);
            setSelectedOption(null);
            Linking.openURL('https://www.paypal.com/signin');
          },
        },
      ]
    );
  }

  function handleAddCard() {
    setAddModalVisible(false);
    setSelectedOption(null);
    navigation.navigate('AddCard');
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Payment Methods</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Current methods */}
        <Text style={[s.sectionTitle, { color: themeColors.text }]}>Current Payment Method</Text>
        {methods.map((m) => (
          <View key={m.id} style={[s.methodCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <View style={s.methodLeft}>
              {m.type === 'card' && m.brand && CARD_LOGOS[m.brand] ? (
                renderLogoOrFallback(m.brand, CARD_LOGOS[m.brand], s.cardLogo, `${m.brand} card logo`)
              ) : (
                renderLogoOrFallback('paypal', 'https://img.icons8.com/color/48/paypal.png', s.cardLogo, 'PayPal logo')
              )}
              <View>
                <Text style={[s.methodLabel, { color: themeColors.text }]}>{m.label}</Text>
                {m.isDefault && <Text style={s.defaultBadge}>Default</Text>}
              </View>
            </View>
            <ChevronRightIcon size={18} color={themeColors.textSecondary} strokeWidth={1.5} />
          </View>
        ))}

        {methods.length === 0 && (
          <View style={[s.emptyCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <View style={[s.emptyIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <DollarIcon size={36} color={themeColors.textSecondary} />
            </View>
            <Text style={[s.emptyText, { color: themeColors.textSecondary }]}>No payment methods added</Text>
          </View>
        )}

        {/* Add button */}
        <TouchableOpacity style={[s.addButton, { borderColor: colors.primary }]} onPress={() => { setSelectedOption(null); setAddModalVisible(true); }} activeOpacity={0.7} accessibilityLabel="Add Payment Method" accessibilityRole="button">
          <Text style={[s.addButtonText, { color: colors.primary }]}>+ Add Payment Method</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ─── Add Payment Method Modal ─── */}
      <Modal visible={addModalVisible} animationType="slide" transparent accessibilityViewIsModal={true}>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: themeColors.cardBackground }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: themeColors.text }]}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => { setAddModalVisible(false); setSelectedOption(null); }} accessibilityLabel="Close" accessibilityRole="button">
                <XIcon size={18} color={themeColors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* PayPal option */}
            <TouchableOpacity style={[s.optionRow, { borderBottomColor: themeColors.border }]} onPress={() => setSelectedOption('paypal')} activeOpacity={0.7} accessibilityLabel="PayPal" accessibilityRole="radio" accessibilityState={{ checked: selectedOption === 'paypal' }}>
              <View style={s.optionLeft}>
                <View style={[s.radio, { borderColor: themeColors.textSecondary }, selectedOption === 'paypal' && { borderColor: themeColors.text }]}>
                  {selectedOption === 'paypal' && <View style={[s.radioInner, { backgroundColor: themeColors.text }]} />}
                </View>
                {renderLogoOrFallback('paypal_option', 'https://img.icons8.com/color/48/paypal.png', s.optionLogo, 'PayPal logo')}
                <Text style={[s.optionLabel, { color: themeColors.text }]}>PayPal</Text>
              </View>
            </TouchableOpacity>

            {/* Credit/Debit card option */}
            <TouchableOpacity style={[s.optionRow, { borderBottomColor: themeColors.border }]} onPress={() => setSelectedOption('card')} activeOpacity={0.7} accessibilityLabel="Credit or Debit Card" accessibilityRole="radio" accessibilityState={{ checked: selectedOption === 'card' }}>
              <View style={s.optionLeft}>
                <View style={[s.radio, { borderColor: themeColors.textSecondary }, selectedOption === 'card' && { borderColor: themeColors.text }]}>
                  {selectedOption === 'card' && <View style={[s.radioInner, { backgroundColor: themeColors.text }]} />}
                </View>
                <Text style={[s.optionLabel, { color: themeColors.text }]}>Credit or Debit Card</Text>
              </View>
            </TouchableOpacity>

            {/* Card brand logos */}
            {selectedOption === 'card' && (
              <View style={s.cardLogosRow}>
                {renderLogoOrFallback('visa_modal', CARD_LOGOS.visa, s.brandLogo, 'Visa logo')}
                {renderLogoOrFallback('mastercard_modal', CARD_LOGOS.mastercard, s.brandLogo, 'Mastercard logo')}
                {renderLogoOrFallback('amex_modal', CARD_LOGOS.amex, s.brandLogo, 'Amex logo')}
                {renderLogoOrFallback('discover_modal', CARD_LOGOS.discover, s.brandLogo, 'Discover logo')}
              </View>
            )}

            {/* Action buttons */}
            {selectedOption && (
              <View style={s.modalActions}>
                <TouchableOpacity
                  style={[s.cancelBtn, { borderColor: themeColors.text }]}
                  onPress={() => { setAddModalVisible(false); setSelectedOption(null); }}
                  activeOpacity={0.7}
                  accessibilityLabel="Cancel"
                  accessibilityRole="button"
                >
                  <Text style={[s.cancelBtnText, { color: themeColors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.confirmBtn}
                  onPress={selectedOption === 'paypal' ? handleConnectPayPal : handleAddCard}
                  activeOpacity={0.7}
                  accessibilityLabel={selectedOption === 'paypal' ? 'Connect to PayPal' : 'Add Card'}
                  accessibilityRole="button"
                >
                  <Text style={s.confirmBtnText}>
                    {selectedOption === 'paypal' ? 'Connect to PayPal' : 'Add Card'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  scroll: { padding: 20 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 12 },

  // Method card
  methodCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
    elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardLogo: { width: 40, height: 28, resizeMode: 'contain' },
  methodLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  defaultBadge: { fontFamily: fonts.medium, fontSize: 11, color: colors.primary, marginTop: 2 },
  methodArrow: { fontSize: 22, color: colors.textMuted },

  emptyCard: { alignItems: 'center', paddingVertical: 32, backgroundColor: colors.cardBackground, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 8 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },

  addButton: { paddingVertical: 14, borderRadius: 10, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center' },
  addButtonText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.primary },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  modalClose: { fontSize: 20, color: colors.textMuted, padding: 4 },

  // Options
  optionRow: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionLogo: { width: 32, height: 22, resizeMode: 'contain' },
  optionLabel: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.text },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.text },

  // Card logos row
  cardLogosRow: { flexDirection: 'row', gap: 12, paddingVertical: 16, paddingLeft: 34 },
  brandLogo: { width: 44, height: 30, resizeMode: 'contain' },

  // Action buttons
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.text, alignItems: 'center' },
  cancelBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center' },
  confirmBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },
});
