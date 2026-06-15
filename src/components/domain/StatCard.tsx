/**
 * StatCard — карточка показателя (порт `.statcard`): крупное число (display) +
 * подпись + опц. дельта up/down. Для будущих экранов статистики/профиля.
 */
import { ArrowDown, ArrowUp } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme, type Theme } from '@/theme';

export type StatDelta = { dir: 'up' | 'down'; value: string };

export type StatCardProps = {
  value: string | number;
  label: string;
  delta?: StatDelta;
};

export function StatCard({ value, label, delta }: StatCardProps) {
  const theme = useTheme();
  const styles = useStyles(theme);

  const deltaColor = delta?.dir === 'up' ? theme.colors.success : theme.colors.danger;
  const DeltaIcon = delta?.dir === 'up' ? ArrowUp : ArrowDown;

  return (
    <View style={styles.card}>
      <Text style={styles.num} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.lab} numberOfLines={1}>
        {label}
      </Text>
      {delta && (
        <View style={styles.delta}>
          <DeltaIcon size={13} color={deltaColor} />
          <Text style={[styles.deltaText, { color: deltaColor }]}>{delta.value}</Text>
        </View>
      )}
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
      padding: theme.spacing[4],
    },
    num: {
      ...theme.typography.h1,
      color: theme.colors.text,
    },
    lab: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: 2 },
    delta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: theme.spacing[1] },
    deltaText: {
      ...theme.typography.caption,
      fontFamily: theme.typography.h2.fontFamily,
    },
  });
