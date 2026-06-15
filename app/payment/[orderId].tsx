/**
 * C-10 Оплата (BP-05, R1). Методы (Kaspi / карта / Apple · Google Pay), stub-
 * процессинг. На «оплатить» создаём заказ useCreateOrder({ box, qty, method })
 * (мок возвращает paid + код) → /success/[orderId]. Ветка fail → тост «оплата
 * не прошла» (бокс не забронирован).
 *
 * До оплаты заказа ещё нет (R1), поэтому segment [orderId] несёт id бокса.
 * Мок-репозиторий всегда возвращает успех — отказ оплаты воспроизводим демо-
 * тумблером (см. отчёт): реальная ветка fail придёт с бэкендом/вебхуком.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { Banknote, Check, CreditCard, Smartphone, Wallet } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { Skeleton } from '@/components/states/Skeleton';
import { Button } from '@/components/ui/Button';
import { Toast, type ToastVariant } from '@/components/ui/Toast';
import { GlassNavBar } from '@/components/glass/GlassNavBar';
import { useBox, useCreateOrder } from '@/data';
import { calcOrderSummary, PAYMENT_METHODS, type PaymentMethod } from '@/domain';
import { formatMoney } from '@/lib';
import { useTheme, useThemedStyles, type Theme } from '@/theme';

const METHOD_ICON: Record<PaymentMethod, (p: { size: number; color: string }) => ReactNode> = {
  kaspi: (p) => <Smartphone {...p} />,
  card: (p) => <CreditCard {...p} />,
  apple_pay: (p) => <Wallet {...p} />,
  google_pay: (p) => <Banknote {...p} />,
};

export default function PaymentScreen() {
  // segment [orderId] до оплаты несёт id бокса (заказа ещё нет — R1).
  const { orderId: boxId, qty } = useLocalSearchParams<{ orderId: string; qty: string }>();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('booking');

  const qtyNum = Math.max(1, parseInt(qty ?? '1', 10) || 1);
  const { data: box, isLoading, isError, refetch } = useBox(boxId ?? '');
  const { mutateAsync, isPending } = useCreateOrder();

  const [method, setMethod] = useState<PaymentMethod>('kaspi');
  const [simulateFail, setSimulateFail] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  const topPad = insets.top + theme.layout.navbarH + theme.spacing[4];

  const onPay = async () => {
    if (!box) return;
    if (simulateFail) {
      // Ветка fail: бокс не забронирован, заказ не создаётся (BP-05).
      setToast({ message: t('payment.failed'), variant: 'danger' });
      return;
    }
    try {
      const order = await mutateAsync({ box, qty: qtyNum, paymentMethod: method });
      router.replace({ pathname: '/success/[orderId]', params: { orderId: order.id } });
    } catch {
      setToast({ message: t('payment.failed'), variant: 'danger' });
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={[styles.content, { paddingTop: topPad }]}>
          <Skeleton height={24} width="50%" />
          <Skeleton height={64} radius={theme.radii.card} style={{ marginTop: theme.spacing[3] }} />
          <Skeleton height={64} radius={theme.radii.card} style={{ marginTop: theme.spacing[2] }} />
          <Skeleton height={64} radius={theme.radii.card} style={{ marginTop: theme.spacing[2] }} />
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

    return (
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad, paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{t('payment.methodsTitle')}</Text>

        <View style={styles.methods}>
          {PAYMENT_METHODS.map((m) => {
            const active = m === method;
            const fg = active ? theme.colors.brandPrimary : theme.colors.textMuted;
            return (
              <Pressable
                key={m}
                onPress={() => setMethod(m)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [
                  styles.method,
                  active && styles.methodActive,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View style={styles.methodIcon}>{METHOD_ICON[m]({ size: 22, color: fg })}</View>
                <Text style={styles.methodLabel}>{t(`payment.methods.${m}`)}</Text>
                <View style={[styles.radio, active && styles.radioOn]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.note}>{t('payment.payNote')}</Text>

        {/* Демо-тумблер ветки отказа оплаты (мок всегда успешен) */}
        <Pressable
          onPress={() => setSimulateFail((v) => !v)}
          accessibilityRole="switch"
          accessibilityState={{ checked: simulateFail }}
          style={styles.simRow}
        >
          <View style={[styles.check, simulateFail && styles.checkOn]}>
            {simulateFail ? <Check size={14} color={theme.colors.brandAccentInk} /> : null}
          </View>
          <Text style={styles.simText}>{t('payment.simulateFail')}</Text>
        </Pressable>
      </ScrollView>
    );
  };

  const total = box ? calcOrderSummary(box.price, qtyNum).total : 0;

  return (
    <View style={styles.root}>
      {renderBody()}

      <View style={styles.navWrap}>
        <GlassNavBar title={t('payment.title')} onBack={() => router.back()} />
      </View>

      {toast ? (
        <View style={[styles.toastWrap, { bottom: insets.bottom + 96 }]} pointerEvents="box-none">
          <Toast
            visible
            message={toast.message}
            variant={toast.variant}
            onHide={() => setToast(null)}
          />
        </View>
      ) : null}

      {box ? (
        <View style={[styles.cta, { paddingBottom: insets.bottom + theme.spacing[3] }]}>
          <Button
            label={t('payment.cta', { total: formatMoney(total) })}
            fullWidth
            loading={isPending}
            onPress={onPay}
          />
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    navWrap: { position: 'absolute', top: 0, left: 0, right: 0 },
    content: { paddingHorizontal: theme.screenPad, gap: theme.spacing[3] },
    stateWrap: { flex: 1, paddingHorizontal: theme.screenPad, justifyContent: 'center' },

    sectionTitle: { ...theme.typography.h2, color: theme.colors.text },

    methods: { gap: theme.spacing[2] },
    method: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      minHeight: 56,
      paddingHorizontal: theme.spacing[4],
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
    },
    methodActive: { borderColor: theme.colors.brandPrimary, backgroundColor: theme.colors.primarySoft },
    methodIcon: { width: 24, alignItems: 'center' },
    methodLabel: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text, flex: 1 },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOn: { borderColor: theme.colors.brandPrimary },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.brandPrimary },

    note: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: theme.spacing[1] },

    simRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      minHeight: 44,
      marginTop: theme.spacing[2],
    },
    check: {
      width: 22,
      height: 22,
      borderRadius: theme.radii.sm,
      borderWidth: 1.5,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkOn: { backgroundColor: theme.colors.brandAccent, borderColor: theme.colors.brandAccent },
    simText: { ...theme.typography.caption, color: theme.colors.textFaint, flex: 1 },

    toastWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },

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
