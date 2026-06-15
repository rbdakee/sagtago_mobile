/**
 * Dev-экран для приёмки фундамента (Phase 0): проверка темы, языка, шрифтов и
 * токенов. НЕ часть продукта — служебная страница. Wave 1 (gallery-агент) может
 * расширить её визуальной галереей UI-kit. Доступ: ссылка с Главной.
 */
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatMoney, formatWindow } from '@/lib';
import { usePrefsStore, type Language, type ThemeMode } from '@/store/prefsStore';
import { useTheme, useThemeController, type Theme } from '@/theme';

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];
const LANGS: Language[] = ['ru', 'kk'];

function Segment<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.segment, { backgroundColor: theme.colors.surface2 }]}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.segmentItem,
              active && { backgroundColor: theme.colors.brandPrimary },
            ]}
          >
            <Text
              style={[
                theme.typography.caption,
                { color: active ? theme.colors.textInverse : theme.colors.textMuted },
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const SWATCHES: { key: keyof Theme['colors']; label: string }[] = [
  { key: 'brandPrimary', label: 'primary' },
  { key: 'brandAccent', label: 'accent' },
  { key: 'success', label: 'success' },
  { key: 'warning', label: 'warning' },
  { key: 'danger', label: 'danger' },
  { key: 'info', label: 'info' },
  { key: 'surface', label: 'surface' },
  { key: 'surface2', label: 'surface2' },
];

export default function Sandbox() {
  const theme = useTheme();
  const { mode, setMode, name } = useThemeController();
  const language = usePrefsStore((s) => s.language);
  const setLanguage = usePrefsStore((s) => s.setLanguage);
  const { t } = useTranslation('common');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Sandbox</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
          активная тема: {name}
        </Text>

        <Text style={[theme.typography.h2, styles.h, { color: theme.colors.text }]}>Тема</Text>
        <Segment value={mode} options={THEME_MODES} onChange={setMode} />

        <Text style={[theme.typography.h2, styles.h, { color: theme.colors.text }]}>Язык</Text>
        <Segment value={language} options={LANGS} onChange={setLanguage} />

        <Text style={[theme.typography.h2, styles.h, { color: theme.colors.text }]}>Типографика</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[theme.typography.display, { color: theme.colors.text }]}>−70%</Text>
          <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Unbounded H1</Text>
          <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Onest H2</Text>
          <Text style={[theme.typography.bodyL, { color: theme.colors.text }]}>Body-L 17</Text>
          <Text style={[theme.typography.body, { color: theme.colors.text }]}>Body 15 — основной текст</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Caption 13</Text>
          <Text style={[theme.typography.code, { color: theme.colors.text }]}>4827</Text>
        </View>

        <Text style={[theme.typography.h2, styles.h, { color: theme.colors.text }]}>Цвета</Text>
        <View style={styles.swatches}>
          {SWATCHES.map((s) => (
            <View key={s.key} style={styles.swatchWrap}>
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: theme.colors[s.key], borderColor: theme.colors.border },
                ]}
              />
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[theme.typography.h2, styles.h, { color: theme.colors.text }]}>Форматы</Text>
        <Text style={[theme.typography.body, { color: theme.colors.text }]}>
          {formatMoney(1030)} · {formatWindow({ from: '20:00', to: '21:30' })} · {t('tabs.home')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8, paddingBottom: 48 },
  h: { marginTop: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  segment: { flexDirection: 'row', borderRadius: 999, padding: 4, gap: 4, alignSelf: 'flex-start' },
  segmentItem: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatchWrap: { alignItems: 'center', gap: 4, width: 64 },
  swatch: { width: 56, height: 56, borderRadius: 12, borderWidth: 1 },
});
