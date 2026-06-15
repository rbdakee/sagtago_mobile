/**
 * ThemeProvider — резолвит активную тему из prefsStore.themeMode + системной
 * схемы и раздаёт её через контекст. Точка входа темизации.
 *
 * Хуки для компонентов:
 *  - useTheme()           → активный Theme (colors/spacing/radii/shadows/glass/typography)
 *  - useThemedStyles(fn)  → мемоизированный StyleSheet из темы (фабрику объявляй на уровне модуля)
 *  - useThemeController() → { mode, setMode, isDark, name } для переключателя в Профиле
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { usePrefsStore } from '@/store/prefsStore';

import { themes, type Theme, type ThemeName } from './themes';

const ThemeContext = createContext<Theme>(themes.graphite);

function resolveThemeName(mode: string, system: string | null | undefined): ThemeName {
  if (mode === 'light') return 'graphite';
  if (mode === 'dark') return 'graphite-dark';
  // system
  return system === 'dark' ? 'graphite-dark' : 'graphite';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = usePrefsStore((s) => s.themeMode);
  const system = useColorScheme();

  const theme = useMemo<Theme>(() => themes[resolveThemeName(mode, system)], [mode, system]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/**
 * Мемоизирует StyleSheet от темы. Фабрику стилей объявляй НА УРОВНЕ МОДУЛЯ
 * (стабильная ссылка), иначе мемоизация не сработает:
 *
 *   const makeStyles = (t: Theme) => StyleSheet.create({ box: { backgroundColor: t.colors.surface } });
 *   const styles = useThemedStyles(makeStyles);
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme) => T,
): T {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}

export function useThemeController() {
  const mode = usePrefsStore((s) => s.themeMode);
  const setMode = usePrefsStore((s) => s.setThemeMode);
  const theme = useTheme();
  return { mode, setMode, isDark: theme.isDark, name: theme.name };
}
