/**
 * Static data for the student registration flow.
 *
 * The inviting trainer is resolved at runtime from the invite token (see
 * `RegisterContext`); only the display label for their role lives here, since
 * the data model stores a name but not a title/city.
 */

export type Channel = 'email' | 'whatsapp';
export type Goal = 'muscle_gain' | 'fat_loss' | 'performance' | 'general_health';

export const GOALS: { value: Goal; label: string }[] = [
  { value: 'muscle_gain', label: '💪 Ganar músculo' },
  { value: 'fat_loss', label: '🔥 Perder grasa' },
  { value: 'performance', label: '⚡ Rendimiento' },
  { value: 'general_health', label: '🧘 Salud general' },
];

// Display label for an inviting trainer's role. The data model has no
// title/city field, so the card pairs the trainer's real name with this label.
export const TRAINER_ROLE_LABEL = 'Entrenador personal';

export const OTP_LENGTH = 6;
export const RESEND_SECONDS = 60;
