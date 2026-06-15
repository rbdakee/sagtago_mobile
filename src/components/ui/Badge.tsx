/**
 * Badge — бейдж статуса. Порт `.badge` / `.badge-*` из components.css.
 * Принимает семантический BadgeVariant (@/domain) и подпись; опц. точка-индикатор.
 * Цвета берутся из пар *Bg / * темы (одинаковы в обеих темах — узнаваемость).
 */
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { BadgeVariant } from '@/domain';
import { tokens, useTheme, type Theme } from '@/theme';

export interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  /** Точка-индикатор слева (currentColor). По умолчанию показывается. */
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** variant → { фон, текст }. */
function badgeColors(theme: Theme, variant: BadgeVariant) {
  const c = theme.colors;
  switch (variant) {
    case 'success':
      return { bg: c.successBg, fg: c.success };
    case 'warning':
      return { bg: c.warningBg, fg: c.warning };
    case 'danger':
      return { bg: c.dangerBg, fg: c.danger };
    case 'info':
      return { bg: c.infoBg, fg: c.info };
    case 'muted':
      return { bg: c.surface2, fg: c.textMuted };
  }
}

export function Badge({ variant, label, dot = true, style }: BadgeProps) {
  const theme = useTheme();
  const { bg, fg } = badgeColors(theme, variant);
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderRadius: theme.radii.pill }, style]}>
      {dot ? <View style={[styles.dot, { backgroundColor: fg }]} /> : null}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    height: 24,
    paddingHorizontal: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontFamily: tokens.fonts.uiSemiBold, fontSize: 12, lineHeight: 12 },
});
