/**
 * Mock data for the student dashboard.
 *
 * TODO: replace every export here with `packages/db` queries once the backend
 * is wired. Shapes are intentionally close to the future DB types.
 */
import type { CategoryHue } from '@mobvex/ui';

export type ExpressRoutine = {
  id: string;
  time: string;
  icon: string;
  hue: CategoryHue;
  name: string;
  meta: string;
};

export type Recipe = {
  id: string;
  emoji: string;
  hue: CategoryHue;
  name: string;
  tags: string[];
};

export type Tip = {
  id: string;
  icon: string;
  hue: CategoryHue;
  title: string;
  text: string;
};

export const STUDENT = { name: 'Juan', initials: 'JP' } as const;

export const TRAINER = {
  name: 'Carlos Moreno',
  role: 'Entrenador personal',
  initials: 'CM',
} as const;

export const STATS = [
  { value: '12', sup: 'sem', label: 'en entrenamiento', accent: false },
  { value: '38', sup: undefined, label: 'sesiones completadas', accent: true },
  { value: '−3', sup: 'kg', label: 'desde el inicio', accent: false },
] as const;

export const TODAY_ROUTINE = {
  day: 'Lunes · Día A',
  name: 'EMPUJE +\nHOMBROS',
  meta: '6 ejercicios · ~55 min estimado',
  chips: ['Pecho', 'Hombros', 'Tríceps'],
  status: 'Sin iniciar',
} as const;

export const EXPRESS_ROUTINES: ExpressRoutine[] = [
  { id: 'core', time: '15', icon: '⚡', hue: 'green', name: 'Core Activación', meta: '4 ejercicios · sin equipo' },
  { id: 'hiit', time: '20', icon: '🔥', hue: 'orange', name: 'HIIT Total Body', meta: '6 ejercicios · sin equipo' },
  { id: 'mobility', time: '10', icon: '🧘', hue: 'blue', name: 'Movilidad AM', meta: '5 ejercicios · sin equipo' },
  { id: 'upper', time: '25', icon: '💪', hue: 'purple', name: 'Tren superior', meta: '5 ejercicios · mancuernas' },
];

export const RECIPES: Recipe[] = [
  { id: 'bowl', emoji: '🥗', hue: 'orange', name: 'Bowl proteico de pollo', tags: ['480 kcal', '42g prot'] },
  { id: 'shake', emoji: '🥤', hue: 'green', name: 'Batido post-entreno', tags: ['310 kcal', '35g prot'] },
  { id: 'omelette', emoji: '🍳', hue: 'blue', name: 'Omelette de claras', tags: ['220 kcal', '28g prot'] },
  { id: 'oats', emoji: '🍫', hue: 'purple', name: 'Overnight oats proteicos', tags: ['390 kcal', '30g prot'] },
];

export const TIPS: Tip[] = [
  {
    id: 'hydration',
    icon: '💧',
    hue: 'green',
    title: 'Hidratación antes del entreno',
    text: 'Toma 500ml de agua 30 min antes para optimizar el rendimiento muscular.',
  },
  {
    id: 'rest',
    icon: '😴',
    hue: 'orange',
    title: 'El descanso es entrenamiento',
    text: 'El músculo crece mientras duermes. 7–9h de sueño es parte del plan.',
  },
  {
    id: 'rir',
    icon: '🎯',
    hue: 'blue',
    title: 'RIR y progresión de carga',
    text: 'Si tu RIR es 3 o más en todas las series, es momento de subir el peso.',
  },
];

/** Time-of-day greeting for the dashboard header. */
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Buenos días,';
  if (h < 19) return 'Buenas tardes,';
  return 'Buenas noches,';
}
