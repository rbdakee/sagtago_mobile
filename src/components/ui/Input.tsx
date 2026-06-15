/**
 * Input — текстовое/числовое поле и textarea. Порт `.input` / `.input-wrap`
 * из components.css: высота 52, border 1.5, radius input, focus → бренд-рамка,
 * error → danger-рамка. Опц. иконка слева, label/hint/error через FieldShell.
 */
import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInput as RNTextInput,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { tokens, useTheme } from '@/theme';

import { FieldShell } from './FieldShell';
import type { IconRenderer } from './icon';

export interface InputProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  label?: string;
  hint?: string;
  error?: string;
  /** textarea-режим (многострочно, min-height 96). */
  textarea?: boolean;
  /** Иконка слева внутри поля. */
  icon?: IconRenderer;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
}

export const Input = forwardRef<RNTextInput, InputProps>(function Input(
  { label, hint, error, textarea = false, icon, containerStyle, inputStyle, onFocus, onBlur, ...rest },
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
      <View style={styles.wrap}>
        {icon ? (
          <View style={styles.icon} pointerEvents="none">
            {icon({ size: 20, color: theme.colors.textMuted })}
          </View>
        ) : null}
        <TextInput
          ref={ref}
          multiline={textarea}
          placeholderTextColor={theme.colors.textFaint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              borderColor,
              borderRadius: theme.radii.input,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
            },
            textarea && styles.textarea,
            !!icon && styles.inputWithIcon,
            inputStyle,
          ]}
          {...rest}
        />
      </View>
    </FieldShell>
  );
});

const styles = StyleSheet.create({
  wrap: { position: 'relative', justifyContent: 'center' },
  icon: { position: 'absolute', left: 14, zIndex: 1 },
  input: {
    height: 52,
    width: '100%',
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontFamily: tokens.fonts.uiRegular,
    fontSize: 15,
  },
  inputWithIcon: { paddingLeft: 44 },
  textarea: { height: undefined, minHeight: 96, paddingVertical: 12, textAlignVertical: 'top' },
});
