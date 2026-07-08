---
name: screen-structure
description: Apply whenever creating, building, or refactoring a screen (e.g. "implement the X screen", "add a new screen/view/tab") or when a screen file is about to hold more than one component. Defines the screen-folder convention — entry file plus a kebab-case folder with components/ and per-flow subfolders — used in apps/trainer/src/components/screens/.
---

# Screen structure

Every screen is **one entry file plus a sibling kebab-case folder** holding
everything private to that screen. Never stack multiple components in the
screen file — the moment a second component appears, it gets its own file
inside the screen's folder.

Canonical examples (in `apps/trainer/src/components/screens/`):
`auth-screen/` (multi-flow) and `exercises-screen/` (single-flow).

## Layout

```
components/screens/
├── ExercisesScreen.tsx            ← entry: state + layout ONLY
└── exercises-screen/              ← kebab-case of the entry name
    └── components/                ← sub-components private to this screen
        ├── ExerciseForm.tsx
        ├── ExerciseTile.tsx
        └── ChipRow.tsx
```

When a screen has distinct flows (steps, modes), each flow gets its own
subfolder with its own `components/` as needed:

```
components/screens/
├── AuthScreen.tsx                 ← entry: switches between flows
└── auth-screen/
    ├── components/                ← shared across flows (FormShell, BrandPanel)
    ├── login/LoginFlow.tsx
    └── register/
        ├── RegistrationFlow.tsx
        └── components/StepDots.tsx  ← private to the register flow
```

## Rules

1. **Entry file** stays directly in `screens/` as `<Name>Screen.tsx` (or
   `<Name>Builder.tsx`). It owns screen state, data calls, and top-level
   layout, and is what `app/page.tsx` imports.
2. **Folder name** is the kebab-case of the entry file: `ExercisesScreen.tsx`
   → `exercises-screen/`. Sub-components go in `<screen-folder>/components/`.
3. **One component per file**, file named after the component (PascalCase),
   each with its own `Props` type at the top. Helpers used by exactly one
   component may stay in that component's file only if trivial (a `cn` string,
   a constant) — any rendered component splits out.
4. **Imports**: the entry imports relatively
   (`./exercises-screen/components/ExerciseForm`); files inside the folder
   import siblings relatively (`./ChipRow`, `../components/FormShell`) and
   everything shared via `@/` (`@/components/ui/Button`, `@/lib/copy`).
5. **Scope check before creating**: if a component is (or becomes) used by
   more than one screen, it does not belong in a screen folder — move it to
   `components/ui/` (primitive) or `components/trainer/` (domain widget).
6. **No screen-to-screen imports**: a screen folder is private; another screen
   must never reach into it. Shared = promoted (rule 5).
7. **User-facing strings** never live in components — they go in the global
   copy registry `src/lib/copy.ts` under the screen's key (see the
   `exercises` section there for the shape).

## When asked to build a new screen

1. Create the entry `<Name>Screen.tsx` in `screens/`.
2. As soon as the design implies a second component (form, tile, row, chip,
   modal content…), create `screens/<name>-screen/components/` and put it
   there — don't write it inline first and split later.
3. Multi-step or multi-mode screens: one subfolder per flow, entry file only
   switches between flows.
4. Add the screen's strings to `src/lib/copy.ts` before writing JSX.

## When refactoring an existing overloaded screen file

Split it exactly as above (this was done for `ExercisesScreen.tsx` — use that
diff as the reference): move each component to its own file under the new
folder, keep the entry's behavior identical (pure file split), then verify
with `pnpm --filter trainer exec tsc --noEmit && pnpm --filter trainer lint`.
