import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { colors, fonts, spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const { colors: themeColors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  }

  return (
    <View style={[styles.container, { borderBottomColor: themeColors.border }]}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
        <Text style={[styles.chevron, { color: themeColors.textMuted }]}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
  },
  chevron: {
    fontSize: 18,
    color: colors.textMuted,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
