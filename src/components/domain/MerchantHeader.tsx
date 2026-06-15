/**
 * MerchantHeader — шапка заведения: лого/инициалы + имя + рейтинг + адрес +
 * дистанция + кнопка «Открыть в 2GIS» (`open2gis` из `@/lib`). Используется на
 * карточке бокса (C-08). Кнопка — локальный secondary-стиль (`.btn-secondary`);
 * при желании владелец заменит на W1-A `Button`.
 */
import { MapPin, Navigation } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Merchant } from '@/domain';
import { formatDistance, open2gis } from '@/lib';
import { useTheme, type Theme } from '@/theme';

import { initials, RatingInline } from './_shared';

export type MerchantHeaderProps = {
  merchant: Merchant;
};

export function MerchantHeader({ merchant }: MerchantHeaderProps) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation('common');

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.ava}>
          <Text style={styles.avaText}>{initials(merchant.name)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {merchant.name}
          </Text>
          <View style={styles.metaRow}>
            <RatingInline rating={merchant.rating} count={merchant.ratingCount} />
            <View style={styles.dot} />
            <View style={styles.addr}>
              <MapPin size={13} color={theme.colors.textFaint} />
              <Text style={styles.addrText} numberOfLines={1}>
                {merchant.address}
              </Text>
            </View>
          </View>
          <Text style={styles.distance}>{formatDistance(merchant.distanceM)}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => open2gis(merchant.geo)}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        accessibilityRole="button"
      >
        <Navigation size={18} color={theme.colors.text} />
        <Text style={styles.btnText}>{t('actions.open2gis')}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: { gap: theme.spacing[3] },
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
    ava: {
      width: 48,
      height: 48,
      borderRadius: theme.radii.input,
      backgroundColor: theme.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avaText: {
      ...theme.typography.bodyL,
      fontFamily: theme.typography.h1.fontFamily,
      color: theme.colors.brandPrimary,
    },
    info: { flex: 1, minWidth: 0, gap: 2 },
    name: {
      ...theme.typography.h2,
      color: theme.colors.text,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
    dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: theme.colors.borderStrong },
    addr: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
    addrText: { ...theme.typography.caption, color: theme.colors.textMuted, flexShrink: 1 },
    distance: { ...theme.typography.caption, color: theme.colors.textFaint },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[2],
      height: 44,
      borderRadius: theme.radii.btn,
      borderWidth: 1.5,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
    },
    btnPressed: { backgroundColor: theme.colors.surface2 },
    btnText: {
      ...theme.typography.body,
      fontFamily: theme.typography.h2.fontFamily,
      color: theme.colors.text,
    },
  });
