/**
 * QRCard — QR выдачи из `order.qrPayload` + код снизу (порт `.qr`/`.codecard`).
 * QR рисуем тёмными модулями на белой подложке (`textInverse` — #FFF в обеих
 * темах) для надёжного сканирования независимо от темы интерфейса.
 */
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import type { Order } from '@/domain';
import { useTheme, type Theme } from '@/theme';

export type QRCardProps = {
  order: Order;
  /** Размер QR в пикселях (по умолчанию 180). */
  size?: number;
};

export function QRCard({ order, size = 180 }: QRCardProps) {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.card}>
      <View style={styles.plate}>
        <QRCode
          value={order.qrPayload}
          size={size}
          color={theme.colors.brandPrimary}
          backgroundColor={theme.colors.textInverse}
          ecl="M"
          quietZone={8}
        />
      </View>
      <Text style={[theme.typography.code, styles.code]}>{order.pickupCode}</Text>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
      padding: theme.spacing[6],
      alignItems: 'center',
      gap: theme.spacing[4],
      ...theme.shadows.card,
    },
    plate: {
      padding: theme.spacing[3],
      borderRadius: theme.radii.input,
      backgroundColor: theme.colors.textInverse,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    code: { color: theme.colors.text, textAlign: 'center' },
  });
