/**
 * GlassBottomSheet — нижний лист на `Modal` (transparent) + затемнённый backdrop
 * по тапу + стеклянный лист со slide-up на core `Animated` (reanimated не
 * используем, AGENTS.md §2). Скруглён сверху (`theme.radii.sheet`), заливка glass.
 */
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, type Theme } from '@/theme';

import { GlassLayers } from './GlassSurface';

export type GlassBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children?: ReactNode;
  /** Доля высоты экрана для листа (0..1). По умолчанию — по контенту. */
  heightFraction?: number;
  /** Показать «ручку» (grabber) сверху. */
  handle?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

const DURATION = 240;

export function GlassBottomSheet({
  visible,
  onClose,
  children,
  heightFraction,
  handle = true,
  contentStyle,
}: GlassBottomSheetProps) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();

  // Animated.Value храним в state (не useRef) — совместимо с React Compiler.
  const [anim] = useState(() => new Animated.Value(0)); // 0 — закрыт, 1 — открыт

  // Вход: при visible анимируем 0→1 (без setState в эффекте).
  useEffect(() => {
    if (!visible) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: DURATION, useNativeDriver: true }).start();
  }, [visible, anim]);

  // Закрытие: сперва анимируем 1→0, затем зовём onClose (parent снимет visible).
  const close = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: DURATION, useNativeDriver: true }).start(
      ({ finished }) => {
        if (finished) onClose();
      },
    );
  }, [anim, onClose]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenH, 0],
  });
  // Нет токена scrim в фундаменте → берём тёмный цвет тени стекла (тёмный в обеих
  // темах) и доводим прозрачность до 0.45. См. отчёт: нужен theme.colors.scrim.
  const backdropOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] });
  const scrimColor = theme.shadows.glass.shadowColor;

  const sheetSizeStyle: ViewStyle = heightFraction
    ? { height: screenH * heightFraction }
    : { maxHeight: screenH * 0.88 };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={close}>
      <View style={styles.fill}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: scrimColor, opacity: backdropOpacity },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityRole="button" />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            sheetSizeStyle,
            { paddingBottom: insets.bottom + theme.spacing[2], transform: [{ translateY }] },
          ]}
        >
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.glassClip}>
              <GlassLayers strong />
            </View>
          </View>
          {handle && (
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>
          )}
          <View style={[styles.content, contentStyle]}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    fill: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
      borderTopLeftRadius: theme.radii.sheet,
      borderTopRightRadius: theme.radii.sheet,
      ...theme.shadows.glass,
    },
    glassClip: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderTopLeftRadius: theme.radii.sheet,
      borderTopRightRadius: theme.radii.sheet,
      borderWidth: 1,
      borderColor: theme.glass.border,
      overflow: 'hidden',
    },
    handleWrap: { alignItems: 'center', paddingTop: theme.spacing[2] },
    handle: {
      width: 40,
      height: 4,
      borderRadius: theme.radii.pill,
      backgroundColor: theme.colors.borderStrong,
    },
    content: {
      paddingHorizontal: theme.screenPad,
      paddingTop: theme.spacing[3],
    },
  });
