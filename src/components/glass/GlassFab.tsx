/**
 * GlassFab — плавающая круглая кнопка. Вариант `accent` (акцентная заливка) или
 * `glass` (стекло). Тень `glass`. Иконка — обязательный слот. Тач-таргет ≥ 44.
 * Позиционирование задаёт родитель через `style` (FAB обычно absolute).
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type Theme } from '@/theme';

import { GlassLayers } from './GlassSurface';

export type GlassFabProps = {
  icon: ReactNode;
  onPress?: () => void;
  variant?: 'accent' | 'glass';
  /** Диаметр, по умолчанию 56. */
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function GlassFab({
  icon,
  onPress,
  variant = 'accent',
  size = 56,
  disabled,
  style,
  accessibilityLabel,
}: GlassFabProps) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const radius = size / 2;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        theme.shadows.glass,
        { width: size, height: size, borderRadius: radius },
        variant === 'accent' && styles.accent,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {variant === 'glass' && (
        <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
          <GlassLayers strong />
        </View>
      )}
      {icon}
    </Pressable>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.glass.border,
    },
    accent: {
      backgroundColor: theme.colors.brandAccent,
      borderColor: theme.colors.brandAccentPress,
    },
    pressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
    disabled: { opacity: 0.5 },
  });
