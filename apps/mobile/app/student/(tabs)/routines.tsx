import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Alert, Text, colors, spacing } from '@mobvex/ui';
import { ComingSoon } from '@/components/dashboard/ComingSoon';
import { RoutineSummaryCard } from '@/components/routines/RoutineSummaryCard';
import { useAssignedRoutines } from '@/hooks/useAssignedRoutines';
import { useStartSession } from '@/hooks/useStartSession';

// TODO: replace with the authenticated student's id once auth is wired.
const TEMP_STUDENT_ID = '00000000-0000-0000-0000-000000000003';

export default function Routines() {
  const router = useRouter();
  const { routines, loading, refreshing, error, refresh } =
    useAssignedRoutines(TEMP_STUDENT_ID);
  const { start, starting } = useStartSession();

  const handleStart = async (routineId: string) => {
    if (starting) return;
    const sessionId = await start(TEMP_STUDENT_ID, routineId);
    if (sessionId) {
      router.push(`/student/workout/${sessionId}`);
    }
  };

  return (
    <ComingSoon
      title={'TUS\nRUTINAS'}
      subtitle="Semana 8 de 12 · Plan Hipertrofia"
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
        <Alert message="No pudimos cargar tus rutinas." style={styles.feedback} />
      ) : routines.length === 0 ? (
        <Text variant="subtitle" style={styles.feedback}>
          Aún no tienes rutinas asignadas.
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
    </ComingSoon>
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
