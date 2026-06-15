/**
 * EmptyState — пустое состояние экрана. Порт `.state` / `.emoji` / `.st-ttl` /
 * `.st-txt` из components.css. Эмодзи (или иконка) в плашке + заголовок + текст
 * + опц. CTA-кнопка. Тексты по умолчанию из i18n `states:empty.*`.
 */
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { tokens, useTheme } from '@/theme';

import { Button } from '../ui/Button';
import type { IconRenderer } from '../ui/icon';

export interface EmptyStateProps {
  /** Эмодзи в плашке (если не задана icon). */
  emoji?: string;
  /** Иконка вместо эмодзи (цвет brandPrimary). */
  icon?: IconRenderer;
  title?: string;
  text?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  emoji = '📭',
  icon,
  title,
  text,
  ctaLabel,
  onCtaPress,
  style,
}: EmptyStateProps) {
  const theme = useTheme();
  const { t } = useTranslation('states');

  return (
    <View style={[styles.state, style]}>
      <View style={[styles.plaque, { backgroundColor: theme.colors.surface2 }]}>
        {icon ? icon({ size: 38, color: theme.colors.brandPrimary }) : <Text style={styles.emoji}>{emoji}</Text>}
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title ?? t('empty.title')}</Text>
      <Text style={[styles.text, { color: theme.colors.textMuted }]}>{text ?? t('empty.text')}</Text>
      {ctaLabel && onCtaPress ? (
        <Button label={ctaLabel} onPress={onCtaPress} size="M" variant="primary" style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  state: { alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 40, paddingHorizontal: 24 },
  plaque: { width: 84, height: 84, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emoji: { fontSize: 38, lineHeight: 46 },
  title: { fontFamily: tokens.fonts.uiSemiBold, fontSize: 18, textAlign: 'center' },
  text: { fontFamily: tokens.fonts.uiRegular, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 260 },
  cta: { marginTop: 16 },
});
