/**
 * PhoneInput — телефон KZ с фиксированным префиксом «+7» в отдельной плашке.
 * Порт `.input-prefix` / `.pfx` из components.css. value/onChangeText работают с
 * «сырыми» цифрами (до 10), на экране показывается маска `707 123 45 67`.
 */
import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInput as RNTextInput,
  type ViewStyle,
} from 'react-native';

import { tokens, useTheme } from '@/theme';

import { FieldShell } from './FieldShell';

export interface PhoneInputProps {
  /** Сырые цифры без префикса, до 10 (например `7071234567`). */
  value: string;
  onChangeText: (digits: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  autoFocus?: boolean;
  editable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const PREFIX = '+7';
const MAX_DIGITS = 10;

/** `7071234567` → `707 123 45 67` (группы 3-3-2-2). */
export function formatPhone(digits: string): string {
  const d = digits.slice(0, MAX_DIGITS);
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)].filter(Boolean);
  return parts.join(' ');
}

export const PhoneInput = forwardRef<RNTextInput, PhoneInputProps>(function PhoneInput(
  { value, onChangeText, label, hint, error, placeholder, autoFocus, editable = true, containerStyle },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.brandPrimary
      : theme.colors.border;

  return (
    <FieldShell label={label} hint={hint} error={error} style={containerStyle}>
      <View style={styles.row}>
        <View
          style={[
            styles.prefix,
            {
              borderColor: theme.colors.border,
              borderRadius: theme.radii.input,
              backgroundColor: theme.colors.surface2,
            },
          ]}
        >
          <Text style={[styles.prefixText, { color: theme.colors.text }]}>{PREFIX}</Text>
        </View>
        <TextInput
          ref={ref}
          value={formatPhone(value)}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, MAX_DIGITS))}
          keyboardType="number-pad"
          autoFocus={autoFocus}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textFaint}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            {
              borderColor,
              borderRadius: theme.radii.input,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
            },
          ]}
        />
      </View>
    </FieldShell>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prefix: { height: 52, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1.5 },
  prefixText: { fontFamily: tokens.fonts.uiSemiBold, fontSize: 15 },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontFamily: tokens.fonts.uiRegular,
    fontSize: 15,
  },
});
