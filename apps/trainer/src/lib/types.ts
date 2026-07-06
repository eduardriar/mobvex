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
};

export type Diet = {
  name: string;
  target: { kcal: number; p: number };
  meals: Record<MealSlot, string | null>;
};

export type Hue = {
  solid: string;
  bg: string;
  border: string;
};
