/**
 * ScreenHeader — простой заголовок таб-экрана (Профиль/Избранное/Заказы).
 * Без стекла/подложки/бордера: фон = `colors.bg`, сливается с body. Заголовок
 * слева, шрифт как у города на Главной (Unbounded 24/500). Safe-area сверху.
 */
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens, useTheme } from '@/theme';

export function ScreenHeader({ title }: { title: string }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + 6,
          paddingHorizontal: theme.screenPad,
          paddingBottom: theme.spacing[3],
          backgroundColor: theme.colors.bg,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  title: {
    fontFamily: tokens.fonts.displayMedium,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.24,
  },
});
