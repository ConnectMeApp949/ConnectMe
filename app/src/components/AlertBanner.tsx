import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAlert, AlertType } from '../context/AlertContext';
import { UsersIcon, CheckIcon, CalendarIcon, MessageIcon, StarIcon, XIcon } from './Icons';
import { fonts } from '../theme';

const DISMISS_DELAY = 5000;

const iconMap: Record<AlertType, React.FC<{ size?: number; color?: string; strokeWidth?: number }>> = {
  friendRequest: UsersIcon,
  bookingAccepted: CheckIcon,
  bookingReceived: CalendarIcon,
  newMessage: MessageIcon,
  reviewReceived: StarIcon,
};

const bgColorMap: Record<AlertType, { light: string; dark: string }> = {
  friendRequest: { light: '#2A8B8B', dark: '#2D6B6B' },
  bookingAccepted: { light: '#16A34A', dark: '#1B7A3D' },
  bookingReceived: { light: '#2A8B8B', dark: '#2D6B6B' },
  newMessage: { light: '#3B82F6', dark: '#2563EB' },
  reviewReceived: { light: '#F59E0B', dark: '#D97706' },
};

export default function AlertBanner() {
  const { currentAlert, dismissAlert } = useAlert();
  const { isDark, colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentAlert) {
      // Slide in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }).start();

      // Auto-dismiss
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, DISMISS_DELAY);
    } else {
      translateY.setValue(-120);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentAlert?.id]);

  function handleDismiss() {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(translateY, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      dismissAlert();
    });
  }

  function handlePress() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (currentAlert?.onPress) currentAlert.onPress();
    Animated.timing(translateY, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      dismissAlert();
    });
  }

  if (!currentAlert) return null;

  const Icon = iconMap[currentAlert.type];
  const bg = bgColorMap[currentAlert.type];
  const backgroundColor = isDark ? bg.dark : bg.light;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          paddingTop: insets.top + 4,
          backgroundColor,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        activeOpacity={0.8}
        onPress={handlePress}
        accessibilityLabel={`${currentAlert.title}: ${currentAlert.message}`}
        accessibilityRole="alert"
      >
        <View style={styles.iconWrap}>
          <Icon size={20} color="#FFFFFF" strokeWidth={2} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>{currentAlert.title}</Text>
          <Text style={styles.message} numberOfLines={1}>{currentAlert.message}</Text>
        </View>
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeBtn}
          activeOpacity={0.6}
          accessibilityLabel="Dismiss alert"
          accessibilityRole="button"
        >
          <XIcon size={18} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
