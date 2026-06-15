/**
 * C-06 Главная (заглушка фундамента). Home-агент (Wave 2) заменит на список
 * боксов + чипы-фильтры + 4 состояния (useBoxes из @/data).
 */
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { t } = useTranslation('common');
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <Text style={[theme.typography.h1, { color: theme.colors.text }]}>{t('tabs.home')}</Text>
      <Link href="/sandbox" style={[theme.typography.body, { color: theme.colors.brandAccent }]}>
        → Sandbox (тема/язык/токены)
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
