/**
 * C-16 Жалоба (BP-08, R4). Причина (чипы), ОБЯЗАТЕЛЬНОЕ фото, описание;
 * complaintSchema (photos ≥ 1) + useSubmitComplaint → тост «жалоба принята».
 * Дисклеймер: возврат рассматривает поддержка (авто-возврата нет, R4).
 *
 * ⚠️ expo-image-picker не установлен: «Добавить фото» — стаб (placeholder-uri),
 * чтобы пройти валидацию photos ≥ 1. Заменить на реальный пикер (см. отчёт).
 */
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, Info, X } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { Skeleton } from '@/components/states/Skeleton';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Toast, type ToastVariant } from '@/components/ui/Toast';
import { GlassNavBar } from '@/components/glass/GlassNavBar';
import { useOrder, useSubmitComplaint } from '@/data';
import { COMPLAINT_REASONS, complaintSchema, type ComplaintReason } from '@/domain';
import { useTheme, useThemedStyles, type Theme } from '@/theme';

export default function ComplaintScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('complaint');

  const { data: order, isLoading, isError, refetch } = useOrder(orderId ?? '');
  const { mutateAsync, isPending } = useSubmitComplaint();

  const [reason, setReason] = useState<ComplaintReason | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ reason?: string; photos?: string; description?: string }>({});
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  const topPad = insets.top + theme.layout.navbarH + theme.spacing[4];

  // Стаб фото: image-picker не установлен — placeholder-uri (R4 требует ≥1 фото).
  const addPhoto = () =>
    setPhotos((prev) => [...prev, `https://picsum.photos/seed/complaint-${orderId}-${prev.length}/400/300`]);
  const removePhoto = (uri: string) => setPhotos((prev) => prev.filter((p) => p !== uri));

  const onSubmit = async () => {
    const parsed = complaintSchema.safeParse({
      reason: reason ?? undefined,
      photos,
      description: description.trim(),
    });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({
        reason: f.reason ? t('errorReason') : undefined,
        photos: f.photos ? t('errorPhoto') : undefined,
        description: f.description ? t('errorDescription') : undefined,
      });
      return;
    }
    setErrors({});
    await mutateAsync({
      orderId: orderId ?? '',
      reason: parsed.data.reason,
      photos: parsed.data.photos,
      description: parsed.data.description,
    });
    setToast({ message: t('success'), variant: 'success' });
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={[styles.content, { paddingTop: topPad }]}>
          <Skeleton height={24} width="60%" />
          <Skeleton height={40} radius={theme.radii.pill} style={{ marginTop: theme.spacing[4] }} />
          <Skeleton height={120} radius={theme.radii.card} style={{ marginTop: theme.spacing[4] }} />
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
          <EmptyState emoji="📷" title={t('heading')} />
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>{t('heading')}</Text>

        {/* Причина */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('reasonLabel')}</Text>
          <View style={styles.chips}>
            {COMPLAINT_REASONS.map((r) => (
              <Chip
                key={r}
                label={t(`reasons.${r}`)}
                active={reason === r}
                onPress={() => {
                  setReason(r);
                  setErrors((e) => ({ ...e, reason: undefined }));
                }}
              />
            ))}
          </View>
          {errors.reason ? <Text style={styles.errorText}>{errors.reason}</Text> : null}
        </View>

        {/* Фото — обязательно */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('photoLabel')}</Text>
          <Text style={styles.hint}>{t('photoHint')}</Text>
          <View style={styles.photoGrid}>
            {photos.map((uri) => (
              <View key={uri} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
                <Pressable style={styles.thumbRemove} onPress={() => removePhoto(uri)} hitSlop={8}>
                  <X size={14} color={theme.colors.textInverse} />
                </Pressable>
              </View>
            ))}
            <Pressable
              style={styles.addPhoto}
              onPress={() => {
                addPhoto();
                setErrors((e) => ({ ...e, photos: undefined }));
              }}
              accessibilityRole="button"
            >
              <Camera size={22} color={theme.colors.textMuted} />
              <Text style={styles.addPhotoText}>{t('addPhoto')}</Text>
            </Pressable>
          </View>
          {errors.photos ? <Text style={styles.errorText}>{errors.photos}</Text> : null}
          <Text style={styles.stubNote}>{t('photoStubNote')}</Text>
        </View>

        {/* Описание */}
        <Input
          label={t('descriptionLabel')}
          placeholder={t('descriptionPlaceholder')}
          textarea
          value={description}
          onChangeText={(v) => {
            setDescription(v);
            setErrors((e) => ({ ...e, description: undefined }));
          }}
          maxLength={1000}
          error={errors.description}
        />

        {/* Дисклеймер R4 */}
        <View style={styles.disclaimer}>
          <Info size={18} color={theme.colors.info} />
          <Text style={styles.disclaimerText}>{t('disclaimer')}</Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          <Button label={t('submit')} variant="danger" fullWidth loading={isPending} onPress={onSubmit} />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    navWrap: { position: 'absolute', top: 0, left: 0, right: 0 },
    content: { paddingHorizontal: theme.screenPad, gap: theme.spacing[5] },
    stateWrap: { flex: 1, paddingHorizontal: theme.screenPad, justifyContent: 'center' },

    heading: { ...theme.typography.h1, color: theme.colors.text },
    section: { gap: theme.spacing[2] },
    label: { ...theme.typography.body, fontFamily: theme.typography.h2.fontFamily, color: theme.colors.text },
    hint: { ...theme.typography.caption, color: theme.colors.textMuted },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] },
    errorText: { ...theme.typography.caption, color: theme.colors.danger },

    photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2], marginTop: theme.spacing[1] },
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

    disclaimer: {
      flexDirection: 'row',
      gap: theme.spacing[2],
      backgroundColor: theme.colors.infoBg,
      borderRadius: theme.radii.card,
      padding: theme.spacing[3],
    },
    disclaimerText: { ...theme.typography.caption, color: theme.colors.text, flex: 1 },

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
