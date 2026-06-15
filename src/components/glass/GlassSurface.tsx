/**
 * Liquid Glass — низкоуровневые слои стекла, общие для navbar/tabbar/sheet/fab.
 *
 * Две реализации за одним API:
 *  • iOS 26+ — настоящий нативный Liquid Glass (`expo-glass-effect` → `GlassView`,
 *    UIGlassEffect): один слой, материал сам даёт размытие, краевой блик и адаптацию.
 *  • Android / iOS<26 / web — фолбэк: порт `.glass` из components.css на expo-blur
 *    (блюр + полупрозрачная заливка `theme.glass.overlay` + верхний 1px-блик).
 *
 * Glass используем ТОЛЬКО в этих компонентах (AGENTS.md §1.8). Везде — токены.
 */
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

/**
 * Доступен ли нативный Liquid Glass (iOS 26+). На прочих платформах `GlassView`
 * деградирует до обычного View, поэтому там рисуем expo-blur-фолбэк. Значение
 * стабильно в рамках запуска — вычисляем один раз. try/catch — на случай, когда
 * нативный модуль не слинкован (Expo Go без модуля, jest).
 */
let supportsLiquidGlass = false;
try {
  supportsLiquidGlass = isLiquidGlassAvailable();
} catch {
  supportsLiquidGlass = false;
}
export const SUPPORTS_LIQUID_GLASS = supportsLiquidGlass;

/**
 * Абсолютно-позиционированные слои стекла (блюр + заливка + блик).
 * Кладётся ПЕРВЫМ ребёнком в контейнер с `overflow:'hidden'` и нужным радиусом;
 * контент рисуется поверх. Не задаёт размеров/тени/границы — это делает родитель.
 */
export function GlassLayers({
  strong = false,
  highlight = true,
  radius,
}: {
  /** Более плотная заливка (overlayStrong) — для модалок/листов. */
  strong?: boolean;
  /** Верхний «liquid» блик. */
  highlight?: boolean;
  /**
   * Радиус скругления для нативного стекла, чтобы материал скруглялся по форме
   * родителя. В фолбэке скругление даёт сам клип-родитель (`overflow:'hidden'`).
   */
  radius?: number;
}) {
  const theme = useTheme();

  // iOS 26+: настоящий нативный Liquid Glass. Один слой — материал сам даёт
  // размытие, краевой блик и адаптацию к контенту, поэтому ручные overlay/highlight
  // не нужны. colorScheme берём из темы приложения (у нас свой тумблер тем).
  if (SUPPORTS_LIQUID_GLASS) {
    return (
      <GlassView
        style={[StyleSheet.absoluteFill, radius != null ? { borderRadius: radius } : null]}
        glassEffectStyle="regular"
        colorScheme={theme.isDark ? 'dark' : 'light'}
      />
    );
  }

  // Фолбэк (Android / iOS<26 / web): expo-blur + полупрозрачная заливка + блик.
  return (
    <>
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={theme.glass.intensity}
        tint={theme.glass.tint}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: strong ? theme.glass.overlayStrong : theme.glass.overlay },
        ]}
      />
      {highlight && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: StyleSheet.hairlineWidth,
            backgroundColor: theme.glass.highlight,
          }}
        />
      )}
    </>
  );
}

export type GlassSurfaceProps = {
  children?: ReactNode;
  /** Радиус скругления (по умолчанию `theme.radii.sheet`). */
  radius?: number;
  strong?: boolean;
  highlight?: boolean;
  /** Тень стекла (по умолчанию включена). */
  shadow?: boolean;
  /** Граница стекла (по умолчанию включена). */
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Готовая «стеклянная» поверхность: тень + радиус + граница + слои стекла.
 * Размер берёт от контента/`style`. Тень вынесена на внешний слой (без
 * overflow), блюр — на внутренний (с overflow:hidden), чтобы тень не обрезалась.
 */
export function GlassSurface({
  children,
  radius,
  strong = false,
  highlight = true,
  shadow = true,
  bordered = true,
  style,
}: GlassSurfaceProps) {
  const theme = useTheme();
  const r = radius ?? theme.radii.sheet;

  return (
    <View style={[{ borderRadius: r }, shadow && theme.shadows.glass, style]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: r,
            overflow: 'hidden',
            borderWidth: bordered ? 1 : 0,
            borderColor: theme.glass.border,
          },
        ]}
      >
        <GlassLayers strong={strong} highlight={highlight} radius={r} />
      </View>
      {children}
    </View>
  );
}
