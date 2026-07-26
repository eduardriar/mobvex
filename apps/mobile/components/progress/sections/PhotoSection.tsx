import { ScrollView, StyleSheet, View } from 'react-native';
import { spacing, type CategoryHue } from '@mobvex/ui';
import type { ProgressWithSignedPhotos } from '@mobvex/db';
import { AddSectionHeader } from '../AddSectionHeader';
import { PhotoThumbnail } from '../PhotoThumbnail';
import { COPY } from '@/lib/copy';

const T = COPY.progress.photos;

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
  if (days <= 0) return T.today;
  if (days === 1) return T.yesterday;
  return T.daysAgo(days);
}

type Props = {
  /** Progress entries newest → oldest, each with its resolved photo URLs. */
  entries: ProgressWithSignedPhotos[];
  onAddPhoto: () => void;
  onPressPhoto: () => void;
};

/** Progress screen section: horizontal progress-photo rail, newest first. */
export function PhotoSection({ entries, onAddPhoto, onPressPhoto }: Props) {
  return (
    <View style={styles.section}>
      <AddSectionHeader title={T.sectionTitle} onAdd={onAddPhoto} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photoRail}
        style={styles.sectionBody}
      >
        {entries.map((entry, index) => (
          <PhotoThumbnail
            key={entry.id}
            weekLabel={T.weekLabel(entries.length - index)}
            dateLabel={index === 0 ? relativeDays(entry.date) : formatDate(entry.date)}
            hue={PHOTO_HUES[index % PHOTO_HUES.length]}
            imageUrl={
              (entry.photos.find((p) => p.pose === 'front') ?? entry.photos[0])?.url ?? null
            }
            active={index === 0}
            onPress={onPressPhoto}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
