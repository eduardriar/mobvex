/* Mobvex Trainer — a student's active nutrition plan backed by the DB, with
   save-and-assign (replaces the active plan with the built one). */
"use client";

import { useCallback, useEffect, useState } from "react";
import { getNutritionPlan, getSession, saveNutritionPlan } from "@mobvex/db";
import { dietFromDb, MEAL_SLOT_META, MEAL_SLOTS } from "@/lib/data";
import { COPY } from "@/lib/copy";
import type { Diet, MealSlot } from "@/lib/types";

export function useDiet(studentId: string) {
  const [diet, setDiet] = useState<Diet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: fetchError } = await getNutritionPlan(studentId);
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setDiet(data ? dietFromDb(data) : null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void load();
  }, [load]);

  /* Persists the built plan as the student's active one. Each slot carries
     the recipe options the student can pick between (first = default); empty
     slots are skipped. Returns null on success or a user-facing Spanish
     error. */
  const save = useCallback(
    async (plan: {
      name: string;
      target: { kcal: number; p: number };
      meals: Record<MealSlot, string[]>;
    }): Promise<string | null> => {
      const {
        data: { session },
        error: sessionError,
      } = await getSession();
      if (sessionError || !session) return COPY.common.sessionExpired;

      const meals = MEAL_SLOTS.flatMap((slot) => {
        const recipeIds = plan.meals[slot];
        return recipeIds.length > 0
          ? [{ name: slot, ...MEAL_SLOT_META[slot], recipeIds }]
          : [];
      });

      const { error: saveError } = await saveNutritionPlan({
        studentId,
        trainerId: session.user.id,
        name: plan.name.trim(),
        targetCalories: plan.target.kcal,
        proteinG: plan.target.p,
        meals,
      });
      if (saveError) return saveError.message;

      await load();
      return null;
    },
    [studentId, load],
  );

  return { diet, loading, error, save, refetch: load };
}
