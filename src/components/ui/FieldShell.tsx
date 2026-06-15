/**
 * FieldShell — общая «обвязка» поля формы: label сверху, контрол, error/hint снизу.
 * Порт `.field`, `.field > label`, `.field .hint`, `.field .err` из components.css.
 * Используют Input, PhoneInput (и экраны форм). Только токены.
 */
import { type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { tokens, useTheme } from '@/theme';

export interface FieldShellProps {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function FieldShell({ label, hint, error, children, style }: FieldShellProps) {
  const theme = useTheme();
  return (
    <View style={[styles.field, style]}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      ) : null}
      {children}
      {error ? (
        <Text style={[styles.msg, { color: theme.colors.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.msg, { color: theme.colors.textFaint }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: tokens.fonts.uiSemiBold, fontSize: 13 },
  msg: { fontFamily: tokens.fonts.uiRegular, fontSize: 12 },
});
