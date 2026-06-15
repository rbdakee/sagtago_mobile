/**
 * Stepper — счётчик количества `− N +`. Порт `.stepper` из components.css.
 * Кнопки 44×44 (тач-таргет), значение tabular. Ограничение min/max (остаток).
 */
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

import { tokens, useTheme } from '@/theme';

export interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  disabled = false,
  style,
}: StepperProps) {
  const theme = useTheme();
  const canDec = !disabled && value > min;
  const canInc = !disabled && value < max;

  const btnColor = (enabled: boolean) =>
    enabled ? theme.colors.brandPrimary : theme.colors.textFaint;

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: theme.colors.border,
          borderRadius: theme.radii.pill,
          backgroundColor: theme.colors.surface,
        },
        style,
      ]}
    >
      <Pressable
        style={styles.btn}
        disabled={!canDec}
        onPress={() => onChange(Math.max(min, value - step))}
        accessibilityRole="button"
        accessibilityLabel="−"
      >
        <Minus size={22} color={btnColor(canDec)} />
      </Pressable>
      <Text style={[styles.val, { color: theme.colors.text }]}>{value}</Text>
      <Pressable
        style={styles.btn}
        disabled={!canInc}
        onPress={() => onChange(Math.min(max, value + step))}
        accessibilityRole="button"
        accessibilityLabel="+"
      >
        <Plus size={22} color={btnColor(canInc)} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, overflow: 'hidden', alignSelf: 'flex-start' },
  btn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  val: {
    minWidth: 40,
    textAlign: 'center',
    fontFamily: tokens.fonts.uiSemiBold,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
  },
});
