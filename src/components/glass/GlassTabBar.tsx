/**
 * GlassTabBar — кастомный таб-бар для expo-router `Tabs` (через проп `tabBar`).
 * 4 таба: Главная · Заказы · Избранное · Профиль. Порт `.tabbar` из prototype.css:
 * плавающая стеклянная капсула (поля 12px, radius 9999, h68, padding 6) над
 * контентом + safe-area bottom. Активный таб — просто бренд-цвет (без подложки).
 * Лейблы — i18n `common.tabs.*`. Glass-only (AGENTS.md §1.8).
 */
import { Tabs } from 'expo-router';
import { Heart, House, ShoppingBag, User, type LucideIcon } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens, useTheme, type Theme } from '@/theme';

import { GlassLayers } from './GlassSurface';

/** Тип пропсов берём из самого `Tabs`, чтобы не тянуть deep-import bottom-tabs. */
export type GlassTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

/** Маршрут → (иконка, ключ i18n). Имена файлов в `app/(tabs)/`. */
const TAB_META: Record<string, { icon: LucideIcon; labelKey: string }> = {
  index: { icon: House, labelKey: 'tabs.home' },
  orders: { icon: ShoppingBag, labelKey: 'tabs.orders' },
  favorites: { icon: Heart, labelKey: 'tabs.favorites' },
  profile: { icon: User, labelKey: 'tabs.profile' },
};

export function GlassTabBar({ state, navigation }: GlassTabBarProps) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('common');

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={[styles.capsule, theme.shadows.glass]}>
        <View style={styles.glassLayer}>
          <GlassLayers />
        </View>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const focused = state.index === index;
          const Icon = meta.icon;
          const color = focused ? theme.colors.brandPrimary : theme.colors.textMuted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              style={styles.tab}
            >
              <Icon size={22} color={color} />
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {t(meta.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    // плавающая обвязка ПОВЕРХ контента: фон прозрачный, поэтому под/вокруг
    // капсулы просвечивает контент (никакой сплошной полосы внизу). Сама капсула
    // несёт фон; экраны добавляют нижний паддинг, чтобы контент не прятался.
    wrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
      paddingHorizontal: 12,
      paddingTop: theme.spacing[2],
    },
    capsule: {
      height: 68,
      borderRadius: 9999,
      flexDirection: 'row',
      alignItems: 'stretch',
      padding: 6,
      // непрозрачная подложка нужна, чтобы Android-elevation отбрасывал тень
      // (визуально её полностью закрывает glassLayer сверху)
      backgroundColor: theme.colors.surface,
    },
    // слой стекла отдельным absoluteFill (overflow:hidden), чтобы тень капсулы не обрезалась
    glassLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 9999,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      borderRadius: 22,
    },
    label: {
      fontFamily: tokens.fonts.uiSemiBold,
      fontSize: 11,
      lineHeight: 14,
    },
  });
