/**
 * Field validators for the registration flow. Each returns a Spanish error
 * message (user-facing copy) or null when the value is valid.
 *
 * These are generic enough to move to `packages/utils` once a second consumer
 * needs them; kept here for now since only registration uses them.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 7–15 digits with an optional leading "+" (loose E.164), after stripping
// common separators.
const PHONE_RE = /^\+?\d{7,15}$/;

/** A contact must be a valid email or phone number. */
export function validateContact(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Ingresa tu correo o teléfono.';
  if (EMAIL_RE.test(trimmed)) return null;
  const digits = trimmed.replace(/[\s()-]/g, '');
  if (PHONE_RE.test(digits)) return null;
  return 'Ingresa un correo o teléfono válido.';
}

export function validateName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Ingresa tu nombre.';
  if (trimmed.length < 2) return 'El nombre es muy corto.';
  return null;
}

/** Parse a numeric field, tolerating a comma decimal separator. */
function parseDecimal(value: string): number {
  return Number(value.replace(',', '.').trim());
}

export function validateWeight(value: string): string | null {
  if (!value.trim()) return 'Ingresa tu peso.';
  const n = parseDecimal(value);
  if (!Number.isFinite(n) || n < 20 || n > 400) {
    return 'Peso fuera de rango (20–400 kg).';
  }
  return null;
}

export function validateHeight(value: string): string | null {
  if (!value.trim()) return 'Ingresa tu estatura.';
  const n = parseDecimal(value);
  if (!Number.isFinite(n) || n < 80 || n > 250) {
    return 'Estatura fuera de rango (80–250 cm).';
  }
  return null;
}

/** Whole years from `date` until today. */
function ageInYears(date: Date): number {
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }
  return age;
}

/** Expects DD/MM/AAAA; checks it's a real date and a plausible age. */
export function validateBirthdate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Ingresa tu fecha de nacimiento.';

  const match = trimmed.match(/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/);
  if (!match) return 'Usa el formato DD/MM/AAAA.';

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const isReal =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  if (!isReal) return 'Fecha no válida.';

  const age = ageInYears(date);
  if (age < 10 || age > 100) return 'La edad debe estar entre 10 y 100 años.';
  return null;
}
