/**
 * Static data for the student registration flow.
 *
 * The trainer invitation is mocked here — once auth is wired it will come from
 * the invite payload resolved in `packages/db`.
 */

export type Channel = 'email' | 'whatsapp';
export type Goal = 'muscle_gain' | 'fat_loss' | 'performance' | 'general_health';

export const GOALS: { value: Goal; label: string }[] = [
  { value: 'muscle_gain', label: '💪 Ganar músculo' },
  { value: 'fat_loss', label: '🔥 Perder grasa' },
  { value: 'performance', label: '⚡ Rendimiento' },
  { value: 'general_health', label: '🧘 Salud general' },
];

// TODO: replace with the real invitation payload once auth is wired.
export const MOCK_TRAINER = {
  name: 'Carlos Moreno',
  role: 'Entrenador personal · Bogotá',
} as const;

export const OTP_LENGTH = 6;
export const RESEND_SECONDS = 60;
