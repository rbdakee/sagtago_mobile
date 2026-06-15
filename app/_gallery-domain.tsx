/**
 * Dev-галерея glass + domain компонентов (W1-B). НЕ часть продукта — служебный
 * экран приёмки: смотрим компоненты в обеих темах. Маршрут: `/_gallery-domain`.
 * Открыть: router.push('/_gallery-domain') (или Link с любого dev-экрана).
 *
 * Подписи секций намеренно литеральные (как в app/sandbox.tsx) — это инструмент
 * разработчика, не пользовательский UI.
 */
import { Stack, router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassBottomSheet } from '@/components/glass/GlassBottomSheet';
import { GlassFab } from '@/components/glass/GlassFab';
import { GlassNavBar } from '@/components/glass/GlassNavBar';
import { BoxCard } from '@/components/domain/BoxCard';
import { CodeCard } from '@/components/domain/CodeCard';
import { Marker } from '@/components/domain/Marker';
import { MerchantHeader } from '@/components/domain/MerchantHeader';
import { OrderRow } from '@/components/domain/OrderRow';
import { QRCard } from '@/components/domain/QRCard';
import { StatCard } from '@/components/domain/StatCard';
import { TrustBlock } from '@/components/domain/TrustBlock';
import { boxes } from '@/data/placeholders/boxes';
import { merchants } from '@/data/placeholders/merchants';
import { seedOrders } from '@/data/placeholders/orders';
import { usePrefsStore, type ThemeMode } from '@/store/prefsStore';
import { useTheme, useThemeController } from '@/theme';

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

function Segment({ value, onChange }: { value: ThemeMode; onChange: (v: ThemeMode) => void }) {
  const theme = useTheme();
  return (
    <View style={[s.segment, { backgroundColor: theme.colors.surface2 }]}>
      {THEME_MODES.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[s.segmentItem, active && { backgroundColor: theme.colors.brandPrimary }]}
          >
            <Text
              style={[
                theme.typography.caption,
                { color: active ? theme.colors.textInverse : theme.colors.textMuted },
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={s.section}>
      <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function GalleryDomain() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { mode, setMode } = useThemeController();
  const setLanguage = usePrefsStore((st) => st.setLanguage);
  const language = usePrefsStore((st) => st.language);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set(['b1']));
  const toggleFav = (id: string) =>
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const withFav = (id: string) => {
    const box = boxes.find((b) => b.id === id)!;
    return { ...box, isFavorite: favs.has(id) };
  };

  const navH = insets.top + theme.layout.navbarH;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={[s.content, { paddingTop: navH + theme.spacing[4] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Переключатели для сверки обеих тем / языков */}
        <View style={s.controls}>
          <Segment value={mode} onChange={setMode} />
          <Pressable
            onPress={() => setLanguage(language === 'ru' ? 'kk' : 'ru')}
            style={[s.langBtn, { borderColor: theme.colors.borderStrong }]}
          >
            <Text style={[theme.typography.caption, { color: theme.colors.text }]}>
              {language.toUpperCase()}
            </Text>
          </Pressable>
        </View>

        <Section title="BoxCard">
          <BoxCard box={withFav('b1')} onPress={() => {}} onToggleFavorite={(b) => toggleFav(b.id)} />
          <BoxCard box={withFav('b2')} onPress={() => {}} onToggleFavorite={(b) => toggleFav(b.id)} />
          <BoxCard box={boxes.find((b) => b.id === 'b5')!} onPress={() => {}} />
          <BoxCard box={boxes.find((b) => b.id === 'b8')!} onPress={() => {}} />
        </Section>

        <Section title="MerchantHeader">
          <View style={[s.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <MerchantHeader merchant={merchants[0]} />
          </View>
        </Section>

        <Section title="OrderRow">
          <View style={[s.listcard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {seedOrders.map((o, i) => (
              <View key={o.id}>
                {i > 0 && <View style={[s.divider, { backgroundColor: theme.colors.border }]} />}
                <OrderRow order={o} onPress={() => {}} />
              </View>
            ))}
          </View>
        </Section>

        <Section title="CodeCard / QRCard">
          <CodeCard code={seedOrders[0].pickupCode} brightenLabel="Ярче" onBrighten={() => {}} />
          <QRCard order={seedOrders[0]} />
        </Section>

        <Section title="Marker">
          <View style={s.rowWrap}>
            <Marker price={boxes[0].price} count={boxes[0].stockLeft} />
            <Marker price={boxes[2].price} />
            <Marker variant="cluster" count={12} />
          </View>
        </Section>

        <Section title="StatCard">
          <View style={s.statRow}>
            <View style={s.statCol}>
              <StatCard value="14" label="Спасено боксов" delta={{ dir: 'up', value: '+3' }} />
            </View>
            <View style={s.statCol}>
              <StatCard value="9 870 ₸" label="Сэкономлено" delta={{ dir: 'up', value: '+12%' }} />
            </View>
          </View>
        </Section>

        <Section title="TrustBlock">
          <TrustBlock
            title="Гарантия свежести."
            text="Если что-то не так — возврат по жалобе через поддержку."
          />
        </Section>

        <Section title="GlassBottomSheet / GlassFab">
          <Pressable
            onPress={() => setSheetOpen(true)}
            style={[s.openBtn, { backgroundColor: theme.colors.brandAccent }]}
          >
            <Text style={[theme.typography.body, { color: theme.colors.brandAccentInk }]}>
              Открыть bottom-sheet
            </Text>
          </Pressable>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
            GlassTabBar — на реальных табах. FAB — справа снизу.
          </Text>
        </Section>
      </ScrollView>

      {/* GlassNavBar поверх контента (контент скроллится под блюром) */}
      <View style={s.navWrap}>
        <GlassNavBar title="Галерея W1-B" onBack={() => router.back()} />
      </View>

      <GlassFab
        icon={<Plus size={26} color={theme.colors.brandAccentInk} />}
        onPress={() => setSheetOpen(true)}
        accessibilityLabel="Добавить"
        style={{ position: 'absolute', right: theme.screenPad, bottom: insets.bottom + theme.spacing[6] }}
      />

      <GlassBottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <View style={{ gap: theme.spacing[3], paddingBottom: theme.spacing[4] }}>
          <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Bottom sheet</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
            Стеклянный лист на Modal + Animated. Тап по фону или свайп-вниз закрывает.
          </Text>
          <TrustBlock text="Пример контента внутри листа." />
        </View>
      </GlassBottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 64, gap: 24 },
  navWrap: { position: 'absolute', top: 0, left: 0, right: 0 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  segment: { flexDirection: 'row', borderRadius: 999, padding: 4, gap: 4, alignSelf: 'flex-start' },
  segmentItem: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999 },
  langBtn: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 },
  section: { gap: 12 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  listcard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  statRow: { flexDirection: 'row', gap: 12 },
  statCol: { flex: 1 },
  openBtn: { height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
