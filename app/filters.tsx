/**
 * C-07 Фильтры — GlassBottomSheet: категории, цена, окно выдачи + «Применить»
 * (с кол-вом результатов) и «Сбросить».
 *
 * Этот файл — единый источник правды по фильтрам витрины:
 *  - `useFilters` — zustand-стор применённых фильтров (живёт между Главной и листом);
 *  - `toBoxFilters` — маппинг в `BoxFilters` (категории/цена обрабатывает репозиторий);
 *  - `selectVisibleBoxes` — клиентская доводка (поиск + окно): окна в `BoxFilters`
 *    нет, поэтому фильтр по окну считаем на клиенте (см. отчёт — нехватка фундамента);
 *  - `FiltersSheet` — переиспользуемый лист (Главная монтирует его локально, чтобы
 *    бэкдроп просвечивал витрину; роут `/filters` рендерит его же отдельно).
 */
import { Stack, router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { create } from 'zustand';

import { GlassBottomSheet } from '@/components/glass/GlassBottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { useBoxes, type BoxFilters } from '@/data';
import { MERCHANT_CATEGORIES, type Box, type MerchantCategory } from '@/domain';
import { formatMoney } from '@/lib';
import { useTheme, type Theme } from '@/theme';

// ---- Модель фильтров ----

export type WindowBucket = 'any' | 'morning' | 'day' | 'evening';

export type FilterState = {
  categories: MerchantCategory[];
  priceMax?: number;
  window: WindowBucket;
  query: string;
};

type FilterStore = FilterState & {
  toggleCategory: (c: MerchantCategory) => void;
  clearCategories: () => void;
  setQuery: (q: string) => void;
  apply: (f: FilterState) => void;
  reset: () => void;
};

const DEFAULTS: FilterState = { categories: [], priceMax: undefined, window: 'any', query: '' };

export const useFilters = create<FilterStore>((set) => ({
  ...DEFAULTS,
  toggleCategory: (c) =>
    set((s) => ({
      categories: s.categories.includes(c)
        ? s.categories.filter((x) => x !== c)
        : [...s.categories, c],
    })),
  clearCategories: () => set({ categories: [] }),
  setQuery: (query) => set({ query }),
  apply: (f) => set({ ...f }),
  reset: () => set({ ...DEFAULTS }),
}));

/** Применённые фильтры → BoxFilters (то, что умеет репозиторий). */
export function toBoxFilters(f: Pick<FilterState, 'categories' | 'priceMax'>): BoxFilters {
  return {
    categories: f.categories.length ? f.categories : undefined,
    priceMax: f.priceMax,
  };
}

/** Утро < 12:00, День 12–17, Вечер ≥ 17:00 (по началу окна). */
export function windowBucketOf(from: string): Exclude<WindowBucket, 'any'> {
  const h = parseInt(from.slice(0, 2), 10) || 0;
  if (h < 12) return 'morning';
  if (h < 17) return 'day';
  return 'evening';
}

/** Клиентская доводка списка боксов: поиск по названию/заведению + окно выдачи. */
export function selectVisibleBoxes(
  boxes: Box[],
  opts: { query?: string; window?: WindowBucket },
): Box[] {
  let result = boxes;
  const bucket = opts.window ?? 'any';
  if (bucket !== 'any') {
    result = result.filter((b) => windowBucketOf(b.pickupWindow.from) === bucket);
  }
  const q = opts.query?.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (b) => b.title.toLowerCase().includes(q) || b.merchant.name.toLowerCase().includes(q),
    );
  }
  return result;
}

const PRICE_OPTIONS = [1000, 2000, 3000];
const WINDOWS: WindowBucket[] = ['any', 'morning', 'day', 'evening'];
const WINDOW_LABEL: Record<WindowBucket, string> = {
  any: 'filters.windowAny',
  morning: 'filters.windowMorning',
  day: 'filters.windowDay',
  evening: 'filters.windowEvening',
};

// ---- Лист фильтров ----

export type FiltersSheetProps = { visible: boolean; onClose: () => void };

export function FiltersSheet({ visible, onClose }: FiltersSheetProps) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation('home');

  const apply = useFilters((s) => s.apply);
  const query = useFilters((s) => s.query);

  // Черновик: правим локально, в стор пишем только по «Применить».
  const [cats, setCats] = useState<MerchantCategory[]>(() => useFilters.getState().categories);
  const [priceMax, setPriceMax] = useState<number | undefined>(() => useFilters.getState().priceMax);
  const [win, setWin] = useState<WindowBucket>(() => useFilters.getState().window);

  // При каждом открытии синхронизируем черновик с применёнными фильтрами.
  useEffect(() => {
    if (!visible) return;
    const s = useFilters.getState();
    setCats(s.categories);
    setPriceMax(s.priceMax);
    setWin(s.window);
  }, [visible]);

  const { data: countBoxes } = useBoxes(toBoxFilters({ categories: cats, priceMax }));
  const count = countBoxes
    ? selectVisibleBoxes(countBoxes, { query, window: win }).length
    : undefined;

  const applyLabel =
    count === undefined
      ? t('filters.apply')
      : count === 0
        ? t('filters.applyEmpty')
        : t('filters.applyCount', { count });

  const toggleCat = (c: MerchantCategory) =>
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const onApply = () => {
    apply({ categories: cats, priceMax, window: win, query });
    onClose();
  };
  const onReset = () => {
    setCats([]);
    setPriceMax(undefined);
    setWin('any');
  };

  return (
    <GlassBottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{t('filters.title')}</Text>

      <Section label={t('filters.category')} theme={theme}>
        {MERCHANT_CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={t(`categories.${c}`)}
            active={cats.includes(c)}
            onPress={() => toggleCat(c)}
            size="s"
          />
        ))}
      </Section>

      <Section label={t('filters.price')} theme={theme}>
        <Chip
          label={t('filters.priceAny')}
          active={priceMax === undefined}
          onPress={() => setPriceMax(undefined)}
          size="s"
        />
        {PRICE_OPTIONS.map((p) => (
          <Chip
            key={p}
            label={t('filters.priceUpTo', { value: formatMoney(p) })}
            active={priceMax === p}
            onPress={() => setPriceMax(p)}
            size="s"
          />
        ))}
      </Section>

      <Section label={t('filters.window')} theme={theme}>
        {WINDOWS.map((w) => (
          <Chip
            key={w}
            label={t(WINDOW_LABEL[w])}
            active={win === w}
            onPress={() => setWin(w)}
            size="s"
          />
        ))}
      </Section>

      <View style={styles.actions}>
        <Button label={t('filters.reset')} variant="secondary" onPress={onReset} style={styles.reset} />
        <Button label={applyLabel} onPress={onApply} disabled={count === 0} style={styles.apply} />
      </View>
    </GlassBottomSheet>
  );
}

function Section({
  label,
  theme,
  children,
}: {
  label: string;
  theme: Theme;
  children: ReactNode;
}) {
  const styles = useStyles(theme);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

// ---- Роут /filters (отдельный показ листа; Главная монтирует FiltersSheet сама) ----

export default function FiltersScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <FiltersSheet visible onClose={() => router.back()} />
    </>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    title: { ...theme.typography.h2, color: theme.colors.text, marginBottom: theme.spacing[2] },
    section: { marginTop: theme.spacing[4], gap: theme.spacing[3] },
    sectionLabel: {
      ...theme.typography.caption,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.textMuted,
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing[3],
      marginTop: theme.spacing[6],
    },
    reset: { flex: 1 },
    apply: { flex: 2 },
  });
