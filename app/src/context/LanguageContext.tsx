import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Platform, NativeModules } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import translations, { Language, TranslationKey } from '../i18n';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LANGUAGE_KEY = 'connectme_language_preference';

function getDeviceLanguage(): Language {
  let locale: string | undefined;

  if (Platform.OS === 'ios') {
    locale =
      NativeModules.SettingsManager?.settings?.AppleLocale ??
      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0];
  } else {
    locale = NativeModules.I18nManager?.localeIdentifier;
  }

  if (locale && locale.toLowerCase().startsWith('es')) {
    return 'es';
  }

  return 'en';
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getDeviceLanguage());
  const [loaded, setLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(LANGUAGE_KEY);
        if (stored === 'en' || stored === 'es') {
          setLanguageState(stored);
        }
      } catch {
        // Ignore storage errors, fall back to device language
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    SecureStore.setItemAsync(LANGUAGE_KEY, lang).catch(() => {});
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key];
    },
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  // Don't render until we've checked stored preference to avoid language flash
  if (!loaded) return null;

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
