/**
 * Таб-бар (4 таба: Главная · Заказы · Избранное · Профиль).
 * ФУНДАМЕНТ создаёт базовую версию; glass-агент (Wave 1) заменяет на GlassTabBar
 * (expo-blur, tint по теме). Лейблы — через i18n (common.tabs.*).
 */
import { Tabs } from 'expo-router';
import { Heart, House, ShoppingBag, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme';

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation('common');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brandPrimary,
        tabBarInactiveTintColor: theme.colors.textFaint,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('tabs.orders'),
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('tabs.favorites'),
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
