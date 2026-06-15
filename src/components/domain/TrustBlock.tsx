/**
 * TrustBlock — плашка доверия (порт `.trust`): иконка-щит на success + текст
 * «гарантия свежести / возврат по жалобе» (R4). Текст — через проп (i18n на
 * стороне экрана), чтобы не хардкодить строки в компоненте.
 */
import { ShieldCheck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme, type Theme } from '@/theme';

export type TrustBlockProps = {
  text: string;
  /** Жирный акцент-заголовок перед текстом (опц.). */
  title?: string;
};

export function TrustBlock({ text, title }: TrustBlockProps) {
  const theme = useTheme();
  const styles = useStyles(theme);

  // successBg — фиксированный светлый тинт (одинаков в обеих темах), на нём
  // светлый `text` в тёмной теме нечитаем. В тёмной берём theme-aware accentSoft.
  // (См. отчёт: фундаменту нужны тёмные варианты semantic-тинтов.)
  const bg = theme.isDark ? theme.colors.accentSoft : theme.colors.successBg;

  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <View style={styles.ic}>
        <ShieldCheck size={18} color={theme.colors.textInverse} />
      </View>
      <Text style={styles.tx}>
        {title ? <Text style={styles.txBold}>{title} </Text> : null}
        {text}
      </Text>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
      borderRadius: theme.radii.card,
    },
    ic: {
      width: 32,
      height: 32,
      borderRadius: 9,
      backgroundColor: theme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tx: { ...theme.typography.caption, color: theme.colors.text, flexShrink: 1 },
    txBold: {
      ...theme.typography.caption,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.success,
    },
  });
