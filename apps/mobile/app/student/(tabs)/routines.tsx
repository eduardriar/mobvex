import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Alert, Text, colors, spacing } from '@mobvex/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { RoutineSummaryCard } from '@/components/routines/RoutineSummaryCard';
import { useAssignedRoutines } from '@/hooks/useAssignedRoutines';
import { useStartSession } from '@/hooks/useStartSession';
import { useAuth } from '@/components/auth/AuthProvider';
import { COPY } from '@/lib/copy';

const T = COPY.routines;

export default function Routines() {
  const router = useRouter();
  const { studentId } = useAuth();
  const { routines, loading, refreshing, error, refresh } =
    useAssignedRoutines(studentId);
  const { start, starting } = useStartSession();

  // The plan's name lives on each routine's description (same value per plan).
  const planName = routines.find((r) => r.description)?.description ?? null;

  const handleStart = async (routineId: string) => {
    if (starting || !studentId) return;
    const sessionId = await start(studentId, routineId);
    if (sessionId) {
      router.push(`/student/workout/${sessionId}`);
    }
  };

  return (
    <ScreenHeader
      title={T.title}
      subtitle={planName ?? T.subtitle}
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
      ) : routines.length === 0 ? (
        <Text variant="subtitle" style={styles.feedback}>
          {T.emptyState}
        </Text>
      ) : (
        <View style={styles.list}>
          {routines.map((routine) => (
            <RoutineSummaryCard
              key={routine.id}
              name={routine.name}
              exercises={routine.routine_exercises.map(
                (routineExercise) => routineExercise.exercise.name,
              )}
              onStart={() => handleStart(routine.id)}
              // TODO: open the routine menu once that screen exists.
              onMenu={undefined}
            />
          ))}
        </View>
      )}
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  loader: {
    marginTop: spacing.xl,
  },
  feedback: {
    marginTop: spacing.xl,
  },
});
