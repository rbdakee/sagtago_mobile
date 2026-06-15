/**
 * Liquid Glass — низкоуровневые слои стекла, общие для navbar/tabbar/sheet/fab.
 * Порт `.glass` / `.glass-spec` из components.css: блюр + полупрозрачная заливка
 * (`theme.glass.overlay`) + верхний 1px-блик (`theme.glass.highlight`).
 *
 * Glass используем ТОЛЬКО в этих компонентах (AGENTS.md §1.8). Везде — токены.
 */
import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

/**
 * Абсолютно-позиционированные слои стекла (блюр + заливка + блик).
 * Кладётся ПЕРВЫМ ребёнком в контейнер с `overflow:'hidden'` и нужным радиусом;
 * контент рисуется поверх. Не задаёт размеров/тени/границы — это делает родитель.
 */
export function GlassLayers({
  strong = false,
  highlight = true,
}: {
  /** Более плотная заливка (overlayStrong) — для модалок/листов. */
  strong?: boolean;
  /** Верхний «liquid» блик. */
  highlight?: boolean;
}) {
  const theme = useTheme();
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
        <GlassLayers strong={strong} highlight={highlight} />
      </View>
      {children}
    </View>
  );
}
