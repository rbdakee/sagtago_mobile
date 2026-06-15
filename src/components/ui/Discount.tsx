/**
 * Discount — тег скидки `-70%`. Порт `.discount` / `.discount-lg` из components.css.
 * Заливка на акценте (brandAccent), текст brandAccentInk, дисплей-шрифт.
 */
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { tokens, useTheme } from '@/theme';

export interface DiscountProps {
  /** Процент скидки (0..100). Рисуется как `-NN%`. */
  value: number;
  size?: 'm' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export function Discount({ value, size = 'm', style }: DiscountProps) {
  const theme = useTheme();
  const lg = size === 'lg';
  return (
    <Text
      style={[
        styles.tag,
        lg ? styles.lg : styles.md,
        {
          backgroundColor: theme.colors.brandAccent,
          color: theme.colors.brandAccentInk,
          borderRadius: theme.radii.sm,
        },
        style,
      ]}
    >
      {`-${Math.round(value)}%`}
    </Text>
  );
}

const styles = StyleSheet.create({
  tag: {
    fontFamily: tokens.fonts.displayBold,
    letterSpacing: -0.14,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  md: { fontSize: 14, paddingHorizontal: 9, paddingVertical: 4 },
  lg: { fontSize: 20, paddingHorizontal: 12, paddingVertical: 6 },
});
