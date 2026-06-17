import { useCallback, useState } from 'react';
import { getActiveSession, startSession } from '@mobvex/db';

type UseStartSession = {
  /**
   * Start (or resume) a session for a routine. If the student already has an
   * active session, returns that session's id instead of creating a new one
   * (only one active session per student is allowed). Returns the session id,
   * or null on error.
   */
  start: (studentId: string, routineId: string) => Promise<string | null>;
  /** True while a start request is in flight. */
  starting: boolean;
  error: string | null;
};

/** Starts a workout session, resuming any session already in progress. */
export function useStartSession(): UseStartSession {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(
    async (studentId: string, routineId: string): Promise<string | null> => {
      setStarting(true);
      setError(null);

      // Resume an existing active session rather than starting a second one.
      const { data: existing, error: existingError } =
        await getActiveSession(studentId);
      if (existingError) {
        setError(existingError.message);
        setStarting(false);
        return null;
      }
      if (existing) {
        setStarting(false);
        return existing.id;
      }

      const { data, error: startError } = await startSession(
        studentId,
        routineId,
      );
      setStarting(false);
      if (startError || !data) {
        setError(startError?.message ?? 'No se pudo iniciar la rutina.');
        return null;
      }
      return data.id;
    },
    [],
  );

  return { start, starting, error };
}
