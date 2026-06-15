/**
 * Мелкие доменные хелперы, общие для нескольких карточек. Не компонент-примитив
 * и не barrel — просто переиспользуемые куски внутри `domain/`.
 */
import { Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

/** «Тёплый хлеб» → «ТХ». Для лого-плейсхолдера заведения. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

/**
 * Компактный рейтинг (звезда + число), порт `.rating` из components.css.
 * Отдельно от полного 5-звёздочного ряда W1-A (RatingStars) — это мета-микроэлемент.
 */
export function RatingInline({
  rating,
  count,
  countText,
  color,
}: {
  rating: number;
  count?: number;
  /** Готовый текст количества (напр. «312 оценок»). Заменяет «(count)». */
  countText?: string;
  /** Цвет числа (по умолчанию text). На фото можно передать inverse. */
  color?: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Star size={13} color={theme.colors.warning} fill={theme.colors.warning} />
      <Text
        style={[
          theme.typography.caption,
          { color: color ?? theme.colors.text, fontFamily: theme.typography.h2.fontFamily },
        ]}
      >
        {rating.toFixed(1)}
        {countText != null ? ` · ${countText}` : count != null ? ` (${count})` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
