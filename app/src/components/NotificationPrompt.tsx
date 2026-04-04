import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BellIcon, XIcon } from './Icons';
import { colors, fonts, spacing, borderRadius } from '../theme';

let Notifications: any = null;
try { Notifications = require('expo-notifications'); } catch { /* unavailable in this environment */ }

const PROMPT_DISMISSED_KEY = 'notifPromptDismissed';
const APP_OPEN_COUNT_KEY = 'appOpenCount';

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkVisibility();
  }, []);

  async function checkVisibility() {
    try {
      // Check if already dismissed
      const dismissed = await SecureStore.getItemAsync(PROMPT_DISMISSED_KEY);
      if (dismissed === 'true') return;

      // Check if permissions already granted
      if (Notifications) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') return;
      }

      // Increment and check app open count (show after 2nd open)
      const countStr = await SecureStore.getItemAsync(APP_OPEN_COUNT_KEY);
      const count = countStr ? parseInt(countStr, 10) + 1 : 1;
      await SecureStore.setItemAsync(APP_OPEN_COUNT_KEY, count.toString());

      if (count >= 2) {
        setVisible(true);
      }
    } catch {
      // SecureStore may fail in some environments; silently ignore
    }
  }

  async function handleEnable() {
    try {
      const { status } = Notifications ? await Notifications.requestPermissionsAsync() : { status: 'denied' };
      if (status === 'granted') {
        await SecureStore.setItemAsync(PROMPT_DISMISSED_KEY, 'true');
      }
    } catch {
      // Permission request failed; dismiss anyway
    }
    setVisible(false);
  }

  async function handleDismiss() {
    try {
      await SecureStore.setItemAsync(PROMPT_DISMISSED_KEY, 'true');
    } catch {
      // Ignore SecureStore errors
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <View style={styles.container} accessibilityRole="alert">
      <TouchableOpacity
        style={styles.dismissBtn}
        onPress={handleDismiss}
        activeOpacity={0.6}
        accessibilityLabel="Dismiss notification prompt"
        accessibilityRole="button"
      >
        <XIcon size={18} color={colors.textMuted} strokeWidth={2} />
      </TouchableOpacity>

      <View style={styles.iconWrap}>
        <BellIcon size={28} color={colors.primary} strokeWidth={1.5} />
      </View>

      <Text style={styles.title}>Never miss a booking update</Text>
      <Text style={styles.subtitle}>
        Get notified when vendors respond, bookings are confirmed, and more.
      </Text>

      <TouchableOpacity
        style={styles.enableBtn}
        onPress={handleEnable}
        activeOpacity={0.7}
        accessibilityLabel="Enable notifications"
        accessibilityRole="button"
        accessibilityHint="Requests permission to send you push notifications"
      >
        <Text style={styles.enableBtnText}>Enable Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDismiss}
        activeOpacity={0.6}
        accessibilityLabel="Not now"
        accessibilityRole="button"
        accessibilityHint="Dismisses the notification prompt"
      >
        <Text style={styles.dismissText}>Not now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  dismissBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  enableBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  enableBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  },
  dismissText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
});
