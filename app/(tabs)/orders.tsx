/**
 * C-13 Заказы (BP-06). Табы Активные / История.
 *  - Активные: useActiveOrders → карточки с кодом (→ /order/[id]).
 *  - История:  useOrderHistory → OrderRow с бейджем статуса (→ /order/[id]).
 * Каждая вкладка — 4 состояния (Content / Loading / Empty / Error).
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ChevronRight, Clock } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderRow } from '@/components/domain/OrderRow';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { ListSkeleton } from '@/components/states/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useActiveOrders, useOrderHistory } from '@/data';
import { ORDER_STATUS_VARIANT, type Order } from '@/domain';
import { formatWindow } from '@/lib';
import { useTheme, useThemedStyles, type Theme } from '@/theme';

type Tab = 'active' | 'history';

export default function OrdersScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('orders');

  const [tab, setTab] = useState<Tab>('active');

  const listBottom = insets.bottom + theme.layout.tabbarH + theme.spacing[2];

  return (
    <View style={styles.root}>
      <ScreenHeader title={t('title')} />

      {/* Таб-переключатель Активные / История */}
      <View style={styles.segmentWrap}>
        <View style={styles.segment}>
          {(['active', 'history'] as Tab[]).map((key) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {t(`tabs.${key}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={{
          paddingTop: theme.spacing[1],
          paddingBottom: listBottom,
          paddingHorizontal: theme.screenPad,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'active' ? <ActiveTab styles={styles} /> : <HistoryTab styles={styles} />}
      </ScrollView>
    </View>
  );
}

function ActiveTab({ styles }: { styles: ReturnType<typeof makeStyles> }) {
  const { t } = useTranslation('orders');
  const { data, isLoading, isError, refetch } = useActiveOrders();

  if (isLoading) return <ListSkeleton count={3} />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        emoji="🛍️"
        title={t('active.emptyTitle')}
        text={t('active.emptyText')}
        ctaLabel={t('active.emptyCta')}
        onCtaPress={() => router.navigate('/(tabs)')}
      />
    );
  }
  return (
    <View style={styles.list}>
      {data.map((order) => (
        <ActiveOrderCard key={order.id} order={order} styles={styles} />
      ))}
    </View>
  );
}

function HistoryTab({ styles }: { styles: ReturnType<typeof makeStyles> }) {
  const { t } = useTranslation('orders');
  const { data, isLoading, isError, refetch } = useOrderHistory();

  if (isLoading) return <ListSkeleton count={5} />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data || data.length === 0) {
    return <EmptyState emoji="📦" title={t('history.emptyTitle')} text={t('history.emptyText')} />;
  }
  return (
    <View style={styles.historyCard}>
      {data.map((order, i) => (
        <View key={order.id}>
          {i > 0 ? <Divider /> : null}
          <OrderRow
            order={order}
            onPress={(o) => router.push({ pathname: '/order/[id]', params: { id: o.id } })}
          />
        </View>
      ))}
    </View>
  );
}

function ActiveOrderCard({
  order,
  styles,
}: {
  order: Order;
  styles: ReturnType<typeof makeStyles>;
}) {
  const theme = useTheme();
  const { t } = useTranslation('orders');
  const { t: tc } = useTranslation('common');

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
      style={({ pressed }) => [styles.activeCard, pressed && { opacity: 0.96 }]}
      accessibilityRole="button"
    >
      <View style={styles.activeTop}>
        <Image
          source={{ uri: order.box.photo }}
          style={styles.thumb}
          contentFit="cover"
          transition={150}
        />
        <View style={styles.activeInfo}>
          <Text style={styles.activeTitle} numberOfLines={1}>
            {order.box.title}
          </Text>
          <Text style={styles.activeSub} numberOfLines={1}>
            {order.merchant.name}
          </Text>
          <View style={styles.activeTimeRow}>
            <Clock size={14} color={theme.colors.textFaint} />
            <Text style={styles.activeTime} numberOfLines={1}>
              {t('active.today')} {formatWindow(order.pickupWindow)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.activeBottom}>
        <Badge variant={ORDER_STATUS_VARIANT[order.status]} label={tc(`status.order.${order.status}`)} />
        <View style={styles.showCode}>
          <Text style={styles.codeCta}>{t('active.open')}</Text>
          <ChevronRight size={18} color={theme.colors.brandPrimary} />
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    fill: { flex: 1 },

    segmentWrap: {
      paddingHorizontal: theme.screenPad,
      paddingBottom: theme.spacing[3],
      backgroundColor: theme.colors.bg,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface2,
      borderRadius: theme.radii.pill,
      padding: 4,
      gap: 4,
    },
    segmentItem: {
      flex: 1,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radii.pill,
    },
    segmentItemActive: { backgroundColor: theme.colors.surface, ...theme.shadows.card },
    segmentText: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.textMuted },
    segmentTextActive: { color: theme.colors.text },

    list: { gap: theme.spacing[3] },

    activeCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
      padding: theme.spacing[4],
      ...theme.shadows.card,
    },
    activeTop: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
    thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: theme.colors.surface2 },
    activeInfo: { flex: 1, minWidth: 0, gap: 1 },
    activeTitle: { ...theme.typography.bodyL, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    activeSub: { ...theme.typography.caption, color: theme.colors.textMuted },
    activeTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
    activeTime: { ...theme.typography.caption, color: theme.colors.textMuted },
    activeBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing[3],
    },
    showCode: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    codeCta: { ...theme.typography.caption, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.brandPrimary },

    historyCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
      overflow: 'hidden',
    },
  });
