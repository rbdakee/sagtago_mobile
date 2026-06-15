/**
 * C-05 Разрешения — гео + пуш (мок, без реального запроса прав). «Разрешить» и
 * «Позже» оба ведут на табы (доступ к функциям подключим вместе с нативными API).
 */
import { router } from 'expo-router';
import { Bell, MapPin } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { useTheme, type Theme } from '@/theme';

type Perm = { key: 'geo' | 'push'; Icon: ComponentType<{ size?: number; color?: string }> };

const PERMS: Perm[] = [
  { key: 'geo', Icon: MapPin },
  { key: 'push', Icon: Bell },
];

export default function Permissions() {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation('auth');

  const goHome = () => router.replace('/(tabs)');

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('permissions.title')}</Text>
        <Text style={styles.subtitle}>{t('permissions.subtitle')}</Text>

        <View style={styles.cards}>
          {PERMS.map(({ key, Icon }) => (
            <View key={key} style={styles.card}>
              <View style={styles.icon}>
                <Icon size={22} color={theme.colors.brandAccent} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{t(`permissions.${key}.title`)}</Text>
                <Text style={styles.cardSub}>{t(`permissions.${key}.text`)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label={t('permissions.allow')} onPress={goHome} fullWidth />
        <Button label={t('permissions.later')} onPress={goHome} variant="ghost" fullWidth />
      </View>
    </SafeAreaView>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    content: { flex: 1, paddingHorizontal: theme.screenPad, paddingTop: theme.spacing[8] },
    title: { ...theme.typography.h1, color: theme.colors.text },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textMuted,
      marginTop: theme.spacing[2],
      marginBottom: theme.spacing[8],
    },
    cards: { gap: theme.spacing[3] },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[4],
      padding: theme.spacing[4],
      borderRadius: theme.radii.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    icon: {
      width: 48,
      height: 48,
      borderRadius: theme.radii.input,
      backgroundColor: theme.colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardText: { flex: 1, gap: 2 },
    cardTitle: { ...theme.typography.bodyL, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    cardSub: { ...theme.typography.caption, color: theme.colors.textMuted },
    footer: { paddingHorizontal: theme.screenPad, paddingBottom: theme.spacing[3], gap: theme.spacing[2] },
  });
