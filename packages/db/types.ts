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

/**
 * A reusable exercise in the catalog. Defines only what the exercise *is* —
 * prescription (sets/reps/rest/order) lives on RoutineExercise.
 *
 * `trainer_id` is null for the shared global catalog and set for a trainer's
 * own private exercise.
 */
export type Exercise = {
  id: string;
  trainer_id: string | null;
  name: string;
  muscle_group?: string;
  video_url?: string;
  created_at: string;
};

/**
 * Join row placing an exercise into a routine, carrying the prescription for
 * that routine.
 */
export type RoutineExercise = {
  id: string;
  routine_id: string;
  exercise_id: string;
  /** Position of the exercise within the routine (0-based). */
  order: number;
  sets: number;
  /** e.g. "10-12" or "to failure". */
  reps: string;
  rest_seconds: number;
  notes?: string;
};

/** A prescription row together with the catalog exercise it points to. */
export type RoutineExerciseWithExercise = RoutineExercise & {
  exercise: Exercise;
};

/** A routine together with its prescribed exercises (joined select). */
export type RoutineWithExercises = Routine & {
  routine_exercises: RoutineExerciseWithExercise[];
};

export type SessionStatus = 'active' | 'completed' | 'abandoned';

/**
 * One instance of a student performing a routine. `active` is the current
 * workout (at most one per student); completed/abandoned are kept as history.
 */
export type WorkoutSession = {
  id: string;
  student_id: string;
  routine_id: string;
  status: SessionStatus;
  started_at: string;
  completed_at?: string;
  notes?: string;
};

/**
 * One logged set within a session: actual weight, reps and effort (RIR — reps
 * in reserve). Pre-created from the routine's prescription when a session
 * starts, then filled in by the student.
 */
export type SetLog = {
  id: string;
  session_id: string;
  routine_exercise_id: string;
  /** 1-based position of the set within its exercise. */
  set_number: number;
  weight_kg?: number;
  reps?: number;
  rir?: number;
  completed: boolean;
  created_at: string;
};

/** A logged set together with the prescription/exercise it belongs to. */
export type SetLogWithExercise = SetLog & {
  routine_exercise: RoutineExerciseWithExercise;
};

/** The current active session with its routine and prescribed set logs. */
export type ActiveSession = WorkoutSession & {
  routine: Routine;
  set_logs: SetLogWithExercise[];
};

/** A student progress record for a given day. */
export type Progress = {
  id: string;
  student_id: string;
  date: string;
  weight_kg?: number;
  body_fat_pct?: number;
  /** Body measurements in centimeters. */
  chest_cm?: number;
  arm_cm?: number;
  waist_cm?: number;
  shoulder_cm?: number;
  quads_cm?: number;
  calf_cm?: number;
  glutes_cm?: number;
  photo_url?: string;
  target_calories?: number;
  achieved_calories?: number;
  notes?: string;
};

export type PhotoPose = 'front' | 'left' | 'right' | 'back';

/**
 * Metadata for one progress photo, attached to a day's Progress entry. The image
 * file lives in the `progress-photos` Storage bucket at `storage_path`.
 */
export type ProgressPhoto = {
  id: string;
  progress_id: string;
  pose: PhotoPose;
  storage_path: string;
  created_at: string;
};

/** A trainer-assigned nutrition plan (daily targets + trainer note). */
export type Nutrition = {
  id: string;
  student_id: string;
  trainer_id: string;
  name: string;
  description?: string;
  target_calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  water_ml?: number;
  start_date?: string;
  end_date?: string;
  active: boolean;
  notes?: string;
  created_at: string;
};

export type MealIcon = 'utensils' | 'droplet';
export type MealHue = 'green' | 'purple' | 'orange' | 'blue' | 'pink';

/**
 * A reusable recipe = a meal option (name + kcal). `trainer_id` is null for the
 * shared catalog and set for a trainer's private recipe.
 */
export type Recipe = {
  id: string;
  trainer_id: string | null;
  name: string;
  kcal: number;
  created_at: string;
};

/** A food line within a recipe (e.g. "Pechuga de pollo" · "200 g"). */
export type RecipeItem = {
  id: string;
  recipe_id: string;
  food: string;
  qty: string;
  order: number;
};

/** A meal slot within a plan; offers several recipe options. */
export type Meal = {
  id: string;
  nutrition_id: string;
  name: string;
  /** 24h time, e.g. "07:30". */
  time: string;
  icon: MealIcon;
  hue: MealHue;
  order: number;
  /** The student's chosen option; null falls back to the first by order. */
  selected_recipe_id?: string;
};

/** Join row: a recipe option available for a meal. */
export type MealRecipe = {
  id: string;
  meal_id: string;
  recipe_id: string;
  order: number;
};

/** A recipe with its food items (joined select). */
export type RecipeWithItems = Recipe & { recipe_items: RecipeItem[] };

/** A meal option = the join row plus its recipe and items. */
export type MealOption = MealRecipe & { recipe: RecipeWithItems };

/** A meal together with its recipe options (ordered). */
export type MealWithOptions = Meal & { meal_recipes: MealOption[] };

/** A nutrition plan with its meals and each meal's options (joined select). */
export type NutritionPlan = Nutrition & { meals: MealWithOptions[] };

/** A photo together with its progress entry's date (for date-keyed display). */
export type ProgressPhotoWithDate = ProgressPhoto & { date: string };

/** A progress photo with a resolved (signed) display URL. */
export type SignedProgressPhoto = ProgressPhoto & { url: string | null };

/** A progress entry with its attached photos (joined select). */
export type ProgressWithPhotos = Progress & { photos: ProgressPhoto[] };

/** A progress entry whose photos carry signed display URLs. */
export type ProgressWithSignedPhotos = Progress & {
  photos: SignedProgressPhoto[];
};
/**
 * Insert payloads — the shape callers provide when creating a row. The database
 * fills `id` and `created_at`, so those are omitted here.
 */
export type NewStudent = Omit<Student, 'id' | 'created_at'>;
export type NewRoutine = Omit<Routine, 'id' | 'created_at'>;
export type NewExercise = Omit<Exercise, 'id' | 'created_at'>;
export type NewRoutineExercise = Omit<RoutineExercise, 'id'>;
export type NewProgress = Omit<Progress, 'id'>;
export type NewWorkoutSession = Omit<
  WorkoutSession,
  'id' | 'started_at' | 'status' | 'completed_at'
>;
export type NewSetLog = Omit<SetLog, 'id' | 'created_at' | 'completed'>;
export type NewProgressPhoto = Omit<ProgressPhoto, 'id' | 'created_at'>;
export type NewNutrition = Omit<Nutrition, 'id' | 'created_at'>;
export type NewRecipe = Omit<Recipe, 'id' | 'created_at'>;
export type NewRecipeItem = Omit<RecipeItem, 'id'>;
export type NewMeal = Omit<Meal, 'id'>;
export type NewMealRecipe = Omit<MealRecipe, 'id'>;
