import { useCallback, useEffect, useState } from 'react';
import {
  abandonSession,
  completeSession,
  getActiveSession,
  updateSetLog,
  type ActiveSession,
  type SetLog,
} from '@mobvex/db';

type SetLogChanges = Partial<
  Pick<SetLog, 'weight_kg' | 'reps' | 'rir' | 'completed'>
>;

type UseActiveSession = {
  /** The current active session, or null when none is in progress. */
  session: ActiveSession | null;
  /** True during the initial load only. */
  loading: boolean;
  error: string | null;
  /** Re-fetch the active session. */
  refresh: () => void;
  /** Persist changes to a single set, optimistically updating local state. */
  logSet: (id: string, changes: SetLogChanges) => Promise<void>;
  /** Mark the session completed (kept as history). */
  finish: () => Promise<void>;
  /** Abandon the session without completing it. */
  abandon: () => Promise<void>;
};

/** Loads and mutates the student's current active workout session. */
export function useActiveSession(studentId: string): UseActiveSession {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (initial: boolean) => {
      if (initial) setLoading(true);
      const { data, error: queryError } = await getActiveSession(studentId);
      if (queryError) {
        setError(queryError.message);
      } else {
        setSession(data);
        setError(null);
      }
      if (initial) setLoading(false);
    },
    [studentId],
  );

  useEffect(() => {
    let active = true;
    getActiveSession(studentId).then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) setError(queryError.message);
      else setSession(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [studentId]);

  const refresh = useCallback(() => {
    void load(false);
  }, [load]);

  const logSet = useCallback(async (id: string, changes: SetLogChanges) => {
    // Optimistic: patch the local set immediately, roll back on error.
    setSession((current) =>
      current
        ? {
            ...current,
            set_logs: current.set_logs.map((log) =>
              log.id === id ? { ...log, ...changes } : log,
            ),
          }
        : current,
    );
    const { error: updateError } = await updateSetLog(id, changes);
    if (updateError) {
      setError(updateError.message);
      const { data } = await getActiveSession(studentId);
      setSession(data);
    }
  }, [studentId]);

  const finish = useCallback(async () => {
    if (!session) return;
    const { error: completeError } = await completeSession(session.id);
    if (completeError) setError(completeError.message);
    else setSession(null);
  }, [session]);

  const abandon = useCallback(async () => {
    if (!session) return;
    const { error: abandonError } = await abandonSession(session.id);
    if (abandonError) setError(abandonError.message);
    else setSession(null);
  }, [session]);

  return { session, loading, error, refresh, logSet, finish, abandon };
}
