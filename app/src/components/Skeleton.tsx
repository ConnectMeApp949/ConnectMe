import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../theme';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function Skeleton({
  width,
  height,
  borderRadius: br = borderRadius.sm,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: br, backgroundColor: colors.border, opacity },
        style,
      ]}
    />
  );
}

// Common skeleton layouts
export function SkeletonText({ lines = 3, width = '100%' }: { lines?: number; width?: string | number }) {
  return (
    <View style={skStyles.textContainer}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : width}
          height={12}
          style={{ marginBottom: 8 }}
        />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View style={skStyles.card}>
      <Skeleton width="100%" height={120} borderRadius={borderRadius.md} />
      <Skeleton width="70%" height={14} style={{ marginTop: 12 }} />
      <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
    </View>
  );
}

const skStyles = StyleSheet.create({
  textContainer: { gap: 4 },
  card: { marginBottom: 16 },
});
