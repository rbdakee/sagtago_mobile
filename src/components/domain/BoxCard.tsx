/**
 * BoxCard — главная карточка бокса (порт `.boxcard` из components.css).
 * Фото 4:3 + нижний градиент; тег скидки слева сверху; сердце-избранное справа;
 * оверлей заведения снизу фото; тело: title, мета (рейтинг ⭐ + дистанция + остаток),
 * ценоряд (цена + зачёркнутая ценность + окно).
 *
 * Состояния: `available` / `sold_out|closed` (затемнение + плашка) /
 * `closing-soon` (мало осталось → акценты в warning).
 *
 * Зависимость W1-A: тег скидки берётся из `@/components/ui/Discount`, когда трек
 * W1-A готов. Пока его нет — рисуем локальный `DiscountTag` (визуально идентичен
 * `.discount`); swap в одну строку при интеграции.
 */
import { Image } from 'expo-image';
import { Clock, Heart, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { Box } from '@/domain';
import { formatDistance, formatMoney, formatWindow } from '@/lib';
import { useTheme, type Theme } from '@/theme';

import { initials, RatingInline } from './_shared';

// Оверлеи ПОВЕРХ ФОТО — намеренно тема-независимы (как в components.css:
// `.grad` rgba(0,0,0,.45), `.merchant .nm` #fff, `.sold-ov` rgba(16,35,26,.32)).
// Это не темизируемые поверхности, а контраст над произвольной фотографией.
const SCRIM_DARK = '#000000';
const SOLD_OVERLAY = 'rgba(16, 35, 26, 0.32)';

type Urgency = 'available' | 'closing' | 'sold';

function urgencyOf(box: Box): Urgency {
  if (box.status !== 'published') return 'sold';
  if (box.stockLeft > 0 && box.stockLeft <= 2) return 'closing';
  return 'available';
}

export type BoxCardProps = {
  box: Box;
  onPress?: (box: Box) => void;
  onToggleFavorite?: (box: Box) => void;
};

export function BoxCard({ box, onPress, onToggleFavorite }: BoxCardProps) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation('common');

  const urgency = urgencyOf(box);
  const isSold = urgency === 'sold';
  const isClosing = urgency === 'closing';
  const fav = box.isFavorite ?? false;

  return (
    <Pressable
      onPress={() => onPress?.(box)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={styles.photo}>
        <Image
          source={{ uri: box.photo }}
          style={[StyleSheet.absoluteFill, isSold && styles.photoSold]}
          contentFit="cover"
          transition={200}
        />
        {/* нижний градиент для читаемости названия заведения */}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id="boxcard-scrim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.45" stopColor={SCRIM_DARK} stopOpacity={0} />
              <Stop offset="1" stopColor={SCRIM_DARK} stopOpacity={0.45} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#boxcard-scrim)" />
        </Svg>

        <View style={styles.discWrap}>
          <DiscountTag value={box.discountPct} />
        </View>

        {onToggleFavorite && (
          <Pressable
            onPress={() => onToggleFavorite(box)}
            hitSlop={8}
            style={styles.fav}
            accessibilityRole="button"
            accessibilityState={{ selected: fav }}
          >
            <Heart
              size={20}
              color={fav ? theme.colors.brandAccent : theme.colors.text}
              fill={fav ? theme.colors.brandAccent : 'transparent'}
            />
          </Pressable>
        )}

        <View style={styles.merchant}>
          <View style={styles.ava}>
            <Text style={styles.avaText}>{initials(box.merchant.name)}</Text>
          </View>
          <Text style={styles.merchantName} numberOfLines={1}>
            {box.merchant.name}
          </Text>
        </View>

        {isSold && (
          <View style={styles.soldOverlay}>
            <View style={styles.soldPill}>
              <Text style={styles.soldPillText}>{t(`status.box.${box.status}`)}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.row1}>
          <Text style={styles.title} numberOfLines={1}>
            {box.title}
          </Text>
          {!isSold && (
            <View style={styles.stock}>
              <Text style={[styles.stockLabel, isClosing && styles.warnText]}>
                {t('units.inStock')}
              </Text>
              <Text style={[styles.stockValue, isClosing && styles.warnText]}>
                {t('units.pcs', { count: box.stockLeft })}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.meta}>
          <RatingInline rating={box.merchant.rating} />
          <View style={styles.dot} />
          <View style={styles.metaItem}>
            <MapPin size={13} color={theme.colors.textFaint} />
            <Text style={styles.metaText}>{formatDistance(box.merchant.distanceM)}</Text>
          </View>
        </View>

        <View style={styles.priceline}>
          <Text style={styles.price}>{formatMoney(box.price)}</Text>
          <Text style={styles.old}>{formatMoney(box.value)}</Text>
          <View style={styles.window}>
            <Clock
              size={13}
              color={isClosing ? theme.colors.warning : theme.colors.textMuted}
            />
            <Text style={[styles.windowText, isClosing && styles.warnText]}>
              {formatWindow(box.pickupWindow)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Локальный тег скидки (порт `.discount`). Временный — заменить на
 * `import { Discount } from '@/components/ui/Discount'` (W1-A) при интеграции.
 */
function DiscountTag({ value }: { value: number }) {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.colors.brandAccent,
        paddingHorizontal: theme.spacing[2],
        paddingVertical: theme.spacing[1],
        borderRadius: theme.radii.sm,
      }}
    >
      <Text
        style={[
          theme.typography.caption,
          {
            color: theme.colors.brandAccentInk,
            fontFamily: theme.typography.h1.fontFamily,
          },
        ]}
      >
        −{value}%
      </Text>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
      overflow: 'hidden',
      ...theme.shadows.card,
    },
    pressed: { opacity: 0.96 },
    photo: { width: '100%', aspectRatio: 4 / 3, backgroundColor: theme.colors.surface2 },
    photoSold: { opacity: 0.55 },
    discWrap: { position: 'absolute', top: theme.spacing[3], left: theme.spacing[3] },
    fav: {
      position: 'absolute',
      top: theme.spacing[2],
      right: theme.spacing[2],
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    merchant: {
      position: 'absolute',
      left: theme.spacing[3],
      right: theme.spacing[3],
      bottom: theme.spacing[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
    },
    ava: {
      width: 32,
      height: 32,
      borderRadius: 9,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avaText: {
      ...theme.typography.caption,
      fontFamily: theme.typography.h1.fontFamily,
      color: theme.colors.brandPrimary,
    },
    merchantName: {
      ...theme.typography.caption,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.textInverse,
      flexShrink: 1,
    },
    soldOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: SOLD_OVERLAY,
    },
    soldPill: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
      borderRadius: theme.radii.pill,
    },
    soldPillText: {
      ...theme.typography.caption,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.text,
    },
    body: { padding: theme.spacing[3] },
    row1: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing[2],
    },
    title: {
      ...theme.typography.bodyL,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.text,
      flexShrink: 1,
    },
    // Остаток по правому краю: «В наличии» сверху, «N шт.» снизу (без обводки).
    stock: { alignItems: 'flex-end' },
    stockLabel: { ...theme.typography.caption, color: theme.colors.textMuted },
    stockValue: {
      ...theme.typography.caption,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.text,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      marginTop: theme.spacing[1],
    },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { ...theme.typography.caption, color: theme.colors.textMuted },
    warnText: { color: theme.colors.warning },
    dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: theme.colors.borderStrong },
    priceline: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: theme.spacing[2],
      marginTop: theme.spacing[2],
    },
    price: {
      ...theme.typography.bodyL,
      fontFamily: theme.typography.h1.fontFamily,
      color: theme.colors.text,
    },
    old: {
      ...theme.typography.caption,
      color: theme.colors.textFaint,
      textDecorationLine: 'line-through',
    },
    window: {
      marginLeft: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    windowText: { ...theme.typography.caption, color: theme.colors.textMuted },
  });
