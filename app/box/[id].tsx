/**
 * C-08 Карточка бокса. useBox(id) → фото, заведение (MerchantHeader), блок выгоды
 * (цена крупно, зачёркнутая ценность, скидка), что внутри, окно, остаток, доверие
 * (TrustBlock, R4). Закреплённый низ — CTA «Забронировать» → /booking/[boxId].
 * Состояния: available / sold_out|closed (CTA выключен) / closing-soon (warning) +
 * Loading / Error / not-found.
 */
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, Boxes, Clock, Heart, Package } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassNavBar } from '@/components/glass/GlassNavBar';
import { MerchantHeader } from '@/components/domain/MerchantHeader';
import { TrustBlock } from '@/components/domain/TrustBlock';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { Skeleton } from '@/components/states/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Discount } from '@/components/ui/Discount';
import { useBox, useToggleFavorite } from '@/data';
import { BOX_STATUS_VARIANT, type Box } from '@/domain';
import { formatMoney, formatWindow } from '@/lib';
import { useTheme, type Theme } from '@/theme';

type Urgency = 'available' | 'closing' | 'sold';

function urgencyOf(box: Box): Urgency {
  if (box.status !== 'published') return 'sold';
  if (box.stockLeft > 0 && box.stockLeft <= 2) return 'closing';
  return 'available';
}

export default function BoxDetail() {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation('box');
  const insets = useSafeAreaInsets();
  const { id = '' } = useLocalSearchParams<{ id: string }>();

  const { data: box, isLoading, isError, refetch } = useBox(id);
  const toggleFav = useToggleFavorite();

  if (isLoading) return <LoadingView theme={theme} />;

  if (isError) {
    return (
      <View style={styles.root}>
        <GlassNavBar onBack={() => router.back()} />
        <View style={styles.center}>
          <ErrorState onRetry={() => refetch()} />
        </View>
      </View>
    );
  }

  if (!box) {
    return (
      <View style={styles.root}>
        <GlassNavBar onBack={() => router.back()} />
        <View style={styles.center}>
          <EmptyState
            emoji="🔍"
            title={t('notFound.title')}
            text={t('notFound.text')}
            ctaLabel={t('common:actions.back')}
            onCtaPress={() => router.back()}
          />
        </View>
      </View>
    );
  }

  const urgency = urgencyOf(box);
  const isSold = urgency === 'sold';
  const isClosing = urgency === 'closing';
  const fav = box.isFavorite ?? false;

  const ctaLabel =
    box.status === 'closed'
      ? t('cta.closed')
      : box.status === 'sold_out'
        ? t('cta.soldOut')
        : t('cta.book');

  const favNode = (
    <Pressable
      hitSlop={8}
      onPress={() => toggleFav.mutate(box.id)}
      accessibilityRole="button"
      accessibilityState={{ selected: fav }}
      style={styles.favBtn}
    >
      <Heart
        size={22}
        color={fav ? theme.colors.brandAccent : theme.colors.text}
        fill={fav ? theme.colors.brandAccent : 'transparent'}
      />
    </Pressable>
  );

  return (
    <View style={styles.root}>
      <View style={styles.navWrap}>
        <GlassNavBar onBack={() => router.back()} right={favNode} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: theme.spacing[12] }]}
      >
        <View style={styles.photo}>
          <Image
            source={{ uri: box.photo }}
            style={[StyleSheet.absoluteFill, isSold && styles.photoSold]}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.discount}>
            <Discount value={box.discountPct} size="lg" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{box.title}</Text>
            {box.status !== 'published' ? (
              <Badge variant={BOX_STATUS_VARIANT[box.status]} label={t(`common:status.box.${box.status}`)} />
            ) : null}
          </View>

          {isClosing ? (
            <View style={styles.warn}>
              <AlertTriangle size={16} color={theme.colors.warning} />
              <Text style={styles.warnText}>{t('closingSoon')}</Text>
            </View>
          ) : null}

          <MerchantHeader merchant={box.merchant} />

          <View style={styles.divider} />

          {/* Блок выгоды */}
          <View style={styles.benefit}>
            <View style={styles.benefitMain}>
              <Text style={styles.benefitLabel}>{t('benefit.youPay')}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatMoney(box.price)}</Text>
                <Text style={styles.value}>{formatMoney(box.value)}</Text>
              </View>
            </View>
            <Discount value={box.discountPct} size="lg" />
          </View>

          {/* Что внутри */}
          <InfoRow theme={theme} Icon={Package} label={t('surprise.title')} value={box.category} />
          {/* Окно выдачи */}
          <InfoRow
            theme={theme}
            Icon={Clock}
            label={t('window.title')}
            value={formatWindow(box.pickupWindow)}
          />
          {/* Остаток */}
          <InfoRow
            theme={theme}
            Icon={Boxes}
            label={t('stock.title')}
            value={t('stock.count', { count: box.stockLeft })}
            valueWarn={isClosing}
          />

          <Text style={styles.description}>{box.description}</Text>

          <TrustBlock title={t('trust.title')} text={t('trust.text')} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing[3] }]}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerLabel}>{t('benefit.youPay')}</Text>
          <Text style={styles.footerValue}>{formatMoney(box.price)}</Text>
        </View>
        <Button
          label={ctaLabel}
          onPress={() => router.push(`/booking/${box.id}`)}
          disabled={isSold}
          style={styles.cta}
        />
      </View>
    </View>
  );
}

function InfoRow({
  theme,
  Icon,
  label,
  value,
  valueWarn,
}: {
  theme: Theme;
  Icon: ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  valueWarn?: boolean;
}) {
  const styles = useStyles(theme);
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Icon size={18} color={theme.colors.textMuted} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueWarn && { color: theme.colors.warning }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function LoadingView({ theme }: { theme: Theme }) {
  const styles = useStyles(theme);
  return (
    <View style={styles.root}>
      <View style={styles.navWrap}>
        <GlassNavBar onBack={() => router.back()} />
      </View>
      <View style={styles.content}>
        <Skeleton width="100%" height={undefined} radius={0} style={styles.photoSkeleton} />
        <View style={[styles.section, { gap: theme.spacing[3] }]}>
          <Skeleton width="70%" height={24} />
          <Skeleton width="50%" height={16} />
          <Skeleton width="40%" height={28} style={{ marginTop: theme.spacing[2] }} />
          <Skeleton width="100%" height={64} radius={theme.radii.card} style={{ marginTop: theme.spacing[3] }} />
        </View>
      </View>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    navWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    center: { flex: 1, justifyContent: 'center' },
    scroll: { flex: 1 },
    content: { backgroundColor: theme.colors.bg },
    photo: { width: '100%', aspectRatio: 4 / 3, backgroundColor: theme.colors.surface2 },
    photoSkeleton: { width: '100%', aspectRatio: 4 / 3 },
    photoSold: { opacity: 0.55 },
    discount: { position: 'absolute', left: theme.screenPad, bottom: theme.spacing[3] },
    section: { paddingHorizontal: theme.screenPad, paddingTop: theme.spacing[4], gap: theme.spacing[3] },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing[3],
    },
    title: { ...theme.typography.h1, color: theme.colors.text, flexShrink: 1 },
    warn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      borderRadius: theme.radii.sm,
      backgroundColor: theme.colors.warningBg,
    },
    warnText: { ...theme.typography.caption, color: theme.colors.warning, flexShrink: 1 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border, marginVertical: theme.spacing[1] },
    benefit: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing[4],
      borderRadius: theme.radii.card,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    benefitMain: { gap: theme.spacing[1], flexShrink: 1 },
    benefitLabel: { ...theme.typography.caption, color: theme.colors.textMuted },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing[2] },
    price: { ...theme.typography.display, color: theme.colors.text },
    value: { ...theme.typography.body, color: theme.colors.textFaint, textDecorationLine: 'line-through' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
    infoIcon: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.sm,
      backgroundColor: theme.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoLabel: { ...theme.typography.body, color: theme.colors.textMuted, flex: 1 },
    infoValue: {
      ...theme.typography.body,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.text,
      flexShrink: 1,
    },
    description: { ...theme.typography.body, color: theme.colors.textMuted },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[4],
      paddingHorizontal: theme.screenPad,
      paddingTop: theme.spacing[3],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    footerPrice: { gap: 2 },
    footerLabel: { ...theme.typography.caption, color: theme.colors.textMuted },
    footerValue: { ...theme.typography.h2, color: theme.colors.text },
    favBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    cta: { flex: 1 },
  });
