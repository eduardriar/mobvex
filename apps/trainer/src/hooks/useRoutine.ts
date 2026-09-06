/* Mobvex Trainer — a student's active weekly routine backed by the DB, with
   save-and-assign (replaces the active plan with the built one). */
"use client";

import { useCallback, useEffect, useState } from "react";
import { getAssignedRoutines, getSession, saveRoutinePlan } from "@mobvex/db";
import { routinePlanToDb, routinesFromDb } from "@/lib/data";
import { COPY } from "@/lib/copy";
import type { Routine } from "@/lib/types";

export function useRoutine(studentId: string) {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: fetchError } = await getAssignedRoutines(studentId);
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setRoutine(data && data.length > 0 ? routinesFromDb(data) : null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void load();
  }, [load]);

  /* Persists the built plan: one active routine per active day, replacing
     whatever was active before. Returns null on success or a user-facing
     Spanish error. */
  const save = useCallback(
    async (plan: Routine): Promise<string | null> => {
      const {
        data: { session },
        error: sessionError,
      } = await getSession();
      if (sessionError || !session) return COPY.common.sessionExpired;

      const { error: saveError } = await saveRoutinePlan({
        studentId,
        trainerId: session.user.id,
        days: routinePlanToDb(plan),
      });
      if (saveError) return saveError.message;

      await load();
      return null;
    },
    [studentId, load],
  );

  return { routine, loading, error, save, refetch: load };
}
