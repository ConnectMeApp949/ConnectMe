import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, fonts, spacing } from '../theme';
import { apiHeaders } from '../services/headers';

// Simple network check — polls /health endpoint
export default function NetworkToast() {
  const [offline, setOffline] = useState(false);
  const translateY = React.useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
        const res = await fetch(`${API_URL}/health`, { method: 'GET', headers: apiHeaders() });
        setOffline(!res.ok);
      } catch {
        setOffline(true);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: offline ? 0 : -60,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [offline]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: colors.error, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.sm, paddingTop: spacing.xl, gap: spacing.sm,
    zIndex: 9999,
  },
  icon: { fontSize: 16 },
  text: { fontFamily: fonts.medium, fontSize: 14, color: colors.white },
});
