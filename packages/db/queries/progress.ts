import { supabase } from '../client';
import type { NewProgress, Progress } from '../types';

/** A student's progress history, newest entry first. */
export async function getProgressByStudent(studentId: string) {
  return supabase
    .from('progress')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
    .returns<Progress[]>();
}

/**
 * Save a daily progress entry (weight, measurements, photo, calories).
 *
 * One record per student per day: upserts on `(student_id, date)`. Re-saving the
 * same day merges — only the fields present in `entry` are written, so blank
 * fields keep their previously saved value.
 */
export async function saveProgress(entry: NewProgress) {
  return supabase
    .from('progress')
    .upsert(entry, { onConflict: 'student_id,date' })
    .select()
    .single<Progress>();
}
