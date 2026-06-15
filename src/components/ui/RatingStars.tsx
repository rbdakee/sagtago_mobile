/**
 * RatingStars — звёзды рейтинга. Порт `.stars` / `.input-stars` / `.rating`.
 * Режимы: показ (filled до value), ввод (editable, тап 1..max) и компактный
 * (одна звезда + число, как `.rating`). Цвет активных — warning.
 */
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';

import { tokens, useTheme } from '@/theme';

export interface RatingStarsProps {
  value: number;
  max?: number;
  editable?: boolean;
  onChange?: (v: number) => void;
  /** Размер звезды, px. По умолчанию 16 (показ) / 32 (ввод). */
  size?: number;
  /** Компактный вид: одна звезда + числовое значение. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function RatingStars({
  value,
  max = 5,
  editable = false,
  onChange,
  size,
  compact = false,
  style,
}: RatingStarsProps) {
  const theme = useTheme();
  const on = theme.colors.warning;
  const off = theme.colors.borderStrong;

  if (compact) {
    return (
      <View style={[styles.compact, style]}>
        <Star size={14} color={on} fill={on} strokeWidth={0} />
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {value.toFixed(1).replace('.', ',')}
        </Text>
      </View>
    );
  }

  const starSize = size ?? (editable ? 32 : 16);
  const stars = Array.from({ length: max });

  return (
    <View style={[editable ? styles.inputRow : styles.row, style]}>
      {stars.map((_, i) => {
        const filled = i < Math.round(value);
        const star = (
          <Star
            size={starSize}
            color={filled ? on : off}
            fill={filled ? on : 'transparent'}
            strokeWidth={filled ? 0 : 1.75}
          />
        );
        if (!editable) return <View key={i}>{star}</View>;
        return (
          <Pressable
            key={i}
            onPress={() => onChange?.(i + 1)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={String(i + 1)}
          >
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
  inputRow: { flexDirection: 'row', gap: 8 },
  compact: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  value: { fontFamily: tokens.fonts.uiSemiBold, fontSize: 13 },
});
