import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { lightColors, darkColors } from '../theme';

type ThemeColors = typeof lightColors;

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const THEME_KEY = 'connectme_theme_preference';

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [loaded, setLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(THEME_KEY);
        if (stored !== null) {
          setIsDark(stored === 'dark');
        }
        // If no stored preference, keep system default
      } catch {
        // Ignore storage errors, fall back to system preference
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      SecureStore.setItemAsync(THEME_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      isDark,
      toggleTheme,
      colors: isDark ? (darkColors as ThemeColors) : lightColors,
    }),
    [isDark],
  );

  // Don't render until we've checked stored preference to avoid theme flash
  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
