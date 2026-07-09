import { supabase } from '../client';
import type { Exercise, NewExercise } from '../types';

/**
 * Exercises visible to a trainer: the shared global catalog (trainer_id null)
 * plus the trainer's own private exercises, alphabetical.
 */
export async function getExercises(trainerId: string) {
  return supabase
    .from('exercises')
    .select('*')
    .or(`trainer_id.is.null,trainer_id.eq.${trainerId}`)
    .order('name')
    .returns<Exercise[]>();
}

/** Create a private exercise (set `trainer_id` to the owning trainer). */
export async function createExercise(exercise: NewExercise) {
  return supabase
    .from('exercises')
    .insert(exercise)
    .select()
    .single<Exercise>();
}

/** Update an exercise's definition. */
export async function updateExercise(id: string, changes: Partial<NewExercise>) {
  return supabase
    .from('exercises')
    .update(changes)
    .eq('id', id)
    .select()
    .single<Exercise>();
}

/**
 * Delete an exercise. Fails with a foreign-key violation (code 23503) when a
 * routine still references it — callers must surface that case.
 */
export async function deleteExercise(id: string) {
  return supabase.from('exercises').delete().eq('id', id);
}
