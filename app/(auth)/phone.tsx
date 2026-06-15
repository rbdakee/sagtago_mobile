/**
 * C-03 Ввод телефона. PhoneInput (+7, маска) + согласие с офертой/политикой +
 * «Получить код» → OTP. Валидация phoneSchema (rhf + zodResolver). Без реальной
 * отправки — переход на OTP с номером в параметрах.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlassNavBar } from '@/components/glass/GlassNavBar';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { phoneSchema, type PhoneForm } from '@/domain';
import { useTheme, type Theme } from '@/theme';

const stripPrefix = (v: string) => v.replace(/^\+7/, '');
const isValidPhone = (v: string) => /^\+7\d{10}$/.test(v);

export default function Phone() {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation('auth');
  const [consent, setConsent] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
    mode: 'onTouched',
  });

  const phone = watch('phone');
  const canSubmit = consent && isValidPhone(phone);

  const onSubmit = handleSubmit((data) => {
    router.push({ pathname: '/(auth)/otp', params: { phone: data.phone } });
  });

  return (
    <View style={styles.root}>
      <GlassNavBar onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text style={styles.title}>{t('phone.title')}</Text>
        <Text style={styles.subtitle}>{t('phone.subtitle')}</Text>

        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <PhoneInput
              value={stripPrefix(field.value)}
              onChangeText={(digits) => field.onChange(digits ? `+7${digits}` : '')}
              label={t('phone.label')}
              placeholder={t('phone.placeholder')}
              error={errors.phone ? t('phone.invalid') : undefined}
              autoFocus
              containerStyle={styles.field}
            />
          )}
        />

        <View style={styles.consent}>
          <Pressable
            onPress={() => setConsent((v) => !v)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consent }}
            hitSlop={12}
          >
            <View style={[styles.box, consent && styles.boxOn]}>
              {consent ? <Check size={14} color={theme.colors.brandAccentInk} /> : null}
            </View>
          </Pressable>
          <Text style={styles.consentText}>
            {t('phone.consent')}{' '}
            <Text style={styles.link} onPress={() => Linking.openURL('https://saqtago.kz/oferta')}>
              {t('phone.offer')}
            </Text>{' '}
            {t('phone.and')}{' '}
            <Text style={styles.link} onPress={() => Linking.openURL('https://saqtago.kz/policy')}>
              {t('phone.policy')}
            </Text>
          </Text>
        </View>

        <Button
          label={t('phone.submit')}
          onPress={onSubmit}
          disabled={!canSubmit}
          fullWidth
          style={styles.submit}
        />
      </ScrollView>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    content: {
      paddingHorizontal: theme.screenPad,
      paddingTop: theme.spacing[5],
      paddingBottom: theme.spacing[8],
      gap: theme.spacing[2],
    },
    title: { ...theme.typography.h1, color: theme.colors.text },
    subtitle: { ...theme.typography.body, color: theme.colors.textMuted, marginBottom: theme.spacing[4] },
    field: { marginBottom: theme.spacing[2] },
    consent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      minHeight: 44,
    },
    box: {
      width: 22,
      height: 22,
      borderRadius: theme.radii.sm,
      borderWidth: 1.5,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    boxOn: { backgroundColor: theme.colors.brandAccent, borderColor: theme.colors.brandAccent },
    consentText: { ...theme.typography.caption, color: theme.colors.textMuted, flexShrink: 1 },
    link: {
      ...theme.typography.caption,
      color: theme.colors.brandAccent,
      fontFamily: theme.typography.h2.fontFamily,
    },
    submit: { marginTop: theme.spacing[5] },
  });
