/**
 * Skeleton — шиммер-плейсхолдер загрузки. Порт `.skel` из components.css.
 * Анимация — пульс прозрачности на core Animated (useNativeDriver), без gradient
 * (на SDK 56 не используем reanimated/linear-gradient). Плюс готовые скелетоны
 * BoxCardSkeleton и ListSkeleton для типовых экранов.
 */
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

/** Зацикленный пульс прозрачности 0.45↔1. */
function usePulse() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [v]);
  return v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });
}

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const theme = useTheme();
  const opacity = usePulse();
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.colors.surface2, opacity },
        style,
      ]}
    />
  );
}

/** Скелетон карточки бокса (фото 4:3 + заголовок/мета/цена). */
export function BoxCardSkeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.card },
        style,
      ]}
    >
      <View style={styles.photo}>
        <Skeleton width="100%" height="100%" radius={0} />
      </View>
      <View style={styles.cardBody}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="45%" height={12} />
        <Skeleton width="35%" height={18} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

/** Скелетон списка строк (аватар + две линии). */
export function ListSkeleton({ count = 6, style }: { count?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.listRow}>
          <Skeleton width={48} height={48} radius={12} />
          <View style={styles.listLines}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 4 / 3 },
  cardBody: { padding: 14, gap: 8 },
  list: { gap: 16 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listLines: { flex: 1, gap: 8 },
});
