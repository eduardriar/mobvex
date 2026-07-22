import { Feather } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Text, colors, fonts, fontSizes, overlays, radius, spacing } from '@mobvex/ui';
import { isYouTubeUrl, parseYouTubeVideoId } from '@mobvex/db';
import type { SetLogWithExercise } from '@mobvex/db';
import { SetRow } from './SetRow';

type SetChanges = {
  weight_kg?: number;
  reps?: number;
  rir?: number;
  completed?: boolean;
};

type Props = {
  /** The set logs for a single exercise, ordered by set number. */
  setLogs: SetLogWithExercise[];
  onChangeSet: (setLogId: string, changes: SetChanges) => void;
};

// Leading column width — keeps the "done" header check and the set circles
// aligned above each other (matches SetRow's circle size + row gap).
const LEAD_COLUMN = 44;

/**
 * One exercise within the active session: a thumbnail + prescription header and
 * a grid of editable set rows. Expects all logs to belong to the same exercise.
 */
export function SessionExerciseCard({ setLogs, onChangeSet }: Props) {
  const router = useRouter();
  const first = setLogs[0];
  if (!first) return null;

  const { exercise, sets, reps, rest_seconds } = first.routine_exercise;

  // The "active" set is the first one not yet completed.
  const activeId = setLogs.find((log) => !log.completed)?.id;

  const mediaUrl = exercise.media_url;
  const isVideo = !!mediaUrl && isYouTubeUrl(mediaUrl);
  const thumbnailUrl = isVideo ? exercise.media_thumbnail_url : mediaUrl;

  const openVideo = () => {
    if (!mediaUrl) return;
    const videoId = parseYouTubeVideoId(mediaUrl);
    if (!videoId) return;
    router.push({
      pathname: '/student/workout/video/[videoId]',
      params: { videoId, title: exercise.name },
    });
  };

  const thumb = (
    <View style={styles.thumb}>
      {thumbnailUrl ? (
        <>
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbImage} />
          {isVideo && (
            <View style={styles.playOverlay}>
              <Feather name="play" size={18} color={colors.text} />
            </View>
          )}
        </>
      ) : (
        <Feather name="image" size={22} color={colors.muted} />
      )}
    </View>
  );

  return (
    <Card>
      <View style={styles.header}>
        {isVideo ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver video del ejercicio"
            onPress={openVideo}
          >
            {thumb}
          </Pressable>
        ) : (
          thumb
        )}
        <View style={styles.headerText}>
          <Text style={styles.name}>{exercise.name}</Text>
          <Text style={styles.meta}>
            {exercise.muscle_group ? `${exercise.muscle_group} · ` : ''}
            {`${sets} × ${reps} · descanso ${rest_seconds}s`}
          </Text>
        </View>
      </View>

      <View style={styles.colHeader}>
        <View style={styles.leadHeader}>
          <Feather name="check" size={16} color={colors.muted} />
        </View>
        <Text style={styles.colLabel}>PESO</Text>
        <Text style={styles.colLabel}>REPS</Text>
        <Text style={styles.colLabel}>RIR</Text>
      </View>

      <View style={styles.rows}>
        {setLogs.map((log) => (
          <SetRow
            key={log.id}
            setNumber={log.set_number}
            weightKg={log.weight_kg}
            reps={log.reps}
            rir={log.rir}
            completed={log.completed}
            active={log.id === activeId}
            onChange={(changes) => onChangeSet(log.id, changes)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Feather name="check-circle" size={16} color={colors.accent} />
        <Text style={styles.footerText}>
          Toca el círculo de cada serie para marcarla como completada
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: overlays.mediaScrim,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: fontSizes.buttonPrimary, // 20
    fontWeight: '700',
    color: colors.text,
    lineHeight: 24,
  },
  meta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: fontSizes.link,
    color: colors.muted,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  leadHeader: {
    width: LEAD_COLUMN,
    alignItems: 'center',
  },
  colLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: fontSizes.label,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: colors.muted,
  },
  rows: {
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  footerText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.cardRole,
    color: colors.muted,
    lineHeight: 18,
  },
});
