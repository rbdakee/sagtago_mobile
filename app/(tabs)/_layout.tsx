/**
 * Таб-бар (4 таба: Главная · Заказы · Избранное · Профиль).
 * Стеклянный таб-бар — `GlassTabBar` (expo-blur, tint по теме), подключён через
 * проп `tabBar`. Лейблы внутри GlassTabBar берутся из i18n (common.tabs.*);
 * `title` здесь оставлен как фолбэк/доступность.
 */
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { GlassTabBar } from '@/components/glass/GlassTabBar';

export default function TabsLayout() {
  const { t } = useTranslation('common');

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="orders" options={{ title: t('tabs.orders') }} />
      <Tabs.Screen name="favorites" options={{ title: t('tabs.favorites') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
    </Tabs>
  );
}
