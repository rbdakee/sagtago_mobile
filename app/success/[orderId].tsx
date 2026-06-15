/**
 * C-11 Успех брони (BP-05). Крупная галочка, «Бронь подтверждена», кратко:
 * заведение / окно / код. CTA «Показать код» → /order/[id].
 * Входим сюда через router.replace (назад на оплату нельзя) — навбар без «назад».
 */
import { router, useLocalSearchParams } from 'expo-router';
import { Check, QrCode } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { Button } from '@/components/ui/Button';
import { GlassNavBar } from '@/components/glass/GlassNavBar';
import { useOrder } from '@/data';
import { formatWindow } from '@/lib';
import { useTheme, useThemedStyles, type Theme } from '@/theme';

export default function SuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('booking');

  const { data: order, isLoading, isError, refetch } = useOrder(orderId ?? '');
  const topPad = insets.top + theme.layout.navbarH + theme.spacing[4];

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={[styles.center, { paddingTop: topPad }]}>
          <ActivityIndicator color={theme.colors.brandPrimary} />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={[styles.center, { paddingTop: topPad }]}>
          <ErrorState onRetry={refetch} />
        </View>
      );
    }
    if (!order) {
      return (
        <View style={[styles.center, { paddingTop: topPad }]}>
          <EmptyState emoji="🎟️" title={t('notFoundTitle')} text={t('notFoundText')} />
        </View>
      );
    }

    return (
      <View style={[styles.center, { paddingTop: topPad }]}>
        <View style={styles.badge}>
          <Check size={44} color={theme.colors.success} strokeWidth={3} />
        </View>
        <Text style={styles.heading}>{t('success.heading')}</Text>
        <Text style={styles.subtitle}>{t('success.subtitle')}</Text>

        <View style={styles.card}>
          <Row label={t('success.merchant')} value={order.merchant.name} styles={styles} />
          <Row label={t('success.window')} value={formatWindow(order.pickupWindow)} styles={styles} />
          <View style={styles.codeRow}>
            <Text style={styles.rowLabel}>{t('success.code')}</Text>
            <Text style={styles.codeValue}>{order.pickupCode}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {renderBody()}

      <View style={styles.navWrap}>
        <GlassNavBar title={t('success.title')} />
      </View>

      {order ? (
        <View style={[styles.cta, { paddingBottom: insets.bottom + theme.spacing[3] }]}>
          <Button
            label={t('success.cta')}
            fullWidth
            icon={(p) => <QrCode {...p} />}
            onPress={() =>
              router.replace({ pathname: '/order/[id]', params: { id: order.id } })
            }
          />
        </View>
      ) : null}
    </View>
  );
}

function Row({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    navWrap: { position: 'absolute', top: 0, left: 0, right: 0 },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.screenPad,
      gap: theme.spacing[2],
    },
    badge: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.colors.successBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[4],
    },
    heading: { ...theme.typography.h1, color: theme.colors.text, textAlign: 'center' },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textMuted,
      textAlign: 'center',
      maxWidth: 300,
    },
    card: {
      alignSelf: 'stretch',
      marginTop: theme.spacing[6],
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
      padding: theme.spacing[4],
      gap: theme.spacing[3],
      ...theme.shadows.card,
    },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing[4] },
    rowLabel: { ...theme.typography.body, color: theme.colors.textMuted },
    rowValue: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text, flexShrink: 1 },
    codeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing[3],
    },
    codeValue: {
      ...theme.typography.code,
      fontSize: 22,
      letterSpacing: 3,
      color: theme.colors.brandPrimary,
    },
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
