/**
 * C-08 Карточка бокса. useBox(id) → фото (320, с затемнением сверху/снизу) +
 * «лист», который наезжает на фото со скруглением. Шапка листа: лого+имя+рейтинг
 * заведения и скидка/статус справа. Дальше — заголовок, описание, блок выгоды
 * (цена + ценность), список инфо-строк (окно+остаток, адрес+2GIS, что внутри),
 * доверие (TrustBlock, R4). Закреплённый низ — цена + CTA «Забронировать».
 * Состояния: available / sold_out|closed (CTA выключен) / closing-soon (warning) +
 * Loading / Error / not-found. Хедера нет — «назад»/«избранное» плавающими кнопками.
 */
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Package,
  Star,
} from 'lucide-react-native';
import type { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { initials } from '@/components/domain/_shared';
import { TrustBlock } from '@/components/domain/TrustBlock';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { Skeleton } from '@/components/states/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Discount } from '@/components/ui/Discount';
import { useBox, useToggleFavorite } from '@/data';
import { BOX_STATUS_VARIANT, type Box } from '@/domain';
import { formatDistance, formatMoney, formatWindow, open2gis, pluralRu } from '@/lib';
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
        <FloatingNav theme={theme} top={insets.top + theme.spacing[2]} onBack={() => router.back()} />
        <View style={styles.center}>
          <ErrorState onRetry={() => refetch()} />
        </View>
      </View>
    );
  }

  if (!box) {
    return (
      <View style={styles.root}>
        <FloatingNav theme={theme} top={insets.top + theme.spacing[2]} onBack={() => router.back()} />
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
    <RoundIconButton
      theme={theme}
      onPress={() => toggleFav.mutate(box.id)}
      accessibilityState={{ selected: fav }}
    >
      <Heart
        size={22}
        color={fav ? theme.colors.brandAccent : theme.colors.text}
        fill={fav ? theme.colors.brandAccent : 'transparent'}
      />
    </RoundIconButton>
  );

  return (
    <View style={styles.root}>
      <FloatingNav
        theme={theme}
        top={insets.top + theme.spacing[2]}
        onBack={() => router.back()}
        right={favNode}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.photo}>
          <Image
            source={{ uri: box.photo }}
            style={[StyleSheet.absoluteFill, isSold && styles.photoSold]}
            contentFit="cover"
            transition={200}
          />
        </View>

        <View style={[styles.sheet, { paddingBottom: theme.spacing[10] }]}>
          {/* Заведение + скидка/статус */}
          <View style={styles.headRow}>
            <View style={styles.merchant}>
              <View style={styles.ava}>
                <Text style={styles.avaText}>{initials(box.merchant.name)}</Text>
              </View>
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName} numberOfLines={1}>
                  {box.merchant.name}
                </Text>
              </View>
            </View>
            {box.status === 'published' ? (
              <Discount value={box.discountPct} size="lg" />
            ) : (
              <Badge variant={BOX_STATUS_VARIANT[box.status]} label={t(`common:status.box.${box.status}`)} />
            )}
          </View>

          <Text style={styles.title}>{box.title}</Text>
          <Text style={styles.description}>{box.description}</Text>

          {isClosing ? (
            <View style={styles.warn}>
              <AlertTriangle size={16} color={theme.colors.warning} />
              <Text style={styles.warnText}>{t('closingSoon')}</Text>
            </View>
          ) : null}

          {/* Блок выгоды: цена слева, остаток справа */}
          <View style={styles.benefit}>
            <View style={styles.benefitMain}>
              <Text style={styles.benefitLabel}>{t('benefit.priceLabel')}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatMoney(box.price)}</Text>
                <Text style={styles.old}>{formatMoney(box.value)}</Text>
              </View>
            </View>
            <View style={styles.benefitValue}>
              <Text style={styles.benefitLabel}>{t('stock.title')}</Text>
              <Text style={[styles.benefitValueText, isClosing && { color: theme.colors.warning }]}>
                {t('stock.count', { count: box.stockLeft })}
              </Text>
            </View>
          </View>

          {/* Отзывы заведения: рейтинг слева + переход */}
          <Pressable
            onPress={() => {
              /* TODO: экран отзывов заведения появится позже */
            }}
            style={({ pressed }) => [styles.reviews, pressed && styles.reviewsPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('reviews.cta')}
          >
            <View style={styles.reviewsLeft}>
              <Star size={16} color={theme.colors.warning} fill={theme.colors.warning} />
              <Text style={styles.reviewsScore}>{box.merchant.rating.toFixed(1)}</Text>
              <Text style={styles.reviewsCount}>
                {t(`ratingCount_${pluralRu(box.merchant.ratingCount)}`, {
                  count: box.merchant.ratingCount,
                })}
              </Text>
            </View>
            <View style={styles.reviewsCta}>
              <Text style={styles.reviewsCtaText}>{t('reviews.cta')}</Text>
              <ChevronRight size={18} color={theme.colors.brandPrimary} />
            </View>
          </Pressable>

          {/* Инфо-строки: категория → окно → адрес */}
          <View style={styles.infoList}>
            <InfoLine
              theme={theme}
              Icon={Package}
              a={`${t('category.label')}: ${t(`category.${box.merchant.category}`)}`}
              b={box.category}
            />
            <InfoLine
              theme={theme}
              Icon={Clock}
              a={t('window.title')}
              b={formatWindow(box.pickupWindow)}
            />
            <InfoLine
              theme={theme}
              Icon={MapPin}
              a={box.merchant.address}
              b={formatDistance(box.merchant.distanceM)}
              last
              right={
                <Pressable
                  onPress={() => open2gis(box.merchant.geo)}
                  style={({ pressed }) => [styles.gisBtn, pressed && styles.gisBtnPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={t('common:actions.open2gis')}
                >
                  <Text style={styles.gisText}>{t('common:actions.gis')}</Text>
                </Pressable>
              }
            />
          </View>

          <TrustBlock title={t('trust.title')} text={t('trust.text')} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing[3] }]}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerValue}>{formatMoney(box.price)}</Text>
          <Text style={styles.footerValueStruck}>{formatMoney(box.value)}</Text>
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

/**
 * Плавающая навигация поверх фото (без шапки): «назад» слева, произвольный слот
 * справа (избранное). Сами кнопки — круглые с обводкой, как в шапке Главной.
 */
function FloatingNav({
  theme,
  top,
  onBack,
  right,
}: {
  theme: Theme;
  top: number;
  onBack: () => void;
  right?: ReactNode;
}) {
  const styles = useStyles(theme);
  const { t } = useTranslation('common');
  return (
    <View style={[styles.floatNav, { top }]} pointerEvents="box-none">
      <RoundIconButton theme={theme} onPress={onBack} accessibilityLabel={t('actions.back')}>
        <ChevronLeft size={24} color={theme.colors.text} />
      </RoundIconButton>
      {right}
    </View>
  );
}

/** Круглая иконка-кнопка с обводкой и тенью (порт `.iconbtn-round` из шапки Главной). */
function RoundIconButton({
  theme,
  children,
  onPress,
  accessibilityLabel,
  accessibilityState,
}: {
  theme: Theme;
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityState?: { selected?: boolean };
}) {
  const styles = useStyles(theme);
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      style={({ pressed }) => [styles.roundBtn, pressed && styles.roundBtnPressed]}
    >
      {children}
    </Pressable>
  );
}

/** Инфо-строка листа (порт `.infoline`): иконка + две строки текста + опц. слот справа. */
function InfoLine({
  theme,
  Icon,
  a,
  b,
  bWarn,
  right,
  last,
}: {
  theme: Theme;
  Icon: ComponentType<{ size?: number; color?: string }>;
  a: string;
  b: string;
  bWarn?: boolean;
  right?: ReactNode;
  last?: boolean;
}) {
  const styles = useStyles(theme);
  return (
    <View style={[styles.infoLine, last && styles.infoLineLast]}>
      <View style={styles.infoIc}>
        <Icon size={22} color={theme.colors.brandPrimary} />
      </View>
      <View style={styles.infoTx}>
        <Text style={styles.infoA} numberOfLines={1}>
          {a}
        </Text>
        <Text style={[styles.infoB, bWarn && { color: theme.colors.warning }]} numberOfLines={1}>
          {b}
        </Text>
      </View>
      {right}
    </View>
  );
}

function LoadingView({ theme }: { theme: Theme }) {
  const styles = useStyles(theme);
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <FloatingNav theme={theme} top={insets.top + theme.spacing[2]} onBack={() => router.back()} />
      <Skeleton width="100%" height={320} radius={0} />
      <View style={[styles.sheet, { gap: theme.spacing[3] }]}>
        <Skeleton width="60%" height={20} />
        <Skeleton width="70%" height={28} style={{ marginTop: theme.spacing[2] }} />
        <Skeleton width="50%" height={16} />
        <Skeleton width="100%" height={72} radius={theme.radii.card} style={{ marginTop: theme.spacing[3] }} />
      </View>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    floatNav: {
      position: 'absolute',
      left: theme.screenPad,
      right: theme.screenPad,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    center: { flex: 1, justifyContent: 'center' },
    scroll: { flex: 1 },

    photo: { width: '100%', height: 320, backgroundColor: theme.colors.surface2 },
    photoSold: { opacity: 0.55 },

    // Лист, наезжающий на фото со скруглением (порт `.box-sheet`).
    sheet: {
      marginTop: -26,
      backgroundColor: theme.colors.bg,
      borderTopLeftRadius: theme.radii.sheet,
      borderTopRightRadius: theme.radii.sheet,
      paddingHorizontal: theme.screenPad,
      paddingTop: theme.spacing[5],
    },

    headRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing[3],
    },
    merchant: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
    ava: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.colors.brandPrimary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avaText: {
      ...theme.typography.bodyL,
      fontFamily: theme.typography.h1.fontFamily,
      color: theme.colors.textInverse,
    },
    merchantInfo: { flexShrink: 1, gap: 2 },
    merchantName: {
      ...theme.typography.bodyL,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.text,
    },

    title: { ...theme.typography.h1, color: theme.colors.text, marginTop: theme.spacing[4] },
    description: { ...theme.typography.body, color: theme.colors.textMuted, marginTop: 4 },

    warn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      borderRadius: theme.radii.sm,
      backgroundColor: theme.colors.warningBg,
      marginTop: theme.spacing[3],
    },
    warnText: { ...theme.typography.caption, color: theme.colors.warning, flexShrink: 1 },

    benefit: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      padding: theme.spacing[4],
      borderRadius: theme.radii.card,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: theme.spacing[4],
    },
    benefitMain: { gap: theme.spacing[1], flexShrink: 1 },
    benefitLabel: { ...theme.typography.caption, color: theme.colors.textMuted },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing[2] },
    price: { ...theme.typography.display, color: theme.colors.text },
    old: { ...theme.typography.body, color: theme.colors.textFaint, textDecorationLine: 'line-through' },
    benefitValue: { marginLeft: 'auto', alignItems: 'flex-end', gap: theme.spacing[1] },
    benefitValueText: {
      ...theme.typography.body,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.text,
    },

    reviews: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
      height: 52,
      borderRadius: theme.radii.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      marginTop: theme.spacing[3],
    },
    reviewsPressed: { backgroundColor: theme.colors.surface2 },
    reviewsLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], flexShrink: 1 },
    reviewsScore: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    reviewsCount: { ...theme.typography.caption, color: theme.colors.textMuted },
    reviewsCta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    reviewsCtaText: {
      ...theme.typography.caption,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.brandPrimary,
    },

    infoList: { marginTop: theme.spacing[2] },
    infoLine: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      paddingVertical: theme.spacing[3],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    infoLineLast: { borderBottomWidth: 0 },
    infoIc: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoTx: { flex: 1, minWidth: 0 },
    infoA: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    infoB: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: 1 },
    gisBtn: {
      height: 36,
      paddingHorizontal: theme.spacing[3],
      borderRadius: theme.radii.btn,
      borderWidth: 1.5,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gisBtnPressed: { backgroundColor: theme.colors.surface2 },
    gisText: { ...theme.typography.caption, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },

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
    footerValue: { ...theme.typography.h1, color: theme.colors.text },
    footerValueStruck: {
      ...theme.typography.body,
      color: theme.colors.textFaint,
      textDecorationLine: 'line-through',
    },
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
    roundBtnPressed: { backgroundColor: theme.colors.surface2 },
    cta: { flex: 1 },
  });
