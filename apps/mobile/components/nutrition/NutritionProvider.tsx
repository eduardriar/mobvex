import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  getNutritionPlan,
  setMealSelection,
  type MealOption,
  type MealWithOptions,
  type NutritionPlan,
} from '@mobvex/db';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * App-wide nutrition plan state, shared by the home dashboard, the Dieta tab,
 * and the meal picker so they read one fetch instead of each fetching
 * independently.
 */
type NutritionContextValue = {
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

const NutritionContext = createContext<NutritionContextValue | null>(null);

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const { studentId } = useAuth();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadSeq = useRef(0);

  const fetchPlan = useCallback(
    async (initial: boolean) => {
      if (!studentId) {
        setPlan(null);
        setLoading(false);
        return;
      }
      const seq = (loadSeq.current += 1);
      if (initial) setLoading(true);
      const { data, error: queryError } = await getNutritionPlan(studentId);
      if (seq !== loadSeq.current) return;
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
    void fetchPlan(true);
  }, [fetchPlan]);

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

  return (
    <NutritionContext.Provider value={{ plan, loading, error, reload, selectMeal }}>
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutritionPlan(): NutritionContextValue {
  const ctx = useContext(NutritionContext);
  if (!ctx) {
    throw new Error('useNutritionPlan must be used within a NutritionProvider');
  }
  return ctx;
}

/** The student's chosen option for a meal, falling back to the first by order. */
export function getSelectedMealOption(meal: MealWithOptions): MealOption | undefined {
  return (
    meal.meal_recipes.find((mr) => mr.recipe_id === meal.selected_recipe_id) ??
    meal.meal_recipes[0]
  );
}
