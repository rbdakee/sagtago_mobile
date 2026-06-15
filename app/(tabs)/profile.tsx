/**
 * C-17 Профиль/настройки. Имя/телефон (sessionStore), язык RU/KK
 * (usePrefsStore.setLanguage), тема (useThemeController), оферта/политика
 * (ссылки), «Спасено еды» (плейсхолдер v2), выход (signOut → онбординг).
 */
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { FileText, Leaf, LogOut, Shield, User } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListCard } from '@/components/ui/ListCard';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useSessionStore } from '@/store/sessionStore';
import { usePrefsStore, type Language, type ThemeMode } from '@/store/prefsStore';
import { useTheme, useThemedStyles, useThemeController, type Theme } from '@/theme';

const OFFER_URL = 'https://saqtago.kz/offer';
const PRIVACY_URL = 'https://saqtago.kz/privacy';

const LANGS: Language[] = ['ru', 'kk'];
const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

export default function ProfileScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('profile');

  const phone = useSessionStore((s) => s.phone);
  const signOut = useSessionStore((s) => s.signOut);
  const language = usePrefsStore((s) => s.language);
  const setLanguage = usePrefsStore((s) => s.setLanguage);
  const { mode, setMode } = useThemeController();

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const topPad = theme.spacing[2];
  const bottomPad = insets.bottom + theme.layout.tabbarH + theme.spacing[4];

  const onSignOut = () => {
    signOut();
    router.replace('/(auth)/onboarding');
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title={t('title')} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Шапка профиля */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <User size={28} color={theme.colors.brandPrimary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{t('guestName')}</Text>
            <Text style={styles.phone}>{phone ?? t('noPhone')}</Text>
          </View>
        </View>

        {/* Спасено еды (v2 плейсхолдер) */}
        <View style={styles.savedCard}>
          <View style={styles.savedIcon}>
            <Leaf size={20} color={theme.colors.success} />
          </View>
          <Text style={styles.savedLabel}>{t('savedFood')}</Text>
          <View style={styles.soonPill}>
            <Text style={styles.soonText}>{t('savedFoodSoon')}</Text>
          </View>
        </View>

        {/* Настройки */}
        <Text style={styles.sectionTitle}>{t('settingsTitle')}</Text>

        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>{t('language')}</Text>
          <Segment
            value={language}
            options={LANGS}
            labelFor={(v) => t(`languages.${v}`)}
            onChange={setLanguage}
            styles={styles}
            theme={theme}
          />
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>{t('theme')}</Text>
          <Segment
            value={mode}
            options={THEME_MODES}
            labelFor={(v) => t(`themeModes.${v}`)}
            onChange={setMode}
            styles={styles}
            theme={theme}
          />
        </View>

        {/* О сервисе */}
        <Text style={styles.sectionTitle}>{t('aboutTitle')}</Text>
        <ListCard
          items={[
            {
              key: 'offer',
              label: t('offer'),
              icon: (p) => <FileText {...p} />,
              onPress: () => Linking.openURL(OFFER_URL),
            },
            {
              key: 'privacy',
              label: t('privacy'),
              icon: (p) => <Shield {...p} />,
              onPress: () => Linking.openURL(PRIVACY_URL),
            },
          ]}
        />

        {/* Выход */}
        <ListCard
          items={[
            {
              key: 'signout',
              label: t('signOut'),
              icon: (p) => <LogOut {...p} />,
              danger: true,
              showArrow: false,
              onPress: onSignOut,
            },
          ]}
        />

        <Text style={styles.version}>{t('version', { version })}</Text>
      </ScrollView>
    </View>
  );
}

function Segment<T extends string>({
  value,
  options,
  labelFor,
  onChange,
  styles,
  theme,
}: {
  value: T;
  options: T[];
  labelFor: (v: T) => string;
  onChange: (v: T) => void;
  styles: ReturnType<typeof makeStyles>;
  theme: Theme;
}) {
  return (
    <View style={styles.segment}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]} numberOfLines={1}>
              {labelFor(opt)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    content: { paddingHorizontal: theme.screenPad, gap: theme.spacing[4] },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
      padding: theme.spacing[4],
      ...theme.shadows.card,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerInfo: { flex: 1, minWidth: 0, gap: 2 },
    name: { ...theme.typography.h2, color: theme.colors.text },
    phone: { ...theme.typography.body, color: theme.colors.textMuted },

    savedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      backgroundColor: theme.colors.accentSoft,
      borderRadius: theme.radii.card,
      paddingHorizontal: theme.spacing[4],
      minHeight: 56,
    },
    savedIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.colors.successBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    savedLabel: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text, flex: 1 },
    soonPill: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.pill,
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[1],
    },
    soonText: { ...theme.typography.caption, color: theme.colors.textMuted },

    sectionTitle: { ...theme.typography.h2, color: theme.colors.text, marginTop: theme.spacing[2] },

    settingCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.card,
      padding: theme.spacing[4],
      gap: theme.spacing[3],
      ...theme.shadows.card,
    },
    settingLabel: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },

    segment: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface2,
      borderRadius: theme.radii.pill,
      padding: 4,
      gap: 4,
    },
    segmentItem: {
      flex: 1,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radii.pill,
      paddingHorizontal: theme.spacing[2],
    },
    segmentItemActive: { backgroundColor: theme.colors.brandPrimary },
    segmentText: { ...theme.typography.caption, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.textMuted },
    segmentTextActive: { color: theme.colors.textInverse },

    version: { ...theme.typography.caption, color: theme.colors.textFaint, textAlign: 'center', marginTop: theme.spacing[2] },
  });
