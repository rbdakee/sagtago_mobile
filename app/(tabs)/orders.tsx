/**
 * C-13 Заказы (заглушка фундамента). Orders-агент (Wave 2) заменит на табы
 * Активные/История + 4 состояния (useActiveOrders / useOrderHistory).
 */
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export default function OrdersScreen() {
  const theme = useTheme();
  const { t } = useTranslation('common');
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <Text style={[theme.typography.h1, { color: theme.colors.text }]}>{t('tabs.orders')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
