/**
 * Toast — снэкбар с иконкой и текстом. Порт `.toast` / `.toast-*` из components.css.
 * Варианты success|danger|info, авто-скрытие через duration. Анимация появления
 * (opacity + translateY) на core Animated. Позиционирует вызывающий код.
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { AlertTriangle, Check, Info } from 'lucide-react-native';

import { tokens, useTheme, type Theme } from '@/theme';

import type { IconRenderer } from './icon';

export type ToastVariant = 'success' | 'danger' | 'info';

export interface ToastProps {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
  /** мс до авто-скрытия; 0 — не скрывать автоматически. */
  duration?: number;
  onHide?: () => void;
  style?: StyleProp<ViewStyle>;
}

function toastBg(theme: Theme, variant: ToastVariant) {
  if (variant === 'success') return theme.colors.success;
  if (variant === 'danger') return theme.colors.danger;
  return theme.colors.brandPrimary;
}

const ICON: Record<ToastVariant, IconRenderer> = {
  success: (p) => <Check {...p} />,
  danger: (p) => <AlertTriangle {...p} />,
  info: (p) => <Info {...p} />,
};

export function Toast({
  visible,
  message,
  variant = 'info',
  duration = 3000,
  onHide,
  style,
}: ToastProps) {
  const theme = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (visible && duration > 0) {
      const id = setTimeout(() => onHide?.(), duration);
      return () => clearTimeout(id);
    }
  }, [visible, duration, onHide, anim]);

  const fg = theme.colors.textInverse;

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.toast,
        theme.shadows.raise,
        {
          backgroundColor: toastBg(theme, variant),
          borderRadius: theme.radii.pill,
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          ],
        },
        style,
      ]}
    >
      <View>{ICON[variant]({ size: 18, color: fg })}</View>
      <Text style={[styles.text, { color: fg }]} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  text: { fontFamily: tokens.fonts.uiSemiBold, fontSize: 14, flexShrink: 1 },
});
