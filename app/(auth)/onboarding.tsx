/**
 * C-02 Онбординг — 2 слайда ценности (свайп). «Начать» → телефон, «Пропустить».
 * Только токены/i18n; пейджер на core ScrollView (reanimated не используем).
 */
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { useTheme, type Theme } from '@/theme';

type Slide = { key: 'value' | 'save'; emoji: string };

const SLIDES: Slide[] = [
  { key: 'value', emoji: '🥐' },
  { key: 'save', emoji: '🌍' },
];

export default function Onboarding() {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation('auth');
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const goPhone = () => router.push('/(auth)/phone');
  const onPrimary = () => {
    if (isLast) return goPhone();
    scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.pager}
      >
        {SLIDES.map((slide) => (
          <View key={slide.key} style={[styles.slide, { width }]}>
            <View style={styles.illustration}>
              <Text style={styles.emoji}>{slide.emoji}</Text>
            </View>
            <Text style={styles.title}>{t(`onboarding.slides.${slide.key}.title`)}</Text>
            <Text style={styles.text}>{t(`onboarding.slides.${slide.key}.text`)}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <View key={slide.key} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.actions}>
          <Button
            label={isLast ? t('onboarding.start') : t('onboarding.next')}
            onPress={onPrimary}
            fullWidth
          />
          <Button
            label={t('onboarding.skip')}
            onPress={goPhone}
            variant="ghost"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    pager: { flex: 1 },
    slide: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing[6],
      gap: theme.spacing[3],
    },
    illustration: {
      width: 180,
      height: 180,
      borderRadius: 60,
      backgroundColor: theme.colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[6],
    },
    emoji: { fontSize: 84, lineHeight: 100 },
    title: { ...theme.typography.h1, color: theme.colors.text, textAlign: 'center' },
    text: {
      ...theme.typography.body,
      color: theme.colors.textMuted,
      textAlign: 'center',
      maxWidth: 320,
    },
    footer: { paddingHorizontal: theme.screenPad, paddingTop: theme.spacing[4], gap: theme.spacing[5] },
    actions: { gap: theme.spacing[1] },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing[2] },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
    },
    dotActive: { width: 22, backgroundColor: theme.colors.brandAccent },
  });
