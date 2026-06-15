/**
 * OTPInput — поле кода из 4–6 ячеек (по умолчанию OTP_LENGTH). Порт `.otp .cell`
 * из components.css: состояния filled / current (бренд-рамка + ring) / err.
 * Один скрытый TextInput ловит ввод, ячейки — визуализация. Опц. таймер ресенда.
 */
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { OTP_LENGTH, OTP_RESEND_SECONDS } from '@/config/constants';
import { tokens, useTheme } from '@/theme';

export interface OTPInputProps {
  value: string;
  onChangeText: (v: string) => void;
  length?: number;
  error?: boolean;
  autoFocus?: boolean;
  onComplete?: (v: string) => void;
  /** Длительность таймера до повторной отправки, сек. */
  resendSeconds?: number;
  /** Если задан — под ячейками появляется кнопка ресенда с обратным отсчётом. */
  onResend?: () => void;
  /** Подпись кнопки ресенда (i18n из вызывающего экрана). */
  resendLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function OTPInput({
  value,
  onChangeText,
  length = OTP_LENGTH,
  error = false,
  autoFocus = false,
  onComplete,
  resendSeconds = OTP_RESEND_SECONDS,
  onResend,
  resendLabel,
  style,
}: OTPInputProps) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const [remaining, setRemaining] = useState(resendSeconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    onChangeText(digits);
    if (digits.length === length) onComplete?.(digits);
  };

  const cells = Array.from({ length });

  return (
    <View style={style}>
      <Pressable style={styles.row} onPress={() => inputRef.current?.focus()}>
        {cells.map((_, i) => {
          const char = value[i] ?? '';
          const isCurrent = focused && i === value.length && !error;
          const isFilled = !!char && !error;
          const borderColor = error
            ? theme.colors.danger
            : isCurrent || isFilled
              ? theme.colors.brandPrimary
              : theme.colors.border;
          return (
            <View
              key={i}
              style={[
                styles.cell,
                {
                  borderColor,
                  borderRadius: theme.radii.input,
                  backgroundColor: theme.colors.surface,
                },
                isCurrent && { borderWidth: 1.5, shadowColor: theme.colors.brandPrimary },
                isCurrent && styles.currentRing,
              ]}
            >
              <Text style={[styles.cellText, { color: theme.colors.text }]}>{char}</Text>
            </View>
          );
        })}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={length}
          autoFocus={autoFocus}
          caretHidden
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.hidden}
        />
      </Pressable>

      {onResend ? (
        <Pressable
          disabled={remaining > 0}
          onPress={() => {
            onResend();
            setRemaining(resendSeconds);
          }}
          style={styles.resend}
        >
          <Text
            style={[
              styles.resendText,
              { color: remaining > 0 ? theme.colors.textFaint : theme.colors.brandPrimary },
            ]}
          >
            {resendLabel}
            {remaining > 0 ? ` (${remaining})` : ''}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  cell: {
    width: 50,
    height: 60,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentRing: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  cellText: {
    fontFamily: tokens.fonts.uiSemiBold,
    fontSize: 24,
    fontVariant: ['tabular-nums'],
  },
  hidden: { position: 'absolute', opacity: 0, width: '100%', height: '100%' },
  resend: { marginTop: 12, alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  resendText: { fontFamily: tokens.fonts.uiSemiBold, fontSize: 14 },
});
