import { supabase } from '../client';
import type { NewStudent, Student } from '../types';

/** Active students belonging to a trainer, newest first. */
export async function getStudents(trainerId: string) {
  return supabase
    .from('students')
    .select('*')
    .eq('trainer_id', trainerId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .returns<Student[]>();
}

/** A single student by id. */
export async function getStudentById(id: string) {
  return supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single<Student>();
}

/**
 * The student profile linked to an auth user, or null when none exists (e.g. a
 * trainer, or a user who has not completed onboarding). Uses `maybeSingle` so a
 * missing row is not treated as an error.
 */
export async function getStudentByUserId(userId: string) {
  return supabase
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<Student>();
}

/** Link a new student to a trainer. */
export async function createStudent(student: NewStudent) {
  return supabase
    .from('students')
    .insert(student)
    .select()
    .single<Student>();
}
