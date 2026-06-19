import { useCallback, useEffect, useState } from 'react';
import { getProgressByStudent, type Progress } from '@mobvex/db';

type UseProgress = {
  /** Progress entries, newest first. */
  entries: Progress[];
  /** True during the initial load only. */
  loading: boolean;
  /** True during a user-triggered pull-to-refresh. */
  refreshing: boolean;
  error: string | null;
  /** Re-fetch the entries (e.g. from a pull-to-refresh gesture). */
  refresh: () => void;
  /** Silent re-fetch (no loading/refreshing flags) — e.g. on screen focus. */
  reload: () => void;
};

/** Fetches a student's progress history (weight, body fat, photos, calories). */
export function useProgress(studentId: string | null): UseProgress {
  const [entries, setEntries] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyResult = useCallback(
    ({ data, error: queryError }: Awaited<ReturnType<typeof getProgressByStudent>>) => {
      if (queryError) {
        setError(queryError.message);
      } else {
        setEntries(data ?? []);
        setError(null);
      }
    },
    [],
  );

  useEffect(() => {
    if (!studentId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);

    getProgressByStudent(studentId).then((result) => {
      if (!active) return;
      applyResult(result);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [studentId, applyResult]);

  const refresh = useCallback(() => {
    if (!studentId) return;
    setRefreshing(true);
    getProgressByStudent(studentId).then((result) => {
      applyResult(result);
      setRefreshing(false);
    });
  }, [studentId, applyResult]);

  const reload = useCallback(() => {
    if (!studentId) return;
    getProgressByStudent(studentId).then(applyResult);
  }, [studentId, applyResult]);

  return { entries, loading, refreshing, error, refresh, reload };
}
