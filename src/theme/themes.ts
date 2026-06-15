/**
 * Семантические токены тем — graphite (светлая, дефолт) + graphite-dark.
 * Порт разделов 2 и 2-dark из tokens.css. Семантические статус-цвета берём
 * из примитивов (semantic) — они одинаковы в обеих темах.
 *
 * Каждый компонент ОБЯЗАН корректно выглядеть в обеих темах (CLAUDE.md §2).
 * Доступ только через useTheme(); хардкод HEX/размеров в компонентах запрещён.
 */
import type { ViewStyle } from 'react-native';

import { layout, radii, screenPad, semantic, spacing } from './tokens';
import { typography } from './typography';

export type ThemeName = 'graphite' | 'graphite-dark';

export type ThemeColors = {
  // Бренд
  brandPrimary: string;
  brandPrimaryPress: string;
  brandAccent: string;
  brandAccentPress: string;
  brandAccentInk: string;
  brandSecondary: string;
  // Поверхности
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  // Текст
  text: string;
  textMuted: string;
  textFaint: string;
  textInverse: string;
  // Границы
  border: string;
  borderStrong: string;
  // Мягкие подложки
  accentSoft: string;
  primarySoft: string;
  // Семантика (одинаковая в обеих темах)
  success: string;
  warning: string;
  danger: string;
  info: string;
  successBg: string;
  warningBg: string;
  dangerBg: string;
  infoBg: string;
};

/** Тень: iOS-поля + android elevation. Применять как spread в style. */
export type Shadow = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export type ThemeShadows = {
  card: Shadow;
  raise: Shadow;
  glass: Shadow;
  btn: Shadow;
};

/**
 * Liquid Glass токены. Используются ТОЛЬКО в glass-примитивах
 * (navbar, tabbar, bottom-sheet, modal, FAB). intensity — для expo-blur BlurView.
 */
export type ThemeGlass = {
  intensity: number;
  tint: 'light' | 'dark';
  /** Полупрозрачная заливка поверх блюра. */
  overlay: string;
  overlayStrong: string;
  border: string;
  /** Верхний «liquid» блик. */
  highlight: string;
};

export type Theme = {
  name: ThemeName;
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  screenPad: number;
  radii: typeof radii;
  layout: typeof layout;
  shadows: ThemeShadows;
  glass: ThemeGlass;
  typography: typeof typography;
};

const graphite: Theme = {
  name: 'graphite',
  isDark: false,
  colors: {
    brandPrimary: '#28262C',
    brandPrimaryPress: '#1A181E',
    brandAccent: '#349357',
    brandAccentPress: '#2C8049',
    brandAccentInk: '#FFFFFF',
    brandSecondary: '#4A4751',
    bg: '#F9F8F9',
    surface: '#FFFFFF',
    surface2: '#F0EFF1',
    surface3: '#E7E5E9',
    text: '#1C1A20',
    textMuted: '#615E68',
    textFaint: '#94909B',
    textInverse: '#FFFFFF',
    border: '#E4E2E7',
    borderStrong: '#D2CFD6',
    accentSoft: 'rgba(52, 147, 87, 0.14)',
    primarySoft: 'rgba(40, 38, 44, 0.08)',
    ...semantic,
  },
  spacing,
  screenPad,
  radii,
  layout,
  shadows: {
    card: { shadowColor: '#10231A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    raise: { shadowColor: '#10231A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 },
    glass: { shadowColor: '#10231A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 32, elevation: 12 },
    btn: { shadowColor: '#10231A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 4 },
  },
  glass: {
    intensity: 42,
    tint: 'light',
    overlay: 'rgba(255, 255, 255, 0.66)',
    overlayStrong: 'rgba(255, 255, 255, 0.78)',
    border: 'rgba(255, 255, 255, 0.55)',
    highlight: 'rgba(255, 255, 255, 0.85)',
  },
  typography,
};

const graphiteDark: Theme = {
  name: 'graphite-dark',
  isDark: true,
  colors: {
    brandPrimary: '#349357',
    brandPrimaryPress: '#2C8049',
    brandAccent: '#3DA767',
    brandAccentPress: '#339457',
    brandAccentInk: '#08130C',
    brandSecondary: '#2E6A4E',
    bg: '#0F0E12',
    surface: '#1A181E',
    surface2: '#242128',
    surface3: '#2E2B33',
    text: '#F2F1F4',
    textMuted: '#A6A2AD',
    textFaint: '#6E6A76',
    textInverse: '#FFFFFF',
    border: '#2C2A31',
    borderStrong: '#3A3742',
    accentSoft: 'rgba(61, 167, 103, 0.18)',
    primarySoft: 'rgba(61, 167, 103, 0.16)',
    ...semantic,
  },
  spacing,
  screenPad,
  radii,
  layout,
  shadows: {
    card: { shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.45, shadowRadius: 8, elevation: 2 },
    raise: { shadowColor: '#000000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.55, shadowRadius: 30, elevation: 10 },
    glass: { shadowColor: '#000000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.6, shadowRadius: 36, elevation: 12 },
    btn: { shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 6 },
  },
  glass: {
    // Тёмное стекло: tint задаём явно, не наследуем белый (ARCHITECTURE §4).
    intensity: 32,
    tint: 'dark',
    overlay: 'rgba(26, 24, 30, 0.55)',
    overlayStrong: 'rgba(26, 24, 30, 0.7)',
    border: 'rgba(255, 255, 255, 0.08)',
    highlight: 'rgba(255, 255, 255, 0.1)',
  },
  typography,
};

export const themes: Record<ThemeName, Theme> = {
  graphite,
  'graphite-dark': graphiteDark,
};
