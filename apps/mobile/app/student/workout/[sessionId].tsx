import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { Alert, Button, Screen, Text, colors, spacing } from '@mobvex/ui';
import type { SetLogWithExercise } from '@mobvex/db';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { SessionExerciseCard } from '@/components/workout/SessionExerciseCard';
import { WorkoutClock } from '@/components/workout/WorkoutClock';
import { useActiveSession } from '@/hooks/useActiveSession';
import { useAuth } from '@/components/auth/AuthProvider';

/** Group set logs by exercise, ordered by exercise position then set number. */
function groupByExercise(setLogs: SetLogWithExercise[]): SetLogWithExercise[][] {
  const groups = new Map<string, SetLogWithExercise[]>();
  for (const log of setLogs) {
    const list = groups.get(log.routine_exercise_id) ?? [];
    list.push(log);
    groups.set(log.routine_exercise_id, list);
  }
  return Array.from(groups.values())
    .map((group) => [...group].sort((a, b) => a.set_number - b.set_number))
    .sort(
      (a, b) => a[0].routine_exercise.order - b[0].routine_exercise.order,
    );
}

export default function WorkoutSession() {
  const router = useRouter();
  const { studentId } = useAuth();
  const { session, loading, error, logSet, finish } =
    useActiveSession(studentId);
  const [finishing, setFinishing] = useState(false);

  const exercises = useMemo(
    () => (session ? groupByExercise(session.set_logs) : []),
    [session],
  );

  const totalSets = session?.set_logs.length ?? 0;
  const completedSets =
    session?.set_logs.filter((log) => log.completed).length ?? 0;
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </Screen>
    );
  }

  // No active session (e.g. it was just finished elsewhere) — back to home.
  if (!session) {
    return <Redirect href="/student" />;
  }

  const handleFinish = async () => {
    setFinishing(true);
    await finish();
    router.replace('/student');
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="label" style={styles.eyebrow}>
            Rutina en curso
          </Text>
          <Text variant="title" style={styles.title}>
            {session.routine.name}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar rutina"
          hitSlop={8}
          onPress={() => router.replace('/student')}
        >
          <Feather name="x" size={24} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.progress}>
        <ProgressBar progress={progress} />
        <View style={styles.progressMeta}>
          <Text variant="cardRole">
            {completedSets} de {totalSets} series completadas
          </Text>
          <WorkoutClock startedAt={session.started_at} />
        </View>
      </View>

      {error ? (
        <Alert message="No pudimos guardar tu último cambio." style={styles.alert} />
      ) : null}

      <View style={styles.list}>
        {exercises.map((group) => (
          <SessionExerciseCard
            key={group[0].routine_exercise_id}
            setLogs={group}
            onChangeSet={logSet}
          />
        ))}
      </View>

      <Button
        label="FINALIZAR RUTINA"
        variant="primary"
        fullWidth
        loading={finishing}
        onPress={handleFinish}
        style={styles.finish}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  loader: {
    marginTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  title: {
    lineHeight: 36,
  },
  progress: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  progressMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  alert: {
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  finish: {
    marginTop: spacing.xl,
  },
});
