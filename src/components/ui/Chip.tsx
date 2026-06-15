/**
 * Chip — фильтр-чип. Порт `.chip` / `.chip-s` из components.css.
 * Состояние active (бренд-заливка), размеры m|s. Логику одиночный/множественный
 * выбор держит вызывающий список — Chip лишь сообщает onPress и красит active.
 */
import { StyleSheet, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { tokens, useTheme } from '@/theme';

import type { IconRenderer } from './icon';

export type ChipSize = 'm' | 's';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  size?: ChipSize;
  icon?: IconRenderer;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const SIZE: Record<ChipSize, { height: number; padH: number; fontSize: number }> = {
  m: { height: 38, padH: 16, fontSize: 14 },
  s: { height: 32, padH: 12, fontSize: 13 },
};

export function Chip({
  label,
  active = false,
  onPress,
  size = 'm',
  icon,
  disabled = false,
  style,
  testID,
}: ChipProps) {
  const theme = useTheme();
  const dims = SIZE[size];
  const fg = active ? theme.colors.textInverse : theme.colors.textMuted;
  // height < 44 → добиваем тач-таргет hitSlop.
  const slop = Math.max(0, (44 - dims.height) / 2);

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      hitSlop={{ top: slop, bottom: slop }}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      style={({ pressed }) => [
        styles.chip,
        {
          height: dims.height,
          paddingHorizontal: dims.padH,
          borderRadius: theme.radii.pill,
          borderColor: active ? theme.colors.brandPrimary : theme.colors.border,
          backgroundColor: active ? theme.colors.brandPrimary : theme.colors.surface,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon ? <View>{icon({ size: dims.fontSize + 2, color: fg })}</View> : null}
      <Text style={[styles.label, { fontSize: dims.fontSize, color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5 },
  label: { fontFamily: tokens.fonts.uiSemiBold },
});
