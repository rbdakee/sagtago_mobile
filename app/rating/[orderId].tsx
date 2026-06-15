/**
 * C-15 Оценка (BP-08). Звёзды (RatingStars), опц. текст, опц. фото; валидация
 * ratingSchema; useSubmitRating → тост. При низкой оценке (≤3) — развилка на
 * жалобу (→ C-16).
 *
 * ⚠️ expo-image-picker не установлен: «Добавить фото» — стаб (placeholder-uri).
 */
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, X } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { Skeleton } from '@/components/states/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RatingStars } from '@/components/ui/RatingStars';
import { Toast, type ToastVariant } from '@/components/ui/Toast';
import { GlassNavBar } from '@/components/glass/GlassNavBar';
import { useOrder, useSubmitRating } from '@/data';
import { ratingSchema } from '@/domain';
import { useTheme, useThemedStyles, type Theme } from '@/theme';

const LOW_RATING = 3;

export default function RatingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('rating');

  const { data: order, isLoading, isError, refetch } = useOrder(orderId ?? '');
  const { mutateAsync, isPending } = useSubmitRating();

  const [stars, setStars] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [starsError, setStarsError] = useState<string | undefined>();
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  const topPad = insets.top + theme.layout.navbarH + theme.spacing[4];

  // Стаб фото: image-picker не установлен — добавляем placeholder-uri (см. отчёт).
  const addPhoto = () =>
    setPhotos((prev) => [...prev, `https://picsum.photos/seed/rate-${orderId}-${prev.length}/400/300`]);
  const removePhoto = (uri: string) => setPhotos((prev) => prev.filter((p) => p !== uri));

  const onSubmit = async () => {
    const parsed = ratingSchema.safeParse({ stars, text: text.trim() || undefined });
    if (!parsed.success) {
      setStarsError(t('starsError'));
      return;
    }
    setStarsError(undefined);
    await mutateAsync({
      orderId: orderId ?? '',
      stars,
      text: text.trim() || undefined,
      photos: photos.length ? photos : undefined,
    });
    setToast({ message: t('success'), variant: 'success' });
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={[styles.content, { paddingTop: topPad }]}>
          <Skeleton height={28} width="60%" style={{ alignSelf: 'center' }} />
          <Skeleton height={48} width="70%" radius={theme.radii.card} style={{ alignSelf: 'center', marginTop: theme.spacing[4] }} />
          <Skeleton height={120} radius={theme.radii.card} style={{ marginTop: theme.spacing[6] }} />
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
    if (!order) {
      return (
        <View style={[styles.stateWrap, { paddingTop: topPad }]}>
          <EmptyState emoji="⭐" title={t('heading')} />
        </View>
      );
    }

    const showLowFork = stars > 0 && stars <= LOW_RATING;

    return (
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>{t('heading')}</Text>
        <Text style={styles.merchant}>{order.merchant.name}</Text>

        <View style={styles.starsWrap}>
          <RatingStars
            value={stars}
            editable
            size={40}
            onChange={(v) => {
              setStars(v);
              setStarsError(undefined);
            }}
          />
        </View>
        {starsError ? <Text style={styles.errorText}>{starsError}</Text> : null}

        <Input
          label={t('commentLabel')}
          placeholder={t('commentPlaceholder')}
          textarea
          value={text}
          onChangeText={setText}
          maxLength={500}
        />

        {/* Фото (опц.) — стаб */}
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>{t('photoLabel')}</Text>
          <View style={styles.photoGrid}>
            {photos.map((uri) => (
              <View key={uri} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
                <Pressable style={styles.thumbRemove} onPress={() => removePhoto(uri)} hitSlop={8}>
                  <X size={14} color={theme.colors.textInverse} />
                </Pressable>
              </View>
            ))}
            <Pressable style={styles.addPhoto} onPress={addPhoto} accessibilityRole="button">
              <Camera size={22} color={theme.colors.textMuted} />
              <Text style={styles.addPhotoText}>{t('addPhoto')}</Text>
            </Pressable>
          </View>
          <Text style={styles.stubNote}>{t('photoStubNote')}</Text>
        </View>

        {showLowFork ? (
          <View style={styles.lowFork}>
            <Text style={styles.lowTitle}>{t('lowTitle')}</Text>
            <Text style={styles.lowText}>{t('lowText')}</Text>
            <Button
              label={t('complaintCta')}
              variant="secondary"
              size="M"
              onPress={() => router.push({ pathname: '/complaint/[orderId]', params: { orderId: order.id } })}
            />
          </View>
        ) : null}
      </ScrollView>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {renderBody()}

      <View style={styles.navWrap}>
        <GlassNavBar title={t('title')} onBack={() => router.back()} />
      </View>

      {toast ? (
        <View style={[styles.toastWrap, { bottom: insets.bottom + 96 }]} pointerEvents="box-none">
          <Toast
            visible
            message={toast.message}
            variant={toast.variant}
            duration={1400}
            onHide={() => {
              setToast(null);
              router.back();
            }}
          />
        </View>
      ) : null}

      {order ? (
        <View style={[styles.cta, { paddingBottom: insets.bottom + theme.spacing[3] }]}>
          <Button label={t('submit')} fullWidth loading={isPending} onPress={onSubmit} />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    navWrap: { position: 'absolute', top: 0, left: 0, right: 0 },
    content: { paddingHorizontal: theme.screenPad, gap: theme.spacing[4] },
    stateWrap: { flex: 1, paddingHorizontal: theme.screenPad, justifyContent: 'center' },

    heading: { ...theme.typography.h1, color: theme.colors.text, textAlign: 'center' },
    merchant: { ...theme.typography.body, color: theme.colors.textMuted, textAlign: 'center', marginTop: -theme.spacing[2] },
    starsWrap: { alignItems: 'center', paddingVertical: theme.spacing[2] },
    errorText: { ...theme.typography.caption, color: theme.colors.danger, textAlign: 'center', marginTop: -theme.spacing[2] },

    photoSection: { gap: theme.spacing[2] },
    photoLabel: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] },
    thumbWrap: { width: 84, height: 84 },
    thumb: { width: 84, height: 84, borderRadius: theme.radii.input, backgroundColor: theme.colors.surface2 },
    thumbRemove: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.brandPrimary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addPhoto: {
      width: 84,
      height: 84,
      borderRadius: theme.radii.input,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      backgroundColor: theme.colors.surface,
    },
    addPhotoText: { ...theme.typography.caption, color: theme.colors.textMuted, fontSize: 11 },
    stubNote: { ...theme.typography.caption, color: theme.colors.textFaint },

    lowFork: {
      backgroundColor: theme.colors.warningBg,
      borderRadius: theme.radii.card,
      padding: theme.spacing[4],
      gap: theme.spacing[2],
      alignItems: 'flex-start',
    },
    lowTitle: { ...theme.typography.bodyL, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    lowText: { ...theme.typography.body, color: theme.colors.textMuted },

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
