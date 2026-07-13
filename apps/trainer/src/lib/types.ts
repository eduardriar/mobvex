/* Mobvex Trainer — shared data shapes. */

export type StudentStatus = "ontrack" | "attention";

export type GoalKey =
  | "Pérdida de grasa"
  | "Hipertrofia"
  | "Fuerza"
  | "Recomposición"
  | "Mantenimiento";

export type HueKey = "purple" | "blue" | "orange" | "pink" | "green";

export type DayKey = "Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb" | "Dom";

export type MealSlot = "Desayuno" | "Comida" | "Cena" | "Snack";

export type Metrics = {
  cintura: number;
  pecho: number;
  brazo: number;
};

export type Student = {
  id: string;
  name: string;
  email?: string;
  goal: GoalKey;
  since: string;
  nextSession: string;
  adherence: number;
  streak: number;
  status: StudentStatus;
  weight: number[];
  startWeight: number;
  targetWeight: number;
  bodyFat: number;
  bodyFatStart: number;
  metrics: Metrics;
  week: boolean[];
};

export type NewStudentPayload = {
  name: string;
  email: string;
  goal: GoalKey;
};

export type MuscleGroup = "Tren inferior" | "Empuje" | "Tirón" | "Core y cardio";

export type EquipmentOption =
  | "Peso corporal"
  | "Barra"
  | "Mancuerna"
  | "Máquina"
  | "Polea"
  | "Banda";

/** An exercise in the trainer's repository (Ejercicios screen). */
export type CatalogExercise = {
  id: string;
  name: string;
  muscle: MuscleGroup;
  equipment: EquipmentOption;
  hasMedia?: boolean;
};

export type NewExercisePayload = Omit<CatalogExercise, "id">;

export type Exercise = {
  name: string;
  sets: number | string;
  reps: string;
  kg: number | string;
};

export type RoutineDay = {
  focus: string;
  ex: Exercise[];
};

export type Routine = {
  name: string;
  days: Record<DayKey, RoutineDay | null>;
};

export type MealCategory = "Desayuno" | "Almuerzo" | "Cena" | "Snacks";

export type IngredientUnit =
  | "gr"
  | "ml"
  | "ud"
  | "reb"
  | "cucharada"
  | "libre";

/** One line of a recipe's ingredient list (qty in the given unit). */
export type RecipeIngredient = {
  name: string;
  qty: number;
  unit: IngredientUnit;
};

export type Macros = {
  kcal: number;
  p: number;
  c: number;
  f: number;
};

export type Recipe = {
  id: string;
  name: string;
  cat: HueKey;
  kcal: number;
  p: number;
  c: number;
  f: number;
  time: number;
  tag: string;
  meal: MealCategory;
  hasMedia?: boolean;
  ingredients?: RecipeIngredient[];
};

export type NewRecipePayload = {
  name: string;
  meal: MealCategory;
  hasMedia: boolean;
  ingredients: RecipeIngredient[];
  totals: Macros;
};

/**
 * One meal slot of a diet: the recipe options the trainer offers (ordered,
 * first = default) and the student's current pick.
 */
export type DietMeal = {
  options: string[];
  selected: string | null;
};

export type Diet = {
  name: string;
  target: { kcal: number; p: number };
  meals: Record<MealSlot, DietMeal>;
};

export type Hue = {
  solid: string;
  bg: string;
  border: string;
};
