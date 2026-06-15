/**
 * SaqtaGo — Primitive design tokens.
 * Прямой порт docs/mobile_design/sg/project/tokens.css (раздел 1 — общая шкала).
 * Это ЕДИНСТВЕННЫЙ источник правды для значений. Семантические токены тем
 * (themes.ts) ссылаются на эти примитивы. Компоненты НЕ импортируют tokens.ts
 * напрямую — только через useTheme().
 */

/** Нейтральная шкала (прохладная, лёгкий зелёный подтон) — общая для всех тем. */
export const neutral = {
  0: '#FFFFFF',
  50: '#F7F9F7',
  100: '#F1F4F0',
  200: '#E2E8E2',
  300: '#CDD6CD',
  400: '#A7B2A8',
  500: '#7E8A80',
  600: '#5B6B61',
  700: '#41514A',
  800: '#2A352F',
  900: '#18211C',
  950: '#0E1714',
} as const;

/**
 * Семантические статус-цвета — ОДИНАКОВЫ во всех темах (узнаваемость бейджей,
 * DESIGN.md §4.1). Не переопределять в graphite/graphite-dark.
 */
export const semantic = {
  success: '#1F9D55',
  warning: '#E0A100',
  danger: '#D23B3B',
  info: '#2D6BB5',
  successBg: '#E7F5EC',
  warningBg: '#FBF1D8',
  dangerBg: '#FAE7E7',
  infoBg: '#E5EEF8',
} as const;

/** Spacing — база 8pt. Ключи = `--space-N` из tokens.css. */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

/** Поля экрана (мобайл, по бокам). */
export const screenPad = 16;

/** Радиусы скругления. */
export const radii = {
  card: 16,
  btn: 999,
  input: 12,
  sheet: 24,
  pill: 999,
  sm: 8,
} as const;

/** Layout-константы (высоты системных панелей). */
export const layout = {
  tabbarH: 84,
  navbarH: 52,
} as const;

/**
 * Семейства шрифтов = имена, под которыми они грузятся через @expo-google-fonts
 * (см. app/_layout.tsx). Веса закодированы в имени файла, поэтому fontWeight
 * в стилях обычно НЕ задаём — выбираем нужное семейство.
 */
export const fonts = {
  // Дисплей/заголовки — Unbounded
  displayRegular: 'Unbounded_400Regular',
  displayMedium: 'Unbounded_500Medium',
  displaySemiBold: 'Unbounded_600SemiBold',
  displayBold: 'Unbounded_700Bold',
  // Текст/UI — Onest
  uiRegular: 'Onest_400Regular',
  uiMedium: 'Onest_500Medium',
  uiSemiBold: 'Onest_600SemiBold',
  uiBold: 'Onest_700Bold',
} as const;

export type Spacing = typeof spacing;
export type Radii = typeof radii;
