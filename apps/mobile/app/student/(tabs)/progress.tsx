import { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Alert, Text, colors, spacing } from '@mobvex/ui';
import type { Progress as ProgressEntry } from '@mobvex/db';
import { ScreenHeader } from '@/components/ScreenHeader';
import { WeightSection } from '@/components/progress/sections/WeightSection';
import { PhotoSection } from '@/components/progress/sections/PhotoSection';
import {
  MeasurementsSection,
  type MeasurementItem,
} from '@/components/progress/sections/MeasurementsSection';
import { useProgress } from '@/hooks/useProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { COPY } from '@/lib/copy';

const T = COPY.progress;

export default function Progress() {
  const router = useRouter();
  const { studentId } = useAuth();
  const { entries, loading, refreshing, error, refresh, reload } =
    useProgress(studentId);

  // Pick up freshly saved measurements / photos when returning to the tab.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
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

  // Always show all measurement cards (same UI distribution); a card with no
  // registered value renders a "—" placeholder instead of disappearing.
  const measurements: MeasurementItem[] = latest
    ? [
      { label: T.measurementLabels.bodyFatPct, value: latest.body_fat_pct, unit: '%', delta: delta((p) => p.body_fat_pct) },
      { label: T.measurementLabels.chest, value: latest.chest_cm, unit: 'cm', delta: delta((p) => p.chest_cm) },
      { label: T.measurementLabels.arm, value: latest.arm_cm, unit: 'cm', delta: delta((p) => p.arm_cm) },
      { label: T.measurementLabels.waist, value: latest.waist_cm, unit: 'cm', delta: delta((p) => p.waist_cm) },
      { label: T.measurementLabels.shoulder, value: latest.shoulder_cm, unit: 'cm', delta: delta((p) => p.shoulder_cm) },
      { label: T.measurementLabels.quads, value: latest.quads_cm, unit: 'cm', delta: delta((p) => p.quads_cm) },
      { label: T.measurementLabels.calf, value: latest.calf_cm, unit: 'cm', delta: delta((p) => p.calf_cm) },
      { label: T.measurementLabels.glutes, value: latest.glutes_cm, unit: 'cm', delta: delta((p) => p.glutes_cm) },
    ]
    : [];

  return (
    <ScreenHeader
      title={T.title}
      subtitle={T.subtitle}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : error ? (
        <Alert message={T.loadError} style={styles.feedback} />
      ) : entries.length === 0 ? (
        <Text variant="subtitle" style={styles.feedback}>
          {T.emptyState}
        </Text>
      ) : (
        <>
          <WeightSection
            weights={weights}
            current={latest?.weight_kg}
            delta={delta((p) => p.weight_kg)}
          />

          <PhotoSection
            entries={entries}
            onAddPhoto={() => router.push('/student/photos')}
            onPressPhoto={() => router.push('/student/photos')}
          />

          <MeasurementsSection
            measurements={measurements}
            onAdd={() => router.push('/student/measurement')}
          />
        </>
      )}
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  feedback: {
    marginTop: spacing.xl,
  },
});
