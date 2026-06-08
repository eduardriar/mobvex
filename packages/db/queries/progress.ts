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

/** Save a daily progress entry (weight, measurements, photo, calories). */
export async function saveProgress(entry: NewProgress) {
  return supabase
    .from('progress')
    .insert(entry)
    .select()
    .single<Progress>();
}
