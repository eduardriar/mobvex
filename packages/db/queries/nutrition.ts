import { supabase } from '../client';
import type {
  Meal,
  MealHue,
  MealIcon,
  MealRecipe,
  NewMealRecipe,
  NewMealRecipeItem,
  Nutrition,
  NutritionPlan,
} from '../types';

const PLAN_SELECT =
  '*, meals(*, meal_recipes(*, recipe:recipes(*), meal_recipe_items(*)))';

/** An item line for a meal-assignment write; the meal_recipe id is filled in per call. */
export type NewMealRecipeItemLine = Omit<NewMealRecipeItem, 'meal_recipe_id'>;

/**
 * The student's active nutrition plan with its meals, each meal's recipe options
 * and their per-student food items. Ordered by meal / option / item position.
 * Null when no active plan exists.
 */
export async function getNutritionPlan(studentId: string) {
  return supabase
    .from('nutrition')
    .select(PLAN_SELECT)
    .eq('student_id', studentId)
    .eq('active', true)
    .order('order', { referencedTable: 'meals', ascending: true })
    .order('order', { referencedTable: 'meals.meal_recipes', ascending: true })
    .order('order', {
      referencedTable: 'meals.meal_recipes.meal_recipe_items',
      ascending: true,
    })
    .order('created_at', { ascending: false })
    .maybeSingle<NutritionPlan>();
}

/** Set the student's chosen recipe option for a meal. */
export async function setMealSelection(mealId: string, recipeId: string) {
  return supabase
    .from('meals')
    .update({ selected_recipe_id: recipeId })
    .eq('id', mealId)
    .select()
    .single<Meal>();
}

/**
 * One recipe option for a meal slot: its per-student portion — ingredient
 * quantities and the macros they add up to, both editable by the trainer
 * from the catalog recipe's defaults.
 */
export type PlanMealOptionInput = {
  recipeId: string;
  macros: { kcal: number; p: number; c: number; f: number };
  items: NewMealRecipeItemLine[];
};

/**
 * One meal slot for saveNutritionPlan: presentation plus the recipe options
 * the student can pick between (ordered; the first is the default selection).
 */
export type PlanMealInput = {
  name: string;
  time: string;
  icon: MealIcon;
  hue: MealHue;
  options: PlanMealOptionInput[];
};

/**
 * Save a student's nutrition plan: deactivates any currently active plan and
 * creates a new active one with a meal per input slot, each meal offering its
 * recipe options (portions copied per student) with the first pre-selected.
 * Meals without options are skipped. No transaction over PostgREST — if a
 * meal fails midway the new plan is deleted again (cascading its meals) so
 * the previous plan's data isn't half-replaced.
 */
export async function saveNutritionPlan(input: {
  studentId: string;
  trainerId: string;
  name: string;
  targetCalories?: number;
  proteinG?: number;
  meals: PlanMealInput[];
}) {
  const { error: deactivateError } = await supabase
    .from('nutrition')
    .update({ active: false })
    .eq('student_id', input.studentId)
    .eq('active', true);
  if (deactivateError) return { data: null, error: deactivateError };

  const { data: plan, error: planError } = await supabase
    .from('nutrition')
    .insert({
      student_id: input.studentId,
      trainer_id: input.trainerId,
      name: input.name,
      target_calories: input.targetCalories,
      protein_g: input.proteinG,
      active: true,
    })
    .select()
    .single<Nutrition>();
  if (planError) return { data: null, error: planError };

  const meals = input.meals.filter((meal) => meal.options.length > 0);
  for (const [index, meal] of meals.entries()) {
    const { data: createdMeal, error: mealError } = await supabase
      .from('meals')
      .insert({
        nutrition_id: plan.id,
        name: meal.name,
        time: meal.time,
        icon: meal.icon,
        hue: meal.hue,
        order: index,
        selected_recipe_id: meal.options[0]?.recipeId,
      })
      .select()
      .single<Meal>();
    if (mealError) {
      await supabase.from('nutrition').delete().eq('id', plan.id);
      return { data: null, error: mealError };
    }

    for (const [optionIndex, option] of meal.options.entries()) {
      const { error: attachError } = await attachRecipeToMeal(
        createdMeal.id,
        option.recipeId,
        optionIndex,
        option.macros,
        option.items,
      );
      if (attachError) {
        await supabase.from('nutrition').delete().eq('id', plan.id);
        return { data: null, error: attachError };
      }
    }
  }

  return { data: plan, error: null };
}

/**
 * Attach a recipe to a meal as a new option. `macros`/`items` are the
 * assignment's per-student portion — the caller seeds them from the catalog
 * recipe's defaults when first adding the option, and passes the (possibly
 * trainer-edited) current values on every subsequent save. Like createRecipe,
 * if the items insert fails the assignment row is removed so no half-written
 * option is left behind.
 */
export async function attachRecipeToMeal(
  mealId: string,
  recipeId: string,
  order: number,
  macros: { kcal: number; p: number; c: number; f: number },
  items: NewMealRecipeItemLine[],
) {
  const { data, error } = await supabase
    .from('meal_recipes')
    .insert({
      meal_id: mealId,
      recipe_id: recipeId,
      order,
      kcal: Math.round(macros.kcal),
      protein_g: Math.round(macros.p),
      carbs_g: Math.round(macros.c),
      fat_g: Math.round(macros.f),
    })
    .select()
    .single<MealRecipe>();
  if (error) return { data: null, error };

  const { error: itemsError } = await supabase
    .from('meal_recipe_items')
    .insert(items.map((item) => ({ ...item, meal_recipe_id: data.id })));
  if (itemsError) {
    await supabase.from('meal_recipes').delete().eq('id', data.id);
    return { data: null, error: itemsError };
  }

  return { data, error: null };
}

/**
 * Update an assignment's per-student macros and replace its items (delete +
 * reinsert, respecting the unique (meal_recipe_id, order) constraint). No
 * transaction over PostgREST — a mid-sequence failure is surfaced and the
 * caller's refetch shows the truth. Detaching an option needs no helper:
 * deleting the meal_recipes row cascades its items.
 */
export async function updateMealRecipe(
  id: string,
  changes: Partial<Omit<NewMealRecipe, 'meal_id' | 'recipe_id'>>,
  items: NewMealRecipeItemLine[],
) {
  const { data, error } = await supabase
    .from('meal_recipes')
    .update(changes)
    .eq('id', id)
    .select()
    .single<MealRecipe>();
  if (error) return { data: null, error };

  const { error: clearError } = await supabase
    .from('meal_recipe_items')
    .delete()
    .eq('meal_recipe_id', id);
  if (clearError) return { data: null, error: clearError };

  const { error: itemsError } = await supabase
    .from('meal_recipe_items')
    .insert(items.map((item) => ({ ...item, meal_recipe_id: id })));
  if (itemsError) return { data: null, error: itemsError };

  return { data, error: null };
}
