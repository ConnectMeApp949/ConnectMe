import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import { BookingFlowParamList } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<BookingFlowParamList, 'Payment'>;

export default function PaymentScreen({ navigation, route }: Props) {
  const { vendor, draft, clientSecret, bookingId } = route.params;
  const [cardComplete, setCardComplete] = useState(false);
  const { confirmPayment, loading } = useConfirmPayment();

  const basePrice = Number(vendor.basePrice);
  const total = parseFloat((basePrice * 1.05).toFixed(2));

  async function handlePay() {
    if (!cardComplete) return;

    const { error, paymentIntent } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
    });

    if (error) {
      Alert.alert('Payment Failed', error.message);
      return;
    }

    if (paymentIntent) {
      navigation.navigate('Confirmation', { vendor, bookingId });
    }
  }

  return (
    <ProfileSetupLayout
      step={5}
      totalSteps={6}
      title="Payment"
      subtitle="Your card will be authorized but not charged until the vendor confirms."
      onBack={() => navigation.goBack()}
      onContinue={handlePay}
      continueLabel={`Confirm and Pay $${total.toFixed(2)}`}
      continueDisabled={!cardComplete}
      continueLoading={loading}
    >
      {/* Amount summary */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Total amount</Text>
        <Text style={styles.amountValue}>${total.toFixed(2)}</Text>
      </View>

      {/* Stripe card input */}
      <Text style={styles.label}>Card details</Text>
      <CardField
        postalCodeEnabled={true}
        placeholders={{ number: '4242 4242 4242 4242' }}
        cardStyle={{
          backgroundColor: colors.cardBackground,
          textColor: colors.text,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: borderRadius.md,
          fontSize: 16,
          placeholderColor: colors.textMuted,
        }}
        style={styles.cardField}
        onCardChange={(details) => setCardComplete(details.complete)}
      />

      {/* Security note */}
      <View style={styles.securityNote}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          Your payment information is encrypted and processed securely by Stripe.
          ConnectMe never stores your full card details.
        </Text>
      </View>
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  amountCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  amountLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.primary,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginBottom: spacing.lg,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  securityIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  securityText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 20,
  },
});
