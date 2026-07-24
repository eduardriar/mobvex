import { useEffect, useState } from 'react';
import { getCompletedSessionsCount, getProgressByStudent } from '@mobvex/db';

type UseTrainingStats = {
  /** All-time count of completed workout sessions, or null while loading. */
  completedSessions: number | null;
  /** Latest vs. earliest recorded weight, or null while loading/unavailable. */
  weightDeltaKg: number | null;
  /** True during the initial load only. */
  loading: boolean;
  error: string | null;
};

/** Dashboard stats: completed sessions count and weight change since the start. */
export function useTrainingStats(studentId: string | null): UseTrainingStats {
  const [completedSessions, setCompletedSessions] = useState<number | null>(null);
  const [weightDeltaKg, setWeightDeltaKg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setCompletedSessions(null);
      setWeightDeltaKg(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    Promise.all([
      getCompletedSessionsCount(studentId),
      getProgressByStudent(studentId),
    ]).then(([sessionsResult, progressResult]) => {
      if (!active) return;
      const queryError = sessionsResult.error ?? progressResult.error;
      if (queryError) {
        setError(queryError.message);
      } else {
        setError(null);
        setCompletedSessions(sessionsResult.count ?? 0);

        const entries = progressResult.data ?? [];
        const latest = entries[0];
        const oldest = entries[entries.length - 1];
        setWeightDeltaKg(
          latest?.weight_kg != null && oldest?.weight_kg != null
            ? Math.round((latest.weight_kg - oldest.weight_kg) * 10) / 10
            : null,
        );
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [studentId]);

  return { completedSessions, weightDeltaKg, loading, error };
}
