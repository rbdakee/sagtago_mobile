/**
 * C-09 Бронь — количество + итог (BP-05, R1/R2/R3).
 * Степпер ≤ остаток; сводка через calcOrderSummary (сбор 3% раскрыт явно — R1);
 * честные напоминания правил (окно / нет отмены R3 / нет возврата R2).
 * CTA «Перейти к оплате» → /payment/[orderId].
 *
 * Заказ ещё НЕ создаётся (R1: бронь только после оплаты). На экран оплаты
 * передаём boxId + qty; segment [orderId] до оплаты несёт id бокса.
 */
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Ban, Clock, Wallet } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { Skeleton } from '@/components/states/Skeleton';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Stepper } from '@/components/ui/Stepper';
import { GlassNavBar } from '@/components/glass/GlassNavBar';
import { useBox } from '@/data';
import { calcOrderSummary } from '@/domain';
import { formatMoney, formatWindow } from '@/lib';
import { useTheme, useThemedStyles, type Theme } from '@/theme';

export default function BookingScreen() {
  const { boxId } = useLocalSearchParams<{ boxId: string }>();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('booking');

  const { data: box, isLoading, isError, refetch } = useBox(boxId ?? '');
  const [qty, setQty] = useState(1);

  const topPad = insets.top + theme.layout.navbarH + theme.spacing[4];

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={[styles.content, { paddingTop: topPad }]}>
          <Skeleton height={84} radius={theme.radii.card} />
          <Skeleton height={140} radius={theme.radii.card} style={{ marginTop: theme.spacing[4] }} />
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
    if (!box) {
      return (
        <View style={[styles.stateWrap, { paddingTop: topPad }]}>
          <EmptyState emoji="🥡" title={t('notFoundTitle')} text={t('notFoundText')} />
        </View>
      );
    }

    const summary = calcOrderSummary(box.price, qty);
    const maxQty = Math.max(1, box.stockLeft);

    return (
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad, paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Шапка бокса */}
        <View style={styles.boxCard}>
          <Image source={{ uri: box.photo }} style={styles.thumb} contentFit="cover" transition={150} />
          <View style={styles.boxInfo}>
            <Text style={styles.boxTitle} numberOfLines={2}>
              {box.title}
            </Text>
            <Text style={styles.boxSub} numberOfLines={1}>
              {box.merchant.name}
            </Text>
            <View style={styles.windowRow}>
              <Clock size={14} color={theme.colors.textMuted} />
              <Text style={styles.windowText}>{formatWindow(box.pickupWindow)}</Text>
            </View>
          </View>
        </View>

        {/* Количество */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t('quantity')}</Text>
            <Text style={styles.stockText}>
              {t('common:units.left', { count: box.stockLeft })}
            </Text>
          </View>
          <Stepper value={qty} onChange={setQty} min={1} max={maxQty} />
        </View>

        {/* Сводка суммы (сбор 3% отдельной строкой — R1) */}
        <View style={styles.summary}>
          <Text style={styles.sectionTitle}>{t('summaryTitle')}</Text>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>{t('priceRow', { count: qty })}</Text>
            <Text style={styles.sumValue}>{formatMoney(summary.base)}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>{t('serviceFee')}</Text>
            <Text style={styles.sumValue}>{formatMoney(summary.serviceFee)}</Text>
          </View>
          <Divider style={{ marginVertical: theme.spacing[3] }} />
          <View style={styles.sumRow}>
            <Text style={styles.totalLabel}>{t('total')}</Text>
            <Text style={styles.totalValue}>{formatMoney(summary.total)}</Text>
          </View>
        </View>

        {/* Правила (честно и коротко) */}
        <View style={styles.rules}>
          <Text style={styles.sectionTitle}>{t('rulesTitle')}</Text>
          <RuleRow
            icon={(p) => <Clock {...p} />}
            text={t('ruleWindow', { window: formatWindow(box.pickupWindow) })}
            styles={styles}
            color={theme.colors.textMuted}
          />
          <RuleRow
            icon={(p) => <Ban {...p} />}
            text={t('ruleNoCancel')}
            styles={styles}
            color={theme.colors.textMuted}
          />
          <RuleRow
            icon={(p) => <Wallet {...p} />}
            text={t('ruleNoRefund')}
            styles={styles}
            color={theme.colors.textMuted}
          />
        </View>
      </ScrollView>
    );
  };

  const summaryReady = !!box;
  const total = box ? calcOrderSummary(box.price, qty).total : 0;

  return (
    <View style={styles.root}>
      {renderBody()}

      <View style={styles.navWrap}>
        <GlassNavBar title={t('title')} onBack={() => router.back()} />
      </View>

      {summaryReady ? (
        <View style={[styles.cta, { paddingBottom: insets.bottom + theme.spacing[3] }]}>
          <Button
            label={t('cta')}
            fullWidth
            icon={(p) => <ArrowRight {...p} />}
            onPress={() =>
              router.push({
                pathname: '/payment/[orderId]',
                params: { orderId: box!.id, qty: String(qty) },
              })
            }
            accessibilityLabel={`${t('cta')} · ${formatMoney(total)}`}
          />
        </View>
      ) : null}
    </View>
  );
}

function RuleRow({
  icon,
  text,
  styles,
  color,
}: {
  icon: (p: { size: number; color: string }) => ReactNode;
  text: string;
  styles: ReturnType<typeof makeStyles>;
  color: string;
}) {
  return (
    <View style={styles.ruleRow}>
      <View style={styles.ruleIcon}>{icon({ size: 18, color })}</View>
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    navWrap: { position: 'absolute', top: 0, left: 0, right: 0 },
    content: { paddingHorizontal: theme.screenPad, gap: theme.spacing[4] },
    stateWrap: { flex: 1, paddingHorizontal: theme.screenPad, justifyContent: 'center' },

    boxCard: {
      flexDirection: 'row',
      gap: theme.spacing[3],
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
      padding: theme.spacing[3],
      ...theme.shadows.card,
    },
    thumb: {
      width: 72,
      height: 72,
      borderRadius: theme.radii.input,
      backgroundColor: theme.colors.surface2,
    },
    boxInfo: { flex: 1, minWidth: 0, gap: 2 },
    boxTitle: { ...theme.typography.bodyL, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    boxSub: { ...theme.typography.caption, color: theme.colors.textMuted },
    windowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: theme.spacing[1] },
    windowText: { ...theme.typography.caption, color: theme.colors.textMuted },

    section: { gap: theme.spacing[3] },
    sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { ...theme.typography.h2, color: theme.colors.text },
    stockText: { ...theme.typography.caption, color: theme.colors.textMuted },

    summary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
      padding: theme.spacing[4],
      gap: theme.spacing[2],
      ...theme.shadows.card,
    },
    sumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sumLabel: { ...theme.typography.body, color: theme.colors.textMuted },
    sumValue: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    totalLabel: { ...theme.typography.bodyL, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    totalValue: { ...theme.typography.h1, color: theme.colors.text },

    rules: {
      gap: theme.spacing[3],
      backgroundColor: theme.colors.surface2,
      borderRadius: theme.radii.card,
      padding: theme.spacing[4],
    },
    ruleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
    ruleIcon: { width: 22, alignItems: 'center' },
    ruleText: { ...theme.typography.body, color: theme.colors.textMuted, flex: 1 },

    cta: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: theme.screenPad,
      paddingTop: theme.spacing[3],
      backgroundColor: theme.colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
  });
