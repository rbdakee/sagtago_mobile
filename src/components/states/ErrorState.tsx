/**
 * ErrorState — состояние ошибки с кнопкой «Повторить». Та же раскладка, что и
 * EmptyState (`.state`), но обязательный onRetry. Тексты по умолчанию из i18n
 * `states:error.*`.
 */
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { tokens, useTheme } from '@/theme';

import { Button } from '../ui/Button';
import type { IconRenderer } from '../ui/icon';

export interface ErrorStateProps {
  onRetry: () => void;
  emoji?: string;
  icon?: IconRenderer;
  title?: string;
  text?: string;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  onRetry,
  emoji = '⚠️',
  icon,
  title,
  text,
  retryLabel,
  style,
}: ErrorStateProps) {
  const theme = useTheme();
  const { t } = useTranslation('states');

  return (
    <View style={[styles.state, style]}>
      <View style={[styles.plaque, { backgroundColor: theme.colors.surface2 }]}>
        {icon ? icon({ size: 38, color: theme.colors.danger }) : <Text style={styles.emoji}>{emoji}</Text>}
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title ?? t('error.title')}</Text>
      <Text style={[styles.text, { color: theme.colors.textMuted }]}>{text ?? t('error.text')}</Text>
      <Button
        label={retryLabel ?? t('error.retry')}
        onPress={onRetry}
        size="M"
        variant="secondary"
        style={styles.cta}
      />
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
