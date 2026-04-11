import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import Button from '../../components/Button';
import { BookingFlowParamList } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<BookingFlowParamList, 'Confirmation'>;

export default function ConfirmationScreen({ navigation, route }: Props) {
  const { vendor, bookingId } = route.params;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated checkmark */}
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.checkIcon}>✓</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Booking request sent!</Text>
          <Text style={styles.subtitle}>
            Your request has been sent to{'\n'}
            <Text style={styles.vendorName}>{vendor.businessName}</Text>
          </Text>

          {/* Response time */}
          <View style={styles.responseCard}>
            <Text style={styles.responseIcon}>⏱</Text>
            <View>
              <Text style={styles.responseTitle}>Expected response time</Text>
              <Text style={styles.responseValue}>Usually responds within 2 hours</Text>
            </View>
          </View>

          {/* What's next */}
          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>What happens next?</Text>
            <View style={styles.step}>
              <View style={styles.stepDot}><Text style={styles.stepNumber}>1</Text></View>
              <Text style={styles.stepText}>Vendor reviews your request</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepDot}><Text style={styles.stepNumber}>2</Text></View>
              <Text style={styles.stepText}>They confirm or suggest changes</Text>
            </View>
            <View style={styles.step}>
              <View style={[styles.stepDot, styles.stepDotLast]}><Text style={styles.stepNumber}>3</Text></View>
              <Text style={styles.stepText}>Your card is charged once confirmed</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Actions */}
      <View style={styles.footer}>
        <Button
          title="Message Vendor"
          onPress={() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'Main',
                    state: {
                      routes: [
                        {
                          name: 'Messages',
                          params: { vendorId: vendor.id, vendorName: vendor.businessName },
                        },
                      ],
                    },
                  },
                ],
              }),
            );
          }}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="View Booking"
          onPress={() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'Main',
                    state: {
                      routes: [
                        {
                          name: 'Bookings',
                        },
                      ],
                    },
                  },
                ],
              }),
            );
          }}
          style={styles.actionButton}
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  checkIcon: {
    fontSize: 40,
    color: colors.white,
    fontWeight: '700',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  vendorName: {
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  responseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  responseIcon: {
    fontSize: 24,
  },
  responseTitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  responseValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    marginTop: 2,
  },
  stepsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    width: '100%',
  },
  stepsTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotLast: {
    backgroundColor: colors.accent,
  },
  stepNumber: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.white,
  },
  stepText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  actionButton: {
    marginBottom: 0,
  },
});
