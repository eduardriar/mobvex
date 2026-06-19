import { supabase } from '../client';
import type { Meal, NutritionPlan } from '../types';

const PLAN_SELECT =
  '*, meals(*, meal_recipes(*, recipe:recipes(*, recipe_items(*))))';

/**
 * The student's active nutrition plan with its meals, each meal's recipe options
 * and their food items. Ordered by meal / option / item position. Null when no
 * active plan exists.
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
      referencedTable: 'meals.meal_recipes.recipe.recipe_items',
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
