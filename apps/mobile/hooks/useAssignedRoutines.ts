import { useCallback, useEffect, useState } from 'react';
import { getAssignedRoutines, type RoutineWithExercises } from '@mobvex/db';

type UseAssignedRoutines = {
  routines: RoutineWithExercises[];
  /** True during the initial load only. */
  loading: boolean;
  /** True during a user-triggered pull-to-refresh. */
  refreshing: boolean;
  error: string | null;
  /** Re-fetch the routines (e.g. from a pull-to-refresh gesture). */
  refresh: () => void;
};

/** Fetches the active routines (with their exercises) assigned to a student. */
export function useAssignedRoutines(studentId: string): UseAssignedRoutines {
  const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyResult = useCallback(
    ({ data, error: queryError }: Awaited<ReturnType<typeof getAssignedRoutines>>) => {
      if (queryError) {
        setError(queryError.message);
      } else {
        setRoutines(data ?? []);
        setError(null);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);

    getAssignedRoutines(studentId).then((result) => {
      if (!active) return;
      applyResult(result);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [studentId, applyResult]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    getAssignedRoutines(studentId).then((result) => {
      applyResult(result);
      setRefreshing(false);
    });
  }, [studentId, applyResult]);

  return { routines, loading, refreshing, error, refresh };
}
