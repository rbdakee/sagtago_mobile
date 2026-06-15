/**
 * Галерея UI-примитивов и состояний (W1-A) — служебный dev-экран для приёмки.
 * НЕ часть продукта. Имя с префиксом `_` → expo-router не делает из него маршрут;
 * чтобы открыть, временно зарендерь <GalleryUI/> из роутируемого экрана.
 * Демо-подписи — обычные строки (как в /sandbox); продуктовый текст идёт через i18n.
 */
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Bell,
  CreditCard,
  Globe,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Search,
  ShoppingBag,
} from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Discount } from '@/components/ui/Discount';
import { Divider } from '@/components/ui/Divider';
import { Input } from '@/components/ui/Input';
import { ListCard } from '@/components/ui/ListCard';
import { OTPInput } from '@/components/ui/OTPInput';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { RatingStars } from '@/components/ui/RatingStars';
import { Stepper } from '@/components/ui/Stepper';
import { Toast, type ToastVariant } from '@/components/ui/Toast';
import { BoxCardSkeleton, ListSkeleton, Skeleton } from '@/components/states/Skeleton';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import type { BadgeVariant } from '@/domain';
import { useTheme, useThemeController } from '@/theme';

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const BADGES: { variant: BadgeVariant; label: string }[] = [
  { variant: 'success', label: 'В продаже' },
  { variant: 'info', label: 'Ждёт выдачи' },
  { variant: 'warning', label: 'Возврат' },
  { variant: 'danger', label: 'Просрочен' },
  { variant: 'muted', label: 'Закрыт' },
];

const THEME_MODES = ['system', 'light', 'dark'] as const;

export default function GalleryUI() {
  const theme = useTheme();
  const { mode, setMode, name } = useThemeController();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpErr, setOtpErr] = useState('');
  const [qty, setQty] = useState(1);
  const [rate, setRate] = useState(4);
  const [activeChip, setActiveChip] = useState('all');
  const [toast, setToast] = useState<ToastVariant | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>UI Gallery</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
          тема: {name}
        </Text>

        {/* Переключатель темы для сверки обеих тем */}
        <View style={styles.row}>
          {THEME_MODES.map((m) => (
            <Chip key={m} label={m} active={mode === m} size="s" onPress={() => setMode(m)} />
          ))}
        </View>

        <Section title="Button — варианты">
          <Button label="Primary" variant="primary" />
          <Button label="Dark" variant="dark" />
          <Button label="Secondary" variant="secondary" />
          <Button label="Ghost" variant="ghost" />
          <Button label="Danger" variant="danger" />
          <Button label="С иконкой" icon={(p) => <ArrowRight {...p} />} />
          <Button label="Loading" loading />
          <Button label="Disabled" disabled />
        </Section>

        <Section title="Button — размеры">
          <Button label="Large (52)" size="L" />
          <Button label="Medium (44)" size="M" variant="dark" />
          <Button label="Small (36)" size="S" variant="secondary" />
          <Button label="Full width" fullWidth variant="primary" />
        </Section>

        <Section title="Input">
          <Input label="Имя" placeholder="Например, Аружан" />
          <Input label="Поиск" placeholder="Найти заведение" icon={(p) => <Search {...p} />} />
          <Input label="С подсказкой" placeholder="email@mail.kz" hint="Пришлём чек на почту" icon={(p) => <Mail {...p} />} />
          <Input label="С ошибкой" placeholder="Поле" error="Обязательное поле" />
          <Input label="Комментарий" placeholder="Ваш отзыв…" textarea />
        </Section>

        <Section title="PhoneInput">
          <PhoneInput label="Телефон" value={phone} onChangeText={setPhone} placeholder="700 000 00 00" />
        </Section>

        <Section title="OTPInput">
          <OTPInput
            value={otp}
            onChangeText={setOtp}
            onResend={() => setToast('info')}
            resendLabel="Отправить код повторно"
          />
          <View style={{ height: 16 }} />
          <OTPInput value={otpErr} onChangeText={setOtpErr} error length={6} />
        </Section>

        <Section title="Chip">
          <View style={styles.row}>
            {['all', 'bakery', 'coffee', 'sushi'].map((c) => (
              <Chip key={c} label={c} active={activeChip === c} onPress={() => setActiveChip(c)} />
            ))}
          </View>
          <View style={styles.row}>
            <Chip label="size s" size="s" active />
            <Chip label="с иконкой" icon={(p) => <MapPin {...p} />} />
          </View>
        </Section>

        <Section title="Badge">
          <View style={styles.row}>
            {BADGES.map((b) => (
              <Badge key={b.variant} variant={b.variant} label={b.label} />
            ))}
          </View>
        </Section>

        <Section title="Discount">
          <View style={[styles.row, { alignItems: 'center' }]}>
            <Discount value={70} />
            <Discount value={50} size="lg" />
          </View>
        </Section>

        <Section title="RatingStars">
          <RatingStars value={4} />
          <RatingStars value={rate} editable onChange={setRate} />
          <RatingStars value={4.8} compact />
        </Section>

        <Section title="Stepper">
          <Stepper value={qty} onChange={setQty} min={1} max={3} />
        </Section>

        <Section title="Toast (тап по кнопке)">
          <Button label="success" size="S" variant="secondary" onPress={() => setToast('success')} />
          <Button label="danger" size="S" variant="secondary" onPress={() => setToast('danger')} />
          <Button label="info" size="S" variant="secondary" onPress={() => setToast('info')} />
        </Section>

        <Section title="Divider">
          <Text style={[theme.typography.body, { color: theme.colors.text }]}>Сверху</Text>
          <Divider />
          <Text style={[theme.typography.body, { color: theme.colors.text }]}>Снизу</Text>
        </Section>

        <Section title="ListCard">
          <ListCard
            items={[
              { key: 'fav', label: 'Избранное', icon: (p) => <Heart {...p} />, value: '12', onPress: () => {} },
              { key: 'pay', label: 'Способы оплаты', icon: (p) => <CreditCard {...p} />, onPress: () => {} },
              { key: 'lang', label: 'Язык', icon: (p) => <Globe {...p} />, value: 'Русский', onPress: () => {} },
              { key: 'push', label: 'Уведомления', icon: (p) => <Bell {...p} />, onPress: () => {} },
              { key: 'out', label: 'Выйти', icon: (p) => <LogOut {...p} />, danger: true, onPress: () => {} },
            ]}
          />
        </Section>

        <Section title="Skeleton">
          <Skeleton width="80%" height={16} />
          <Skeleton width="50%" height={12} />
          <BoxCardSkeleton />
          <ListSkeleton count={3} />
        </Section>

        <Section title="EmptyState">
          <EmptyState
            emoji="🛍️"
            title="Пока пусто"
            text="Здесь появятся боксы, которые вы спасёте."
            ctaLabel="На главную"
            onCtaPress={() => {}}
            icon={(p) => <ShoppingBag {...p} />}
          />
        </Section>

        <Section title="ErrorState">
          <ErrorState onRetry={() => setToast('info')} />
        </Section>
      </ScrollView>

      <View style={styles.toastHost} pointerEvents="box-none">
        <Toast
          visible={toast !== null}
          variant={toast ?? 'info'}
          message={
            toast === 'success' ? 'Готово!' : toast === 'danger' ? 'Что-то пошло не так' : 'Код отправлен'
          }
          onHide={() => setToast(null)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8, paddingBottom: 64 },
  section: { marginTop: 24, gap: 12 },
  sectionBody: { gap: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toastHost: { position: 'absolute', left: 16, right: 16, bottom: 32, alignItems: 'center' },
});
