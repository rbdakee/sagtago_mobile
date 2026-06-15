/**
 * C-04 Ввод OTP. Код из OTP_LENGTH ячеек, таймер ресенда + «Отправить по SMS».
 * Мок: принимаем любой код нужной длины → sessionStore.signIn(phone) → разрешения.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassNavBar } from '@/components/glass/GlassNavBar';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/ui/OTPInput';
import { formatPhone } from '@/components/ui/PhoneInput';
import { OTP_LENGTH } from '@/config/constants';
import { useSessionStore } from '@/store/sessionStore';
import { useTheme, type Theme } from '@/theme';

export default function Otp() {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation('auth');
  const { phone = '' } = useLocalSearchParams<{ phone: string }>();
  const signIn = useSessionStore((s) => s.signIn);
  const [code, setCode] = useState('');

  const display = `+7 ${formatPhone(phone.replace(/^\+7/, ''))}`.trimEnd();
  const isComplete = code.length === OTP_LENGTH;

  const confirm = () => {
    if (!isComplete) return;
    // Мок: любой код принимаем как валидный (бэкенда нет).
    signIn(phone);
    router.replace('/(auth)/permissions');
  };

  return (
    <View style={styles.root}>
      <GlassNavBar onBack={() => router.back()} />
      <View style={styles.content}>
        <Text style={styles.title}>{t('otp.title')}</Text>
        <Text style={styles.subtitle}>{t('otp.sentVia', { phone: display })}</Text>

        <OTPInput
          value={code}
          onChangeText={setCode}
          onComplete={confirm}
          onResend={() => undefined}
          resendLabel={t('otp.resend')}
          autoFocus
          style={styles.otp}
        />

        <Button
          label={t('otp.submit')}
          onPress={confirm}
          disabled={!isComplete}
          fullWidth
          style={styles.submit}
        />

        <Pressable
          onPress={() => undefined}
          style={styles.sms}
          hitSlop={6}
          accessibilityRole="button"
        >
          <Text style={styles.smsText}>{t('otp.resendSms')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    content: {
      flex: 1,
      paddingHorizontal: theme.screenPad,
      paddingTop: theme.spacing[6],
      alignItems: 'center',
    },
    title: { ...theme.typography.h1, color: theme.colors.text, textAlign: 'center' },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginTop: theme.spacing[2],
      marginBottom: theme.spacing[8],
    },
    otp: { alignItems: 'center' },
    submit: { marginTop: theme.spacing[8], alignSelf: 'stretch' },
    sms: { marginTop: theme.spacing[4], minHeight: 44, justifyContent: 'center' },
    smsText: {
      ...theme.typography.body,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.brandPrimary,
    },
  });
