/**
 * OrderRow — строка заказа (порт `.orderrow`): время окна · название/код ·
 * подзаголовок · бейдж статуса. Используется в списках «Заказы» (C-13).
 *
 * Зависимость W1-A: бейдж статуса — это `@/components/ui/Badge`. Пока трека нет,
 * рисуем локальный `StatusBadge` (порт `.badge-*`); swap в одну строку.
 */
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ORDER_STATUS_VARIANT, type BadgeVariant, type Order } from '@/domain';
import { useTheme, type Theme } from '@/theme';

export type OrderRowProps = {
  order: Order;
  onPress?: (order: Order) => void;
};

export function OrderRow({ order, onPress }: OrderRowProps) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation('common');

  return (
    <Pressable
      onPress={() => onPress?.(order)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <Text style={styles.time}>{order.pickupWindow.from}</Text>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {order.box.title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {order.merchant.name} · №{order.pickupCode}
        </Text>
      </View>
      <StatusBadge
        variant={ORDER_STATUS_VARIANT[order.status]}
        label={t(`status.order.${order.status}`)}
      />
    </Pressable>
  );
}

/**
 * Локальный бейдж статуса (порт `.badge`). Временный — заменить на
 * `import { Badge } from '@/components/ui/Badge'` (W1-A) при интеграции.
 */
export function StatusBadge({ variant, label }: { variant: BadgeVariant; label: string }) {
  const theme = useTheme();
  const palette: Record<BadgeVariant, { bg: string; fg: string }> = {
    success: { bg: theme.colors.successBg, fg: theme.colors.success },
    warning: { bg: theme.colors.warningBg, fg: theme.colors.warning },
    danger: { bg: theme.colors.dangerBg, fg: theme.colors.danger },
    info: { bg: theme.colors.infoBg, fg: theme.colors.info },
    muted: { bg: theme.colors.surface2, fg: theme.colors.textMuted },
  };
  const c = palette[variant];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 24,
        paddingHorizontal: theme.spacing[2],
        borderRadius: theme.radii.pill,
        backgroundColor: c.bg,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.fg }} />
      <Text
        style={[
          theme.typography.caption,
          { color: c.fg, fontFamily: theme.typography.h2.fontFamily },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
      backgroundColor: theme.colors.surface,
    },
    pressed: { backgroundColor: theme.colors.surface2 },
    time: {
      ...theme.typography.body,
      fontFamily: theme.typography.h1.fontFamily,
      fontVariant: ['tabular-nums'],
      color: theme.colors.text,
      width: 58,
    },
    info: { flex: 1, minWidth: 0 },
    name: {
      ...theme.typography.body,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.text,
    },
    sub: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: 1 },
  });
