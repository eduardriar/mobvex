---
name: copy-registry
description: Apply whenever creating or editing a component, screen, or any UI that renders user-facing text (labels, titles, placeholders, buttons, errors, empty states). All strings go in the app's global copy file (e.g. apps/trainer/src/lib/copy.ts), never hardcoded in JSX — create the copy file if the app doesn't have one yet.
---

# Copy registry

Every user-facing string lives in the app's **global copy file**, grouped by
screen/feature. Components never hardcode text in JSX — they read it from the
registry. Canonical example: `apps/trainer/src/lib/copy.ts`.

## Where the copy file lives (one per app)

| App            | Copy file                        |
|----------------|----------------------------------|
| `apps/trainer` | `src/lib/copy.ts` (exists)       |
| `apps/mobile`  | `lib/copy.ts` (create on first use — no `src/` in this app) |
| future apps    | `<app>/src/lib/copy.ts`          |

If the file doesn't exist in the app you're touching, **create it** with the
same shape as the trainer's, plus its header comment.

## Shape

```typescript
/* Mobvex <App> — global user-facing copy (Spanish).
   Single source for every UI string, grouped by screen. Components never
   hardcode user-facing text; they read it from here. */

export const COPY = {
  exercises: {                       // one key per screen/feature, camelCase
    title: "Ejercicios",
    subtitle: "Biblioteca de ejercicios disponibles",
    repositoryCount: (n: number) =>  // dynamic text = function, handle plurals
      n === 1
        ? "1 ejercicio en el repositorio"
        : `${n} ejercicios en el repositorio`,
    newExercise: "Nuevo ejercicio",
    form: {                          // nest by sub-area (form, modal, empty…)
      createTitle: "Crear ejercicio",
      namePlaceholder: "Ej. Press inclinado",
      cancel: "Cancelar",
    },
  },
} as const;
```

## Rules

1. **Language**: string *values* are Spanish (the product targets Latin
   America); *keys* and everything else are English. Per CLAUDE.md.
2. **Scope**: only user-visible text — labels, titles, subtitles,
   placeholders, button captions, tooltips (`title=`), badges, hints, error
   and empty-state messages, `alt` text. Not: log messages, ids, route paths,
   CSS values, or icon names.
3. **Grouping**: one top-level key per screen/feature (matching the screen's
   name, e.g. `exercises` for `ExercisesScreen`); nest one level for sub-areas
   (`form`, `modal`, `emptyState`). Shared cross-screen strings go under a
   `common` key.
4. **Dynamic text** is a function on the object — interpolation and plural
   rules live in the copy file, not in the component:
   `groupCount: (n: number) => (n === 1 ? "1 ejercicio" : \`${n} ejercicios\`)`.
5. **Consumption**: import `COPY` and alias the screen's section once at
   module top — then reference `T.…` in JSX:

   ```typescript
   import { COPY } from "@/lib/copy";

   const T = COPY.exercises;
   // …
   <Button>{T.newExercise}</Button>
   ```

6. **Keep `as const`** so keys autocomplete and values stay literal types.
7. **Editing existing components**: if you touch a component that has
   hardcoded strings in the area you're changing, migrate those strings to the
   copy file as part of the change (don't leave the file half-migrated within
   one component).

## Checklist when creating a component

1. Does the app have a copy file? If not, create it (table above).
2. Add/extend the screen's section with every string the component renders,
   before writing the JSX.
3. In the component: no string literals inside JSX text or user-visible
   attributes — grep your diff for Spanish text to confirm.
4. Verify: `pnpm --filter <app> exec tsc --noEmit`.
