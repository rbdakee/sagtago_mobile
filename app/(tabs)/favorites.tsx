/**
 * Избранное. useFavorites → список BoxCard; тоггл через useToggleFavorite.
 * 4 состояния (Content / Loading / Empty / Error). Тап по карточке → /box/[id].
 */
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BoxCard } from '@/components/domain/BoxCard';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { BoxCardSkeleton } from '@/components/states/Skeleton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useFavorites, useToggleFavorite } from '@/data';
import { useTheme, useThemedStyles, type Theme } from '@/theme';

export default function FavoritesScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('favorites');

  const { data, isLoading, isError, refetch } = useFavorites();
  const toggleFav = useToggleFavorite();

  const topPad = theme.spacing[2];
  const bottomPad = insets.bottom + theme.layout.tabbarH + theme.spacing[2];

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={[styles.content, { paddingTop: topPad, paddingBottom: bottomPad }]}>
          <BoxCardSkeleton />
          <BoxCardSkeleton />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={[styles.stateWrap, { paddingTop: topPad }]}>
          <ErrorState onRetry={refetch} />
        </View>
      );
    }
    if (!data || data.length === 0) {
      return (
        <View style={[styles.stateWrap, { paddingTop: topPad }]}>
          <EmptyState
            emoji="❤️"
            title={t('emptyTitle')}
            text={t('emptyText')}
            ctaLabel={t('emptyCta')}
            onCtaPress={() => router.navigate('/(tabs)')}
          />
        </View>
      );
    }
    return (
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {data.map((box) => (
          <BoxCard
            key={box.id}
            box={box}
            onPress={(b) => router.push({ pathname: '/box/[id]', params: { id: b.id } })}
            onToggleFavorite={(b) => toggleFav.mutate(b.id)}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title={t('title')} />
      {renderBody()}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    fill: { flex: 1 },
    content: { paddingHorizontal: theme.screenPad, gap: theme.spacing[4] },
    stateWrap: { flex: 1, paddingHorizontal: theme.screenPad, justifyContent: 'center' },
  });
