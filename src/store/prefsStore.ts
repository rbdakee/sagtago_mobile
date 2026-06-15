/**
 * Пользовательские предпочтения: тема и язык. Персистятся в AsyncStorage.
 * - themeMode: system | light | dark (при system берём системную схему).
 * - language: ru (дефолт/фолбэк) | kk.
 * ThemeProvider и i18n читают этот стор.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Language = 'ru' | 'kk';

type PrefsState = {
  themeMode: ThemeMode;
  language: Language;
  /** true, когда персист подтянулся из storage (чтобы не мигать дефолтом). */
  hasHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setHasHydrated: (value: boolean) => void;
};

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      language: 'ru',
      hasHydrated: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'saqtago-prefs',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themeMode: state.themeMode, language: state.language }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
