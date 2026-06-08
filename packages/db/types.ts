/**
 * Global data model for Mobvex. Every app imports these types from `@mobvex/db`
 * — never redefine them locally.
 *
 * NOTE: once the Supabase project exists, this file is regenerated with:
 *   pnpm supabase gen types typescript --project-id <id> > packages/db/types.ts
 * Until then these are hand-authored from the documented schema.
 */

export type Role = 'trainer' | 'student';

export type Goal = 'weight_loss' | 'muscle_gain' | 'endurance';

/** Base user — a trainer or a student. Extends the Supabase Auth user. */
export type User = {
  id: string;
  email: string;
  role: Role;
  name: string;
  avatar_url?: string;
  created_at: string;
};

/** A student linked to a trainer. */
export type Student = {
  id: string;
  trainer_id: string;
  user_id: string;
  goal: Goal;
  active: boolean;
  created_at: string;
};

/** A routine assigned to a student. */
export type Routine = {
  id: string;
  student_id: string;
  trainer_id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
};

/** An exercise within a routine. */
export type Exercise = {
  id: string;
  routine_id: string;
  name: string;
  sets: number;
  /** e.g. "10-12" or "to failure". */
  reps: string;
  rest_seconds: number;
  video_url?: string;
  notes?: string;
  order: number;
};

/** A student progress record for a given day. */
export type Progress = {
  id: string;
  student_id: string;
  date: string;
  weight_kg?: number;
  body_fat_pct?: number;
  photo_url?: string;
  target_calories?: number;
  achieved_calories?: number;
  notes?: string;
};

/**
 * Insert payloads — the shape callers provide when creating a row. The database
 * fills `id` and `created_at`, so those are omitted here.
 */
export type NewStudent = Omit<Student, 'id' | 'created_at'>;
export type NewRoutine = Omit<Routine, 'id' | 'created_at'>;
export type NewExercise = Omit<Exercise, 'id'>;
export type NewProgress = Omit<Progress, 'id'>;
