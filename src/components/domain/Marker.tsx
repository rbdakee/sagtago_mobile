/**
 * Marker — пин-пилюля для будущей карты (порт `.marker`): иконка-бейдж + цена.
 * Вариант `cluster` — круглый бейдж с количеством. Сейчас используется только в
 * демо; карта подключается позже (W3).
 */
import { Package } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/lib';
import { useTheme, type Theme } from '@/theme';

export type MarkerProps =
  | { variant?: 'pin'; price: number; count?: number }
  | { variant: 'cluster'; count: number; price?: number };

export function Marker(props: MarkerProps) {
  const theme = useTheme();
  const styles = useStyles(theme);

  if (props.variant === 'cluster') {
    return (
      <View style={[styles.cluster, theme.shadows.card]}>
        <Text style={styles.clusterText}>{props.count}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.pin, theme.shadows.card]}>
      <View style={styles.ico}>
        {props.count != null ? (
          <Text style={styles.icoText}>{props.count}</Text>
        ) : (
          <Package size={13} color={theme.colors.textInverse} />
        )}
      </View>
      <Text style={styles.price}>{formatMoney(props.price)}</Text>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    pin: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 36,
      paddingLeft: theme.spacing[1],
      paddingRight: theme.spacing[3],
      borderRadius: theme.radii.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    ico: {
      width: 22,
      height: 22,
      borderRadius: 7,
      backgroundColor: theme.colors.brandPrimary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icoText: {
      ...theme.typography.caption,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.textInverse,
    },
    price: {
      ...theme.typography.caption,
      fontFamily: theme.typography.h1.fontFamily,
      color: theme.colors.text,
    },
    cluster: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: theme.colors.brandPrimary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clusterText: {
      ...theme.typography.body,
      fontFamily: theme.typography.h1.fontFamily,
      color: theme.colors.textInverse,
    },
  });
