import { supabase } from '../client';
import type { NewRoutine, Routine, RoutineWithExercises } from '../types';

/** Active routines assigned to a student. */
export async function getRoutines(studentId: string) {
  return supabase
    .from('routines')
    .select('*')
    .eq('student_id', studentId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .returns<Routine[]>();
}

/** Active routines assigned to a student, each with its prescribed exercises. */
export async function getAssignedRoutines(studentId: string) {
  return supabase
    .from('routines')
    .select('*, routine_exercises(*, exercise:exercises(*))')
    .eq('student_id', studentId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .order('order', { referencedTable: 'routine_exercises', ascending: true })
    .returns<RoutineWithExercises[]>();
}

/** A routine with its prescribed exercises, ordered within the routine. */
export async function getRoutineById(id: string) {
  return supabase
    .from('routines')
    .select('*, routine_exercises(*, exercise:exercises(*))')
    .eq('id', id)
    .order('order', { referencedTable: 'routine_exercises', ascending: true })
    .single<RoutineWithExercises>();
}

/** Assign (create) a routine for a student. */
export async function assignRoutine(routine: NewRoutine) {
  return supabase
    .from('routines')
    .insert(routine)
    .select()
    .single<Routine>();
}
