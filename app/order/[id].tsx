/**
 * C-12 Активный заказ (код/QR) + C-14 Детали заказа (BP-06).
 * useOrder(id) → по статусу:
 *  - paid       → CodeCard + QRCard, заведение, окно, «что внутри», суммы;
 *  - picked_up  → «Выдан» + CTA «Оценить» / «Пожаловаться»;
 *  - expired/refunded/payment_failed → детали + честный статус-блок.
 * Возврата/отмены покупателем нет (R2/R3) — кнопок отмены не рисуем.
 */
import { router, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle2,
  Clock,
  Flag,
  Info,
  MapPin,
  Navigation,
  Star,
  XCircle,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QRCard } from '@/components/domain/QRCard';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { Skeleton } from '@/components/states/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { GlassNavBar } from '@/components/glass/GlassNavBar';
import { useOrder } from '@/data';
import { ORDER_STATUS_VARIANT, type Order } from '@/domain';
import { formatDistance, formatMoney, formatWindow, open2gis } from '@/lib';
import { useTheme, useThemedStyles, type Theme } from '@/theme';

type Tone = 'success' | 'danger' | 'warning' | 'info';

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('orders');
  const { t: tc } = useTranslation('common');

  const { data: order, isLoading, isError, refetch } = useOrder(id ?? '');
  const topPad = insets.top + theme.layout.navbarH + theme.spacing[4];

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={[styles.content, { paddingTop: topPad }]}>
          <Skeleton height={200} radius={theme.radii.card} />
          <Skeleton height={120} radius={theme.radii.card} style={{ marginTop: theme.spacing[4] }} />
          <Skeleton height={120} radius={theme.radii.card} style={{ marginTop: theme.spacing[4] }} />
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
    if (!order) {
      return (
        <View style={[styles.stateWrap, { paddingTop: topPad }]}>
          <EmptyState emoji="🧾" title={t('detail.notFoundTitle')} text={t('detail.notFoundText')} />
        </View>
      );
    }

    const isPaid = order.status === 'paid';
    const isPickedUp = order.status === 'picked_up';

    return (
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad, paddingBottom: insets.bottom + theme.spacing[8] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Заведение + бокс + статус */}
        <View style={styles.card}>
          <View style={styles.headRow}>
            <View style={styles.headBody}>
              <Text style={styles.headName} numberOfLines={1}>
                {order.merchant.name}
              </Text>
              <Text style={styles.headBox} numberOfLines={1}>
                {`${order.box.title} × ${order.qty}`}
              </Text>
            </View>
            <Badge
              variant={ORDER_STATUS_VARIANT[order.status]}
              label={tc(`status.order.${order.status}`)}
              style={styles.headBadge}
            />
          </View>
        </View>

        {isPaid ? (
          <>
            <QRCard order={order} />
            <Text style={styles.counterHint}>{t('detail.showAtCounter')}</Text>
          </>
        ) : (
          <StatusHero status={order.status} t={t} styles={styles} theme={theme} />
        )}

        {/* Окно выдачи + адрес/2GIS — единый блок */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Clock size={18} color={theme.colors.textMuted} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoTitle}>{t('detail.window')}</Text>
              <Text style={styles.infoSub}>{t('detail.today')}</Text>
            </View>
            <Text style={styles.infoValue}>{formatWindow(order.pickupWindow)}</Text>
          </View>

          <Divider />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MapPin size={18} color={theme.colors.textMuted} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoTitle} numberOfLines={1}>
                {order.merchant.address}
              </Text>
              <Text style={styles.infoSub}>{formatDistance(order.merchant.distanceM)}</Text>
            </View>
            <Pressable
              onPress={() => open2gis(order.merchant.geo)}
              style={({ pressed }) => [styles.gisBtn, pressed && styles.gisBtnPressed]}
              accessibilityRole="button"
              accessibilityLabel={tc('actions.open2gis')}
            >
              <Navigation size={16} color={theme.colors.text} />
              <Text style={styles.gisText}>{tc('actions.gis')}</Text>
            </Pressable>
          </View>
        </View>

        {/* Суммы (сбор 3% отдельной строкой) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('detail.summaryTitle')}</Text>
          <SumRow label={t('detail.qty')} value={String(order.qty)} styles={styles} />
          <SumRow label={t('detail.price')} value={formatMoney(order.basePrice)} styles={styles} />
          <SumRow label={t('detail.serviceFee')} value={formatMoney(order.serviceFee)} styles={styles} />
          <Divider style={{ marginVertical: theme.spacing[2] }} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('detail.total')}</Text>
            <Text style={styles.totalValue}>{formatMoney(order.total)}</Text>
          </View>
        </View>

        {/* Действия после выдачи (C-14) */}
        {isPickedUp ? (
          <View style={styles.actions}>
            <Button
              label={t('detail.rate')}
              fullWidth
              icon={(p) => <Star {...p} />}
              onPress={() => router.push({ pathname: '/rating/[orderId]', params: { orderId: order.id } })}
            />
            <Button
              label={t('detail.complain')}
              variant="secondary"
              fullWidth
              icon={(p) => <Flag {...p} />}
              onPress={() => router.push({ pathname: '/complaint/[orderId]', params: { orderId: order.id } })}
            />
          </View>
        ) : null}
      </ScrollView>
    );
  };

  return (
    <View style={styles.root}>
      {renderBody()}
      <View style={styles.navWrap}>
        <GlassNavBar title={t('detail.title')} onBack={() => router.back()} />
      </View>
    </View>
  );
}

const HERO: Record<
  Exclude<Order['status'], 'paid'>,
  { tone: Tone; titleKey: string; textKey: string; icon: (p: { size: number; color: string }) => ReactNode }
> = {
  picked_up: { tone: 'success', titleKey: 'detail.pickedUpTitle', textKey: 'detail.pickedUpText', icon: (p) => <CheckCircle2 {...p} /> },
  expired: { tone: 'danger', titleKey: 'detail.expiredTitle', textKey: 'detail.expiredText', icon: (p) => <XCircle {...p} /> },
  refunded: { tone: 'warning', titleKey: 'detail.refundedTitle', textKey: 'detail.refundedText', icon: (p) => <Info {...p} /> },
  payment_failed: { tone: 'danger', titleKey: 'detail.failedTitle', textKey: 'detail.failedText', icon: (p) => <XCircle {...p} /> },
  created: { tone: 'info', titleKey: 'detail.title', textKey: 'detail.showAtCounter', icon: (p) => <Info {...p} /> },
};

function StatusHero({
  status,
  t,
  styles,
  theme,
}: {
  status: Order['status'];
  t: (k: string) => string;
  styles: ReturnType<typeof makeStyles>;
  theme: Theme;
}) {
  if (status === 'paid') return null;
  const cfg = HERO[status];
  const toneColor: Record<Tone, string> = {
    success: theme.colors.success,
    danger: theme.colors.danger,
    warning: theme.colors.warning,
    info: theme.colors.info,
  };
  const toneBg: Record<Tone, string> = {
    success: theme.colors.successBg,
    danger: theme.colors.dangerBg,
    warning: theme.colors.warningBg,
    info: theme.colors.infoBg,
  };
  const color = toneColor[cfg.tone];
  return (
    <View style={[styles.hero, { backgroundColor: toneBg[cfg.tone] }]}>
      <View style={styles.heroIcon}>{cfg.icon({ size: 40, color })}</View>
      <Text style={[styles.heroTitle, { color }]}>{t(cfg.titleKey)}</Text>
      <Text style={styles.heroText}>{t(cfg.textKey)}</Text>
    </View>
  );
}

function SumRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.sumRow}>
      <Text style={styles.sumLabel}>{label}</Text>
      <Text style={styles.sumValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    navWrap: { position: 'absolute', top: 0, left: 0, right: 0 },
    content: { paddingHorizontal: theme.screenPad, gap: theme.spacing[4] },
    stateWrap: { flex: 1, paddingHorizontal: theme.screenPad, justifyContent: 'center' },

    counterHint: { ...theme.typography.caption, color: theme.colors.textMuted, textAlign: 'center', marginTop: -theme.spacing[2] },

    // Первый блок: заведение + бокс×кол-во + статус справа.
    headRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
    headBody: { flex: 1, minWidth: 0, gap: 2 },
    headName: { ...theme.typography.h2, color: theme.colors.text },
    headBox: { ...theme.typography.body, color: theme.colors.textMuted },
    headBadge: { alignSelf: 'center' },

    hero: { borderRadius: theme.radii.card, padding: theme.spacing[6], alignItems: 'center', gap: theme.spacing[2] },
    heroIcon: { marginBottom: theme.spacing[1] },
    heroTitle: { ...theme.typography.h2, textAlign: 'center' },
    heroText: { ...theme.typography.body, color: theme.colors.textMuted, textAlign: 'center' },

    card: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
      padding: theme.spacing[4],
      gap: theme.spacing[2],
      ...theme.shadows.card,
    },
    cardTitle: { ...theme.typography.h2, color: theme.colors.text },

    // Единый блок «окно выдачи + адрес/2GIS».
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], minHeight: 48 },
    infoIcon: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.sm,
      backgroundColor: theme.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoBody: { flex: 1, minWidth: 0, gap: 2 },
    infoTitle: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    infoSub: { ...theme.typography.caption, color: theme.colors.textMuted },
    infoValue: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    gisBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 36,
      paddingHorizontal: theme.spacing[3],
      borderRadius: theme.radii.btn,
      borderWidth: 1.5,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
    },
    gisBtnPressed: { backgroundColor: theme.colors.surface2 },
    gisText: { ...theme.typography.caption, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },

    sumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sumLabel: { ...theme.typography.body, color: theme.colors.textMuted },
    sumValue: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    totalLabel: { ...theme.typography.bodyL, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    totalValue: { ...theme.typography.h2, color: theme.colors.text },

    actions: { gap: theme.spacing[3] },
  });
