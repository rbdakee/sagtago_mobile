/**
 * C-06 Главная (витрина). Город/поиск + фильтр (→ лист C-07), чипы-категории,
 * переключатель Карта/Список, список боксов через useBoxes(filters) с pull-to-
 * refresh. Все 4 состояния: Content / Loading (скелетоны) / Empty / Error (ретрай).
 * Тап по карточке → /box/[id]. Карта — заглушка-плейсхолдер (MVP).
 *
 * Шапка (город + кнопки) — полупрозрачная стеклянная, плавающая поверх списка:
 * прячется при скролле вниз, возвращается при скролле вверх. Чипы-категории едут
 * вместе с контентом (видны только наверху, к верху не приклеены).
 */
import { router } from 'expo-router';
import { ChevronDown, Map, Search, SlidersHorizontal } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
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
import { GlassLayers } from '@/components/glass/GlassSurface';
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
  const isEmpty = !isLoading && !isError && visibleBoxes.length === 0;

  // Нижний отступ под плавающий таб-бар (капсула поверх контента).
  const listBottom = insets.bottom + theme.layout.tabbarH + theme.spacing[2];

  const toBox = (box: Box) => router.push(`/box/${box.id}`);
  const toggleFav = useToggleFavorite();

  // --- Прячущаяся шапка: translateY по направлению скролла ---
  const hideAnim = useRef(new Animated.Value(0)).current; // 0 — показана, 1 — спрятана
  const hidden = useRef(false);
  const lastY = useRef(0);
  const [headerH, setHeaderH] = useState(0);
  const topPad = headerH || insets.top + 64;

  const setHeaderHidden = (h: boolean) => {
    if (hidden.current === h) return;
    hidden.current = h;
    Animated.timing(hideAnim, {
      toValue: h ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const onScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    if (searchOpen) return;
    const y = e.nativeEvent.contentOffset.y;
    const diff = y - lastY.current;
    if (y <= 0) setHeaderHidden(false);
    else if (diff > 6) setHeaderHidden(true);
    else if (diff < -6) setHeaderHidden(false);
    lastY.current = y;
  };

  // Возвращаем шапку при смене состояния/режима/поиска.
  useEffect(() => {
    hidden.current = false;
    lastY.current = 0;
    hideAnim.setValue(0);
  }, [viewMode, isLoading, isError, isEmpty, searchOpen, hideAnim]);

  const headerTranslateY = hideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -topPad],
    extrapolate: 'clamp',
  });

  const categoriesNode = (
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
  );

  const renderBody = () => {
    if (viewMode === 'map') {
      return (
        <View style={[styles.fill, styles.statePad, { paddingTop: topPad }]}>
          {categoriesNode}
          <EmptyState
            icon={(p) => <Map {...p} />}
            title={t('map.title')}
            text={t('map.text')}
            style={styles.fill}
          />
        </View>
      );
    }
    if (isLoading) {
      return (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.listContent, { paddingTop: topPad, paddingBottom: listBottom }]}
          scrollEnabled={false}
        >
          {categoriesNode}
          {[0, 1, 2].map((i) => (
            <BoxCardSkeleton key={i} />
          ))}
        </ScrollView>
      );
    }
    if (isError) {
      return (
        <StateScroll theme={theme} topPad={topPad} header={categoriesNode} onRefresh={refetch} refreshing={isRefetching}>
          <ErrorState onRetry={() => refetch()} />
        </StateScroll>
      );
    }
    if (visibleBoxes.length === 0) {
      return (
        <StateScroll theme={theme} topPad={topPad} header={categoriesNode} onRefresh={refetch} refreshing={isRefetching}>
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
        ListHeaderComponent={categoriesNode}
        renderItem={({ item }) => (
          <BoxCard box={item} onPress={toBox} onToggleFavorite={(b) => toggleFav.mutate(b.id)} />
        )}
        contentContainerStyle={[styles.listContent, { paddingTop: topPad, paddingBottom: listBottom }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
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
      <View style={styles.body}>{renderBody()}</View>

      {/* Полупрозрачная стеклянная шапка поверх списка (прячется при скролле вниз). */}
      <Animated.View
        onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
        style={[styles.header, { transform: [{ translateY: headerTranslateY }] }]}
      >
        <View style={StyleSheet.absoluteFill}>
          <GlassLayers />
        </View>
        <View style={[styles.headerInner, { paddingTop: insets.top + 6 }]}>
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
      </Animated.View>

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
  topPad,
  header,
  onRefresh,
  refreshing,
  children,
}: {
  theme: Theme;
  topPad: number;
  header: ReactNode;
  onRefresh: () => void;
  refreshing: boolean;
  children: ReactNode;
}) {
  const styles = useStyles(theme);
  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[styles.stateScroll, { paddingTop: topPad }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.textMuted} />
      }
    >
      {header}
      <View style={styles.stateCenter}>{children}</View>
    </ScrollView>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    body: { flex: 1 },
    // Полупрозрачная стеклянная шапка-витрина, плавающая поверх контента.
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      overflow: 'hidden',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.glass.border,
    },
    headerInner: {
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
    // Чипы-категории — full-bleed внутри контента (минус screenPad родителя).
    chipsRow: { flexGrow: 0, marginHorizontal: -theme.screenPad },
    chips: {
      flexDirection: 'row',
      gap: theme.spacing[2],
      paddingHorizontal: theme.screenPad,
      paddingVertical: theme.spacing[3],
    },
    fill: { flex: 1 },
    statePad: { paddingHorizontal: theme.screenPad },
    listContent: {
      paddingHorizontal: theme.screenPad,
      gap: theme.spacing[4],
    },
    stateScroll: { flexGrow: 1, paddingHorizontal: theme.screenPad, paddingBottom: theme.spacing[8] },
    stateCenter: { flex: 1, justifyContent: 'center' },
  });
