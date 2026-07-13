import { supabase } from '../client';
import type { NewRecipe, NewRecipeItem, Recipe, RecipeWithItems } from '../types';

const RECIPE_SELECT = '*, recipe_items(*)';

/** An item line for a recipe write; the recipe id is filled in per call. */
export type NewRecipeItemLine = Omit<NewRecipeItem, 'recipe_id'>;

/**
 * Recipes visible to a trainer: the shared catalog (trainer_id null) plus the
 * trainer's own private recipes, alphabetical, with their food items.
 */
export async function getRecipes(trainerId: string) {
  return supabase
    .from('recipes')
    .select(RECIPE_SELECT)
    .or(`trainer_id.is.null,trainer_id.eq.${trainerId}`)
    .order('name')
    .order('order', { referencedTable: 'recipe_items', ascending: true })
    .returns<RecipeWithItems[]>();
}

/**
 * Create a private recipe with its items (set `trainer_id` to the owning
 * trainer). Two inserts — if the items insert fails, the recipe header is
 * removed again so no orphan recipes are left behind.
 */
export async function createRecipe(recipe: NewRecipe, items: NewRecipeItemLine[]) {
  const { data, error } = await supabase
    .from('recipes')
    .insert(recipe)
    .select()
    .single<Recipe>();
  if (error) return { data: null, error };

  const { error: itemsError } = await supabase
    .from('recipe_items')
    .insert(items.map((item) => ({ ...item, recipe_id: data.id })));
  if (itemsError) {
    await supabase.from('recipes').delete().eq('id', data.id);
    return { data: null, error: itemsError };
  }

  return { data, error: null };
}

/**
 * Update a recipe and replace its items (delete + reinsert, respecting the
 * unique (recipe_id, order) constraint). No transaction over PostgREST — a
 * mid-sequence failure is surfaced and the caller's refetch shows the truth.
 */
export async function updateRecipe(
  id: string,
  changes: Partial<NewRecipe>,
  items: NewRecipeItemLine[],
) {
  const { data, error } = await supabase
    .from('recipes')
    .update(changes)
    .eq('id', id)
    .select()
    .single<Recipe>();
  if (error) return { data: null, error };

  const { error: clearError } = await supabase
    .from('recipe_items')
    .delete()
    .eq('recipe_id', id);
  if (clearError) return { data: null, error: clearError };

  const { error: itemsError } = await supabase
    .from('recipe_items')
    .insert(items.map((item) => ({ ...item, recipe_id: id })));
  if (itemsError) return { data: null, error: itemsError };

  return { data, error: null };
}

/**
 * Delete a recipe (items cascade). Fails with a foreign-key violation (code
 * 23503) while a nutrition plan references it via meal_recipes — callers must
 * surface that case.
 */
export async function deleteRecipe(id: string) {
  return supabase.from('recipes').delete().eq('id', id);
}
