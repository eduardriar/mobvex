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

export type Tip = {
  id: string;
  icon: string;
  hue: CategoryHue;
  title: string;
  text: string;
};

export const EXPRESS_ROUTINES: ExpressRoutine[] = [
  { id: 'core', time: '15', icon: '⚡', hue: 'green', name: 'Core Activación', meta: '4 ejercicios · sin equipo' },
  { id: 'hiit', time: '20', icon: '🔥', hue: 'orange', name: 'HIIT Total Body', meta: '6 ejercicios · sin equipo' },
  { id: 'mobility', time: '10', icon: '🧘', hue: 'blue', name: 'Movilidad AM', meta: '5 ejercicios · sin equipo' },
  { id: 'upper', time: '25', icon: '💪', hue: 'purple', name: 'Tren superior', meta: '5 ejercicios · mancuernas' },
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
