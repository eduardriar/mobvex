import { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Alert, Screen, Text, colors, spacing, type CategoryHue } from '@mobvex/ui';
import type { Progress as ProgressEntry } from '@mobvex/db';
import { AddSectionHeader } from '@/components/progress/AddSectionHeader';
import { WeightTrendCard } from '@/components/progress/WeightTrendCard';
import { PhotoThumbnail } from '@/components/progress/PhotoThumbnail';
import { MeasurementCard } from '@/components/progress/MeasurementCard';
import { useProgress } from '@/hooks/useProgress';
import { useProgressPhotoThumbs } from '@/hooks/useProgressPhotoThumbs';

// TODO: replace with the authenticated student's id once auth is wired.
const TEMP_STUDENT_ID = '00000000-0000-0000-0000-000000000003';

// Hue rotation for the photo tiles (newest first).
const PHOTO_HUES: CategoryHue[] = ['green', 'purple', 'blue', 'orange', 'pink'];

/** Formats an ISO date as e.g. "10 jun". */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
  });
}

/** Relative day label for a recent date, e.g. "Hoy" / "Hace 7 días". */
function relativeDays(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
}

export default function Progress() {
  const router = useRouter();
  const { entries, loading, refreshing, error, refresh, reload } =
    useProgress(TEMP_STUDENT_ID);
  const { thumbs, reload: reloadPhotos } =
    useProgressPhotoThumbs(TEMP_STUDENT_ID);

  // Pick up freshly saved measurements / photos when returning to the tab.
  useFocusEffect(
    useCallback(() => {
      reload();
      reloadPhotos();
    }, [reload, reloadPhotos]),
  );

  const latest = entries[0];
  const oldest = entries[entries.length - 1];

  // Net change of a field across the whole series (latest − oldest).
  const delta = (select: (p: ProgressEntry) => number | undefined) => {
    const a = latest ? select(latest) : undefined;
    const b = oldest ? select(oldest) : undefined;
    if (a == null || b == null) return undefined;
    return Math.round((a - b) * 10) / 10;
  };

  // Weight series oldest → newest for the sparkline.
  const weights = [...entries]
    .reverse()
    .map((e) => e.weight_kg)
    .filter((w): w is number => w != null);

  const measurements = latest
    ? [
        { label: 'Grasa corporal', value: latest.body_fat_pct, unit: '%', d: delta((p) => p.body_fat_pct) },
        { label: 'Pecho', value: latest.chest_cm, unit: 'cm', d: delta((p) => p.chest_cm) },
        { label: 'Brazo', value: latest.arm_cm, unit: 'cm', d: delta((p) => p.arm_cm) },
        { label: 'Cintura', value: latest.waist_cm, unit: 'cm', d: delta((p) => p.waist_cm) },
        { label: 'Hombro', value: latest.shoulder_cm, unit: 'cm', d: delta((p) => p.shoulder_cm) },
        { label: 'Cuádriceps', value: latest.quads_cm, unit: 'cm', d: delta((p) => p.quads_cm) },
        { label: 'Pantorrilla', value: latest.calf_cm, unit: 'cm', d: delta((p) => p.calf_cm) },
        { label: 'Glúteos', value: latest.glutes_cm, unit: 'cm', d: delta((p) => p.glutes_cm) },
      ].filter((m): m is typeof m & { value: number } => m.value != null)
    : [];

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      <Text variant="title" style={styles.title}>
        {'TU\nPROGRESO'}
      </Text>
      <Text variant="subtitle">Fotos y medidas corporales.</Text>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : error ? (
        <Alert message="No pudimos cargar tu progreso." style={styles.feedback} />
      ) : entries.length === 0 ? (
        <Text variant="subtitle" style={styles.feedback}>
          Aún no tienes registros. Cuando registres tu peso, medidas o fotos,
          aparecerán aquí.
        </Text>
      ) : (
        <>
          {weights.length >= 2 && latest?.weight_kg != null ? (
            <View style={styles.hero}>
              <WeightTrendCard
                weights={weights}
                current={latest.weight_kg}
                delta={delta((p) => p.weight_kg) ?? 0}
              />
            </View>
          ) : null}

          <View style={styles.section}>
            <AddSectionHeader
              title="Registro fotográfico"
              onAdd={() => router.push('/student/photos')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoRail}
              style={styles.sectionBody}
            >
              {entries.map((entry, index) => (
                <PhotoThumbnail
                  key={entry.id}
                  weekLabel={`Semana ${entries.length - index}`}
                  dateLabel={index === 0 ? relativeDays(entry.date) : formatDate(entry.date)}
                  hue={PHOTO_HUES[index % PHOTO_HUES.length]}
                  imageUrl={thumbs.get(entry.date) ?? null}
                  active={index === 0}
                  onPress={() => router.push('/student/photos')}
                />
              ))}
            </ScrollView>
          </View>

          {measurements.length > 0 ? (
            <View style={styles.section}>
              <AddSectionHeader
                title="Medidas corporales"
                onAdd={() => router.push('/student/measurement')}
              />
              <View style={[styles.sectionBody, styles.measureGrid]}>
                {measurements.map((m) => (
                  <MeasurementCard
                    key={m.label}
                    label={m.label}
                    value={m.value}
                    unit={m.unit}
                    delta={m.d}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    lineHeight: 36,
    marginBottom: spacing.xs,
  },
  loader: {
    marginTop: spacing.xl,
  },
  feedback: {
    marginTop: spacing.xl,
  },
  hero: {
    marginTop: spacing.xl,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionBody: {
    marginTop: 12,
  },
  photoRail: {
    gap: 12,
    paddingRight: spacing.lg,
  },
  measureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
});
