import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Returns a set of dynamic style overrides keyed by common element role.
 * Spread these over the corresponding static StyleSheet styles to get
 * correct dark-mode colours without rewriting every StyleSheet.
 *
 * Usage:
 *   const ds = useDynamicStyles();
 *   <SafeAreaView style={[styles.container, ds.container]}>
 *   <View style={[styles.header, ds.header]}>
 *   <Text style={[styles.headerTitle, ds.text]}>
 *   <Text style={[styles.subtitle, ds.textSecondary]}>
 *   <Text style={[styles.date, ds.textMuted]}>
 *   <View style={[styles.card, ds.card]}>
 *   <TextInput style={[styles.input, ds.input]}>
 */
export function useDynamicStyles() {
  const { colors: themeColors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        // ─── Containers ─────────────────────────────────
        container: {
          backgroundColor: themeColors.background,
        } as ViewStyle,
        header: {
          borderBottomColor: themeColors.border,
          backgroundColor: themeColors.background,
        } as ViewStyle,
        footer: {
          borderTopColor: themeColors.border,
          backgroundColor: themeColors.background,
        } as ViewStyle,

        // ─── Cards & surfaces ───────────────────────────
        card: {
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.border,
        } as ViewStyle,
        cardWhite: {
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.border,
        } as ViewStyle,
        modal: {
          backgroundColor: themeColors.background,
        } as ViewStyle,
        modalSheet: {
          backgroundColor: themeColors.cardBackground,
        } as ViewStyle,

        // ─── Text ───────────────────────────────────────
        text: {
          color: themeColors.text,
        } as TextStyle,
        textSecondary: {
          color: themeColors.textSecondary,
        } as TextStyle,
        textMuted: {
          color: themeColors.textMuted,
        } as TextStyle,

        // ─── Borders ────────────────────────────────────
        border: {
          borderColor: themeColors.border,
        } as ViewStyle,
        borderBottom: {
          borderBottomColor: themeColors.border,
        } as ViewStyle,

        // ─── Form inputs ────────────────────────────────
        input: {
          color: themeColors.text,
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.border,
        } as TextStyle,

        // ─── Rows ───────────────────────────────────────
        row: {
          borderBottomColor: themeColors.border,
        } as ViewStyle,
      }),
    [themeColors],
  );
}

export { useTheme };
