/**
 * Button — основная кнопка действия. Порт `.btn` / `.btn-*` из components.css.
 * Варианты primary|dark|secondary|ghost|danger, размеры L|M|S, fullWidth,
 * loading (спиннер на core Animated), disabled, опц. иконка слева.
 * Только токены (useTheme), корректно в обеих темах.
 */
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { tokens, useTheme, type Theme } from '@/theme';

import type { IconRenderer } from './icon';

export type ButtonVariant = 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'L' | 'M' | 'S';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Иконка слева от подписи. Цвет приходит из варианта. */
  icon?: IconRenderer;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

const SIZE: Record<ButtonSize, { height: number; padH: number; fontSize: number }> = {
  L: { height: 52, padH: 20, fontSize: 16 },
  M: { height: 44, padH: 20, fontSize: 15 },
  S: { height: 36, padH: 14, fontSize: 14 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Цвета варианта в покое и при нажатии (фон/текст/граница). */
function variantColors(theme: Theme, variant: ButtonVariant, pressed: boolean) {
  const c = theme.colors;
  switch (variant) {
    case 'primary':
      return { bg: pressed ? c.brandAccentPress : c.brandAccent, fg: c.brandAccentInk, border: 'transparent' };
    case 'dark':
      return { bg: pressed ? c.brandPrimaryPress : c.brandPrimary, fg: c.textInverse, border: 'transparent' };
    case 'secondary':
      return { bg: pressed ? c.surface2 : c.surface, fg: c.text, border: c.borderStrong };
    case 'ghost':
      return { bg: pressed ? c.primarySoft : 'transparent', fg: c.brandPrimary, border: 'transparent' };
    case 'danger':
      return { bg: c.danger, fg: c.textInverse, border: 'transparent' };
  }
}

function Spinner({ color, size }: { color: string; size: number }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 700,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2.5,
        borderColor: color,
        borderTopColor: 'transparent',
        transform: [{ rotate }],
      }}
    />
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'L',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  style,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);
  const dims = SIZE[size];
  const isDisabled = disabled || loading;

  const pressTo = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 50, bounciness: 0 }).start();

  // ВАЖНО: style — статический массив, НЕ функция `({pressed}) => …`.
  // На New Architecture (Fabric, SDK 56) функция-style у Animated-обёртки не
  // вычисляется → фон/высота/радиус терялись (кнопка сливалась с фоном).
  // Состояние нажатия держим сами через useState.
  const v = variantColors(theme, variant, pressed && !isDisabled);
  const fg = isDisabled ? theme.colors.textFaint : v.fg;

  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        setPressed(true);
        pressTo(0.975);
      }}
      onPressOut={() => {
        setPressed(false);
        pressTo(1);
      }}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.base,
        {
          height: dims.height,
          paddingHorizontal: dims.padH,
          borderRadius: theme.radii.btn,
          backgroundColor: isDisabled ? theme.colors.surface2 : v.bg,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderColor: isDisabled ? theme.colors.border : v.border,
          transform: [{ scale }],
        },
        variant === 'primary' && !isDisabled && theme.shadows.btn,
        fullWidth && styles.full,
        style,
      ]}
    >
      {loading ? (
        <Spinner color={fg} size={18} />
      ) : (
        <View style={styles.content}>
          {icon ? icon({ size: dims.fontSize + 2, color: fg }) : null}
          <Text
            numberOfLines={1}
            style={{
              fontFamily: tokens.fonts.uiSemiBold,
              fontSize: dims.fontSize,
              letterSpacing: dims.fontSize * -0.01,
              color: fg,
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  full: { alignSelf: 'stretch', width: '100%' },
});
