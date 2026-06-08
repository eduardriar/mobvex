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

/** Link a new student to a trainer. */
export async function createStudent(student: NewStudent) {
  return supabase
    .from('students')
    .insert(student)
    .select()
    .single<Student>();
}
