/**
 * CodeCard — крупный код выдачи (порт `.codecard`): большой код с разрядкой
 * (`theme.typography.code`) + кнопка «ярче». «Ярче» локально повышает контраст
 * карточки (белый фон) для считывания на кассе.
 *
 * Примечание: нативное управление яркостью экрана требует `expo-brightness`
 * (нет в зависимостях) — прокидываем `onBrighten`, владелец подключит. См. отчёт.
 */
import { Sun } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme, type Theme } from '@/theme';

export type CodeCardProps = {
  code: string;
  /** Доп. обработчик при включении «ярче» (напр. expo-brightness). */
  onBrighten?: (bright: boolean) => void;
  /** Подпись кнопки «ярче». Если не задана — кнопка только с иконкой. */
  brightenLabel?: string;
};

export function CodeCard({ code, onBrighten, brightenLabel }: CodeCardProps) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const [bright, setBright] = useState(false);

  const toggle = () => {
    const next = !bright;
    setBright(next);
    onBrighten?.(next);
  };

  // bright: белый фон (textInverse — #FFF в обеих темах) + тёмный код.
  const cardBg = bright ? theme.colors.textInverse : theme.colors.surface;
  const codeColor = bright ? theme.colors.brandPrimary : theme.colors.text;
  const btnIconColor = bright ? theme.colors.brandPrimary : theme.colors.textMuted;

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <Text style={[theme.typography.code, styles.code, { color: codeColor }]}>{code}</Text>
      <Pressable
        onPress={toggle}
        hitSlop={8}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        accessibilityRole="button"
        accessibilityState={{ selected: bright }}
        accessibilityLabel={brightenLabel}
      >
        <Sun size={18} color={btnIconColor} />
        {brightenLabel ? (
          <Text style={[styles.btnText, { color: btnIconColor }]}>{brightenLabel}</Text>
        ) : null}
      </Pressable>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
      padding: theme.spacing[6],
      alignItems: 'center',
      gap: theme.spacing[3],
      ...theme.shadows.card,
    },
    code: { textAlign: 'center' },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      minHeight: 44,
      paddingHorizontal: theme.spacing[3],
    },
    btnPressed: { opacity: 0.7 },
    btnText: {
      ...theme.typography.caption,
      fontFamily: theme.typography.h2.fontFamily,
    },
  });
