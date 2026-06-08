# CLAUDE.md — Mobvex

This file provides Claude Code with the context, conventions, and rules needed to work effectively on the Mobvex codebase. Read this before making any changes.

For full project context (data model, navigation, design system, MVP scope), see [`MOBVEX_PROJECT.md`](./MOBVEX_PROJECT.md).

---

## What is Mobvex

White-label mobile app for personal trainers. Trainers assign workout routines to their students and monitor progress (weight, body measurements, photos, caloric goals) in real time. Replaces the traditional PDF-based routine system.

**Two user roles:**
- **Trainer** — creates routines, monitors student progress, manages their roster
- **Student** — follows their assigned routine, logs daily progress

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Monorepo   | Turborepo + pnpm workspaces       |
| Mobile     | Expo (React Native) + Expo Router |
| Backend    | Supabase (Auth + DB + Storage)    |
| Language   | TypeScript (strict mode)          |
| Navigation | Expo Router (file-based)          |

---

## Monorepo Layout

```
apps/mobile/     — iOS + Android app (Expo)
apps/web/        — [FUTURE] Next.js trainer dashboard
packages/db/     — Supabase client, types, query functions
packages/ui/     — Shared design system components and tokens
packages/utils/  — Shared validators, formatters, constants
packages/config/ — Shared tsconfig and eslint configs
```

---

## Commands

```bash
# Install dependencies
pnpm install

# Run mobile app
pnpm --filter mobile start

# Run all apps in dev mode
pnpm dev

# Build mobile for production
pnpm --filter mobile build

# Type check entire monorepo
pnpm typecheck

# Lint entire monorepo
pnpm lint
```

---

## Code Conventions

### Language
- **All file names and code must be written in English.** This covers file and directory names, identifiers (variables, functions, types, components), and code comments.
- The only exception is **user-facing copy** (UI strings shown to the user), which stays in **Spanish** — the app targets Latin America. Keep these strings in the UI/screen layer, not in identifiers or file names.

```typescript
// Correct — English identifiers, Spanish user-facing copy
function getTodayRoutine() { /* ... */ }
<Text>Rutina de hoy</Text>

// Wrong — Spanish identifiers / file names
function obtenerRutinaDeHoy() { /* ... */ }   // RutinaCard.tsx, rutinas.ts
```

### TypeScript
- Strict mode is enabled across the entire monorepo. Never use `any`.
- All shared types live in `packages/db/types.ts`. Never redefine types locally.
- Prefer `type` over `interface` for data shapes.
- All async functions must handle errors explicitly.

### Imports
- Import shared types from `@mobvex/db`
- Import UI components from `@mobvex/ui`
- Import utilities from `@mobvex/utils`
- Never import cross-app (e.g., `apps/mobile` importing from `apps/web`)

```typescript
// Correct
import { Student, Routine } from '@mobvex/db'
import { Button, Card } from '@mobvex/ui'
import { formatDate } from '@mobvex/utils'

// Wrong — never do this
import { Student } from '../../packages/db/types'
```

### Components
- Functional components only — no class components.
- One component per file. File name matches component name.
- Props must be explicitly typed with a `Props` type at the top of the file.
- No inline styles — always use `StyleSheet.create()` in React Native or tokens from `@mobvex/ui`.

```typescript
// Component structure
type Props = {
  student: Student
  onPress: () => void
}

export function StudentCard({ student, onPress }: Props) {
  // ...
}
```

### Supabase queries
- All database access goes through `packages/db/queries/`. Never call `supabase` directly inside a component.
- Always handle Supabase errors — never ignore the `error` field in responses.

```typescript
// Correct
const { data, error } = await getStudentById(id)
if (error) throw error

// Wrong
const { data } = await supabase.from('students').select('*') // direct call in component
```

### Navigation (Expo Router)
- Use typed routes: `router.push('/(trainer)/students')` not string literals.
- Route groups map to user roles: `(auth)`, `(trainer)`, `(student)`.
- Never mix trainer and student screens in the same route group.

---

## Design System Rules

All visual values come from `packages/ui/tokens.ts`. See `mobvex-design-system.md` for the full reference.

**Never hardcode colors, font sizes, or spacing.** Always use tokens.

```typescript
import { colors, spacing, radius, fonts } from '@mobvex/ui'

// Correct
backgroundColor: colors.surface

// Wrong
backgroundColor: '#111114'
```

### Critical rules
- Primary button: `#C8FF00` background, `#0A0A0B` text, Bebas Neue font — no exceptions.
- Accent color (`#C8FF00`) is used only for active states, CTAs, and positive indicators. Keep it scarce.
- `accent2` (`#FF4D6D`) is used only for errors and alerts.
- All inputs use `border: colors.border` at rest and `border: colors.accent` on focus.
- Cards always use `borderRadius: radius.card` (18px).

---

## Supabase & Auth

- Supabase client is instantiated once in `packages/db/client.ts`. Import from there.
- Auth state is managed via Supabase's `onAuthStateChange`. Never store tokens manually.
- Row Level Security (RLS) is enabled on all tables. Do not bypass it.
- After any schema change, regenerate types with:

```bash
pnpm supabase gen types typescript --project-id <project-id> > packages/db/types.ts
```

---

## Environment Variables

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=xxxx
```

- Never commit `.env` files.
- All env vars are consumed through `packages/db/client.ts`. Do not read `process.env` directly in app code.

---

## MVP Boundaries

The current focus is the MVP. Do not build outside these boundaries without explicit instruction.

**In scope:**
- Auth (login / registration)
- Routine assignment and exercise management
- Student progress logging (weight, photos, calories)
- Trainer dashboard with per-student progress view
- Basic push notifications

**Out of scope — do not implement:**
- Web dashboard (`apps/web/`)
- White-label customization (per-trainer branding)
- In-app payments
- Trainer ↔ student chat

---

## File Naming

| Type               | Convention          | Example                  |
|--------------------|---------------------|--------------------------|
| Components         | PascalCase          | `StudentCard.tsx`        |
| Screens (routes)   | kebab-case or Expo  | `new.tsx`, `[id].tsx`    |
| Utilities          | camelCase           | `formatDate.ts`          |
| Types              | PascalCase          | `Student`, `Routine`     |
| Constants          | SCREAMING_SNAKE     | `MUSCLE_GROUPS`          |

---

## What to Do When Unsure

1. Check `MOBVEX_PROJECT.md` for data model, navigation structure, and design rules.
2. Check `mobvex-design-system.md` for visual specifications.
3. Check existing patterns in `packages/ui/` before creating new components.
4. Ask before introducing a new dependency or changing the monorepo structure.