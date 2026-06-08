import { supabase } from '../client';
import type { Exercise, NewRoutine, Routine } from '../types';

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

/** A routine with its ordered exercises. */
export async function getRoutineById(id: string) {
  return supabase
    .from('routines')
    .select('*, exercises(*)')
    .eq('id', id)
    .order('order', { ascending: true, referencedTable: 'exercises' })
    .single<Routine & { exercises: Exercise[] }>();
}

/** Assign (create) a routine for a student. */
export async function assignRoutine(routine: NewRoutine) {
  return supabase
    .from('routines')
    .insert(routine)
    .select()
    .single<Routine>();
}
