/**
 * Типошкала (мобайл) — DESIGN.md §2.4 + классы .t-* из tokens.css.
 * letterSpacing в RN указывается в ПИКСЕЛЯХ (не em), поэтому em пересчитаны
 * в px относительно размера: например -0.02em * 32 = -0.64.
 * fontWeight не задаём — вес закодирован в fontFamily (см. tokens.ts → fonts).
 */
import type { TextStyle } from 'react-native';

import { fonts } from './tokens';

export const typography = {
  /** Большая цифра скидки, экран успеха. */
  display: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.64,
  },
  /** Заголовок экрана. */
  h1: {
    fontFamily: fonts.displayMedium,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.24,
  },
  /** Секции. */
  h2: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  /** Цена, важный текст. */
  bodyL: {
    fontFamily: fonts.uiMedium,
    fontSize: 17,
    lineHeight: 24,
  },
  /** Основной текст. */
  body: {
    fontFamily: fonts.uiRegular,
    fontSize: 15,
    lineHeight: 22,
  },
  /** Подписи, мета. */
  caption: {
    fontFamily: fonts.uiRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  /** Код выдачи (крупно, разрядка, tabular). Базовый размер шкалы — 28. */
  code: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 3.92,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
} satisfies Record<string, TextStyle>;

export type Typography = typeof typography;
export type TypographyVariant = keyof Typography;
