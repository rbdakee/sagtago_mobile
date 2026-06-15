/**
 * C-17 Профиль (заглушка фундамента). Profile-агент (Wave 2) заменит на
 * настройки: язык RU/KK, переключатель темы, оферта/политика, выход.
 * Переключатели темы/языка пока живут в /sandbox.
 */
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation('common');
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <Text style={[theme.typography.h1, { color: theme.colors.text }]}>{t('tabs.profile')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
