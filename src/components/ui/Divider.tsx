/**
 * Divider — разделитель 1px. Порт `.divider` из components.css.
 * По умолчанию горизонтальный; vertical — тонкая вертикальная линия.
 */
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export interface DividerProps {
  vertical?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Divider({ vertical = false, style }: DividerProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: theme.colors.border },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: { height: 1, alignSelf: 'stretch' },
  vertical: { width: 1, alignSelf: 'stretch' },
});
