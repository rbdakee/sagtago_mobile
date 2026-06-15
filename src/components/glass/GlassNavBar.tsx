/**
 * GlassNavBar — верхняя стеклянная панель экрана. Блюр + заливка + блик +
 * safe-area top. Слоты: left (напр. «назад»), title (по центру), right.
 * Заголовки expo-router скрыты глобально — свою шапку рисуем этим компонентом.
 */
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, type Theme } from '@/theme';

import { GlassLayers } from './GlassSurface';

export type GlassNavBarProps = {
  title?: string;
  /** Произвольный левый слот. Если не задан, но есть `onBack` — рисуем «назад». */
  left?: ReactNode;
  right?: ReactNode;
  /** Удобный обработчик «назад» (рендерит ChevronLeft в левом слоте). */
  onBack?: () => void;
  /** Более плотная заливка стекла. */
  strong?: boolean;
};

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export function GlassNavBar({ title, left, right, onBack, strong }: GlassNavBarProps) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const insets = useSafeAreaInsets();

  const leftNode =
    left ??
    (onBack ? (
      <Pressable onPress={onBack} hitSlop={HIT} style={styles.iconBtn} accessibilityRole="button">
        <ChevronLeft size={24} color={theme.colors.text} />
      </Pressable>
    ) : null);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={StyleSheet.absoluteFill}>
        <GlassLayers strong={strong} />
      </View>
      <View style={styles.divider} />
      <View style={[styles.row, { height: theme.layout.navbarH }]}>
        <View style={styles.side}>{leftNode}</View>
        <View style={styles.titleWrap} pointerEvents="none">
          {title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
        </View>
        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </View>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: { overflow: 'hidden' },
    divider: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.glass.border,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[2],
    },
    side: { minWidth: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
    sideRight: { alignItems: 'flex-end' },
    iconBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: {
      ...theme.typography.bodyL,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.text,
    },
  });
