/**
 * C-06 Главная (витрина). Город/поиск + фильтр (→ лист C-07), чипы-категории,
 * переключатель Карта/Список, список боксов через useBoxes(filters) с pull-to-
 * refresh. Все 4 состояния: Content / Loading (скелетоны) / Empty / Error (ретрай).
 * Тап по карточке → /box/[id]. Карта — заглушка-плейсхолдер (MVP).
 */
import { router } from 'expo-router';
import { ChevronDown, Map, Search, SlidersHorizontal } from 'lucide-react-native';
import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BoxCard } from '@/components/domain/BoxCard';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { BoxCardSkeleton } from '@/components/states/Skeleton';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { DEFAULT_CITY } from '@/config/constants';
import { useBoxes, useToggleFavorite } from '@/data';
import { MERCHANT_CATEGORIES, type Box, type MerchantCategory } from '@/domain';
import { tokens, useTheme, type Theme } from '@/theme';

import {
  FiltersSheet,
  selectVisibleBoxes,
  toBoxFilters,
  useFilters,
} from '../filters';

type ViewMode = 'list' | 'map';

export default function HomeScreen() {
  const theme = useTheme();
  const styles = useStyles(theme);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('home');

  const categories = useFilters((s) => s.categories);
  const priceMax = useFilters((s) => s.priceMax);
  const timeWindow = useFilters((s) => s.window);
  const query = useFilters((s) => s.query);
  const setQuery = useFilters((s) => s.setQuery);
  const toggleCategory = useFilters((s) => s.toggleCategory);
  const clearCategories = useFilters((s) => s.clearCategories);
  const reset = useFilters((s) => s.reset);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { data, isLoading, isError, refetch, isRefetching } = useBoxes(
    toBoxFilters({ categories, priceMax }),
  );

  // Поиск и окно доводим на клиенте (мгновенно, без перезапроса).
  const visibleBoxes = useMemo(
    () => (data ? selectVisibleBoxes(data, { query, window: timeWindow }) : []),
    [data, query, timeWindow],
  );

  const hasActiveFilters =
    categories.length > 0 || priceMax !== undefined || timeWindow !== 'any' || query.trim() !== '';

  // Нижний отступ под плавающий таб-бар (капсула поверх контента).
  const listBottom = insets.bottom + theme.layout.tabbarH + theme.spacing[2];

  const toBox = (box: Box) => router.push(`/box/${box.id}`);
  const toggleFav = useToggleFavorite();

  const renderBody = () => {
    if (viewMode === 'map') {
      return (
        <EmptyState
          icon={(p) => <Map {...p} />}
          title={t('map.title')}
          text={t('map.text')}
          style={styles.fill}
        />
      );
    }
    if (isLoading) {
      return (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.listContent, { paddingBottom: listBottom }]}
          scrollEnabled={false}
        >
          {[0, 1, 2].map((i) => (
            <BoxCardSkeleton key={i} />
          ))}
        </ScrollView>
      );
    }
    if (isError) {
      return (
        <StateScroll theme={theme} onRefresh={refetch} refreshing={isRefetching}>
          <ErrorState onRetry={() => refetch()} />
        </StateScroll>
      );
    }
    if (visibleBoxes.length === 0) {
      return (
        <StateScroll theme={theme} onRefresh={refetch} refreshing={isRefetching}>
          <EmptyState
            title={t('empty.title')}
            text={t('empty.text')}
            ctaLabel={hasActiveFilters ? t('common:actions.reset') : t('empty.cta')}
            onCtaPress={hasActiveFilters ? reset : () => undefined}
          />
        </StateScroll>
      );
    }
    return (
      <FlatList
        style={styles.fill}
        data={visibleBoxes}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <BoxCard box={item} onPress={toBox} onToggleFavorite={(b) => toggleFav.mutate(b.id)} />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: listBottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.textMuted}
          />
        }
      />
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        {searchOpen ? (
          <View style={styles.searchRow}>
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder={t('search.placeholder')}
              icon={(p) => <Search {...p} />}
              autoFocus
              returnKeyType="search"
              containerStyle={styles.searchField}
              inputStyle={styles.searchInput}
            />
            <Pressable
              onPress={() => setSearchOpen(false)}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.searchCancel}>{t('common:actions.cancel')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.headerRow}>
            <Pressable style={styles.city} hitSlop={6} accessibilityRole="button">
              <Text style={styles.cityText} numberOfLines={1}>
                {DEFAULT_CITY}
              </Text>
              <ChevronDown size={20} color={theme.colors.brandPrimary} />
            </Pressable>
            <View style={styles.actions}>
              <RoundButton
                theme={theme}
                onPress={() => setSearchOpen(true)}
                accessibilityLabel={t('search.placeholder')}
              >
                <Search size={22} color={theme.colors.text} />
              </RoundButton>
              <RoundButton
                theme={theme}
                active={viewMode === 'map'}
                onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                accessibilityLabel={t('map.title')}
              >
                <Map
                  size={22}
                  color={viewMode === 'map' ? theme.colors.brandPrimary : theme.colors.text}
                />
              </RoundButton>
              <RoundButton
                theme={theme}
                onPress={() => setSheetOpen(true)}
                accessibilityLabel={t('filters.title')}
              >
                <SlidersHorizontal size={22} color={theme.colors.text} />
                {hasActiveFilters ? <View style={styles.filterDot} /> : null}
              </RoundButton>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsRow}
      >
        <Chip label={t('categories.all')} active={categories.length === 0} onPress={clearCategories} />
        {MERCHANT_CATEGORIES.map((c: MerchantCategory) => (
          <Chip
            key={c}
            label={t(`categories.${c}`)}
            active={categories.includes(c)}
            onPress={() => toggleCategory(c)}
          />
        ))}
      </ScrollView>

      <View style={styles.body}>{renderBody()}</View>

      <FiltersSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

/** Круглая иконка-кнопка шапки (порт `.iconbtn-round`): surface + граница + тень. */
function RoundButton({
  theme,
  children,
  onPress,
  active = false,
  accessibilityLabel,
}: {
  theme: Theme;
  children: ReactNode;
  onPress: () => void;
  active?: boolean;
  accessibilityLabel?: string;
}) {
  const styles = useStyles(theme);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.roundBtn,
        active && styles.roundBtnActive,
        pressed && styles.roundBtnPressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

function StateScroll({
  theme,
  onRefresh,
  refreshing,
  children,
}: {
  theme: Theme;
  onRefresh: () => void;
  refreshing: boolean;
  children: ReactNode;
}) {
  const styles = useStyles(theme);
  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={styles.stateScroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.textMuted} />
      }
    >
      {children}
    </ScrollView>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    // Прозрачная шапка-витрина (порт `.home-head`): заголовок слева, кнопки справа.
    header: {
      paddingHorizontal: theme.screenPad,
      paddingBottom: theme.spacing[3],
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], minHeight: 44 },
    city: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
    cityText: {
      fontFamily: tokens.fonts.displayMedium,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.24,
      color: theme.colors.text,
    },
    actions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
    roundBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.card,
    },
    roundBtnActive: { borderColor: theme.colors.brandPrimary, backgroundColor: theme.colors.accentSoft },
    roundBtnPressed: { backgroundColor: theme.colors.surface2 },
    filterDot: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.brandAccent,
    },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], minHeight: 44 },
    searchField: { flex: 1 },
    searchInput: { height: 48, borderRadius: 999, borderColor: theme.colors.brandPrimary },
    searchCancel: {
      fontFamily: tokens.fonts.uiBold,
      fontSize: 15,
      color: theme.colors.brandPrimary,
      paddingHorizontal: 4,
    },
    chipsRow: { flexGrow: 0 },
    chips: {
      flexDirection: 'row',
      gap: theme.spacing[2],
      paddingHorizontal: theme.screenPad,
      paddingVertical: theme.spacing[3],
    },
    body: { flex: 1 },
    fill: { flex: 1 },
    listContent: {
      paddingHorizontal: theme.screenPad,
      paddingTop: theme.spacing[1],
      paddingBottom: theme.spacing[6],
      gap: theme.spacing[4],
    },
    stateScroll: { flexGrow: 1, justifyContent: 'center', paddingBottom: theme.spacing[8] },
  });
