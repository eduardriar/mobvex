/* Mobvex Trainer — exercise repository backed by the DB: the global catalog
   plus the signed-in trainer's own exercises, with create/update/delete. */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createExercise,
  deleteExercise,
  getExercises,
  getSession,
  updateExercise,
} from "@mobvex/db";
import { exerciseFromDb, exercisePayloadToDb } from "@/lib/data";
import { COPY } from "@/lib/copy";
import type { CatalogExercise, NewExercisePayload } from "@/lib/types";

/* Postgres foreign-key violation — the exercise is still referenced by a
   routine (routine_exercises has onDelete: Restrict). */
const FK_VIOLATION = "23503";

async function trainerId(): Promise<string | null> {
  const {
    data: { session },
    error,
  } = await getSession();
  return error || !session ? null : session.user.id;
}

export function useExercises() {
  const [exercises, setExercises] = useState<CatalogExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const id = await trainerId();
      if (!id) {
        setError(COPY.common.sessionExpired);
        return;
      }

      const { data, error: fetchError } = await getExercises(id);
      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setExercises((data ?? []).map(exerciseFromDb));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* Mutations return null on success or a user-facing Spanish error. */

  const create = useCallback(
    async (payload: NewExercisePayload): Promise<string | null> => {
      const id = await trainerId();
      if (!id) return COPY.common.sessionExpired;

      const { error: insertError } = await createExercise(
        exercisePayloadToDb(payload, id),
      );
      if (insertError) return insertError.message;

      await load();
      return null;
    },
    [load],
  );

  const update = useCallback(
    async (
      exerciseId: string,
      payload: NewExercisePayload,
    ): Promise<string | null> => {
      const id = await trainerId();
      if (!id) return COPY.common.sessionExpired;

      const { error: updateError } = await updateExercise(exerciseId, {
        name: payload.name.trim(),
        muscle_group: payload.muscle,
        equipment: payload.equipment,
      });
      if (updateError) return updateError.message;

      await load();
      return null;
    },
    [load],
  );

  const remove = useCallback(
    async (exerciseId: string): Promise<string | null> => {
      const { error: deleteError } = await deleteExercise(exerciseId);
      if (deleteError) {
        return deleteError.code === FK_VIOLATION
          ? COPY.exercises.errors.inUse
          : deleteError.message;
      }

      await load();
      return null;
    },
    [load],
  );

  return { exercises, loading, error, refetch: load, create, update, remove };
}
