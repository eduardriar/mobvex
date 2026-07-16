/* Mobvex Trainer — creates a student in the DB for the signed-in trainer. */
"use client";

import { useState } from "react";
import { createStudentForTrainer, getSession } from "@mobvex/db";
import type { Goal, Invitation, Student } from "@mobvex/db";
import type { GoalKey, NewStudentPayload } from "@/lib/types";

/* Recomposición has no DB value of its own yet; nearest match. */
const GOAL_TO_DB: Record<GoalKey, Goal> = {
  "Pérdida de grasa": "fat_loss",
  Hipertrofia: "hypertrophy",
  Fuerza: "force",
  Recomposición: "fat_loss",
  Mantenimiento: "maintenance",
};

export function useCreateStudent() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStudent = async ({
    name,
    email,
    goal,
  }: NewStudentPayload): Promise<{
    student: Student;
    invitation: Invitation;
  } | null> => {
    setError(null);
    setCreating(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await getSession();
      if (sessionError || !session) {
        setError("Tu sesión ha expirado. Vuelve a iniciar sesión.");
        return null;
      }

      const { data, error: createError } = await createStudentForTrainer({
        trainerId: session.user.id,
        name,
        email,
        goal: GOAL_TO_DB[goal],
      });
      if (createError) {
        setError(createError.message);
        return null;
      }
      return data;
    } finally {
      setCreating(false);
    }
  };

  return { createStudent, creating, error };
}
