import { useCallback, useEffect, useState } from 'react';
import {
  getNutritionPlan,
  setMealSelection,
  type NutritionPlan,
} from '@mobvex/db';

type UseNutritionPlan = {
  /** The student's active plan with meals/options, or null when none. */
  plan: NutritionPlan | null;
  /** True during the initial load only. */
  loading: boolean;
  error: string | null;
  /** Re-fetch the plan. */
  reload: () => void;
  /** Persist the student's chosen option for a meal, then refresh. */
  selectMeal: (mealId: string, recipeId: string) => Promise<void>;
};

/** Loads a student's nutrition plan and updates per-meal selections. */
export function useNutritionPlan(studentId: string): UseNutritionPlan {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(
    async (initial: boolean) => {
      if (initial) setLoading(true);
      const { data, error: queryError } = await getNutritionPlan(studentId);
      if (queryError) {
        setError(queryError.message);
      } else {
        setPlan(data);
        setError(null);
      }
      if (initial) setLoading(false);
    },
    [studentId],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    getNutritionPlan(studentId).then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) setError(queryError.message);
      else setPlan(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [studentId]);

  const reload = useCallback(() => {
    void fetchPlan(false);
  }, [fetchPlan]);

  const selectMeal = useCallback(
    async (mealId: string, recipeId: string) => {
      const { error: updateError } = await setMealSelection(mealId, recipeId);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      await fetchPlan(false);
    },
    [fetchPlan],
  );

  return { plan, loading, error, reload, selectMeal };
}
