import { supabase } from '../client';
import type { NewProgress, Progress, ProgressWithPhotos } from '../types';

/** A student's progress history (with attached photos), newest entry first. */
export async function getProgressByStudent(studentId: string | null) {
  return supabase
    .from('progress')
    .select('*, photos:progress_photos(*)')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
    .returns<ProgressWithPhotos[]>();
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
