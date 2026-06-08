# Mobvex — Project Context

White-label platform for personal trainers. Allows trainers to assign workout routines, track student progress (measurements, photos, caloric goals) and monitor results in real time. Replaces the traditional PDF-based routine system.

**Target market:** Latin America, launching in Colombia.
**Business model:** Monthly subscription per trainer ($9 / $25 / $49 USD).
**Stack:** Turborepo + Expo (React Native) + Supabase + TypeScript.

---

## Monorepo Structure

```
mobvex/
├── turbo.json                   # Turborepo build pipeline and task config
├── package.json                 # workspaces: [apps/*, packages/*]
├── pnpm-lock.yaml
├── .env.example                 # Supabase environment variables
│
├── apps/
│   ├── mobile/                  # Mobile app — Expo + React Native (iOS + Android)
│   │   ├── app/                 # Expo Router — file-based navigation
│   │   │   ├── (auth)/          # Login, registration
│   │   │   ├── (trainer)/       # Trainer panel
│   │   │   └── (student)/       # Student views
│   │   ├── components/          # App-local components
│   │   ├── assets/              # Images, icons, fonts
│   │   ├── app.json             # Expo config: name, icons, bundle ID
│   │   └── eas.json             # Builds for TestFlight and Play Store
│   │
│   └── web/                     # [FUTURE] Next.js web dashboard for trainers
│
└── packages/
    ├── db/                      # Supabase client + types + queries
    │   ├── client.ts            # Single supabase-js instance
    │   ├── types.ts             # Global types: Student, Routine, Exercise, Progress
    │   └── queries/             # Data access functions
    │       ├── students.ts      # getStudents(), getStudentById()
    │       ├── routines.ts      # getRoutines(), assignRoutine()
    │       └── progress.ts      # saveProgress(), getProgressByStudent()
    │
    ├── ui/                      # Shared design system
    │   ├── tokens.ts            # Colors, typography, spacing
    │   ├── Button.tsx           # Primary and secondary button
    │   ├── Card.tsx             # Base card component
    │   ├── Input.tsx            # Input with accent focus state
    │   └── Badge.tsx            # Status pill / badge
    │
    ├── utils/                   # Shared helpers across apps
    │   ├── validators.ts        # Form validation
    │   ├── formatters.ts        # Dates, units, progress percentages
    │   └── constants.ts        # Muscle groups, exercise types, etc.
    │
    └── config/                  # Shared tooling configuration
        ├── tsconfig.base.json
        └── eslint.base.js
```

---

## Data Model

All types are defined in `packages/db/types.ts`. Every app imports from there — never redefine types locally.

```typescript
// Base user (trainer or student)
type User = {
  id: string
  email: string
  role: 'trainer' | 'student'
  name: string
  avatar_url?: string
  created_at: string
}

// Student linked to a trainer
type Student = {
  id: string
  trainer_id: string        // FK → User (trainer)
  user_id: string           // FK → User (student)
  goal: string              // 'weight_loss' | 'muscle_gain' | 'endurance'
  active: boolean
  created_at: string
}

// Routine assigned to a student
type Routine = {
  id: string
  student_id: string
  trainer_id: string
  name: string
  description?: string
  active: boolean
  created_at: string
}

// Exercise within a routine
type Exercise = {
  id: string
  routine_id: string
  name: string
  sets: number
  reps: string              // e.g. "10-12" or "to failure"
  rest_seconds: number
  video_url?: string
  notes?: string
  order: number
}

// Student progress record
type Progress = {
  id: string
  student_id: string
  date: string
  weight_kg?: number
  body_fat_pct?: number
  photo_url?: string
  target_calories?: number
  achieved_calories?: number
  notes?: string
}
```

---

## Navigation — Expo Router

### Student flow `apps/mobile/app/(student)/`

```
(student)/
├── index.tsx          # Home: today's routine + progress summary
├── routine/
│   ├── index.tsx      # Exercise list for the active routine
│   └── [id].tsx       # Exercise detail (description + video)
├── progress/
│   ├── index.tsx      # Progress history
│   └── new.tsx        # Log entry: weight, measurements, photo, calories
└── profile.tsx        # Student info and goal
```

### Trainer flow `apps/mobile/app/(trainer)/`

```
(trainer)/
├── index.tsx          # Dashboard: student list + overall status
├── students/
│   ├── index.tsx      # Active students list
│   ├── [id].tsx       # Student profile + progress history
│   └── new.tsx        # Add student
└── routines/
    ├── index.tsx      # Created routines list
    ├── [id].tsx       # Routine detail + edit
    └── new.tsx        # Create routine with exercises
```

### Auth `apps/mobile/app/(auth)/`

```
(auth)/
├── login.tsx          # Email + password via Supabase Auth
└── register.tsx       # New user registration
```

---

## Design System

Defined in `packages/ui/tokens.ts`. Based on `mobvex-design-system.md`. Never hardcode design values — always import from tokens.

```typescript
export const colors = {
  bg:       '#0A0A0B',   // App background
  surface:  '#111114',   // Cards, modals
  surface2: '#18181C',   // Inputs, chips
  border:   '#2A2A30',   // Resting borders
  text:     '#F0F0F0',   // Primary text
  muted:    '#6B6B78',   // Secondary text
  accent:   '#C8FF00',   // CTA, progress, active state
  accent2:  '#FF4D6D',   // Errors, alerts
}

export const fonts = {
  display: 'BebasNeue',  // Titles, brand, primary button
  body:    'DMSans',     // All functional content
}

export const spacing = {
  xs:  8,
  sm:  14,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
}

export const radius = {
  input: 14,
  card:  18,
}
```

### Component rules

| Component        | Background                  | Border                      | Text                     |
|------------------|-----------------------------|-----------------------------|--------------------------|
| Primary button   | `#C8FF00`                   | —                           | `#0A0A0B` Bebas Neue     |
| Secondary button | `transparent`               | `#2A2A30`                   | `#6B6B78`                |
| Input (resting)  | `#18181C`                   | `#2A2A30`                   | `#F0F0F0`                |
| Input (focused)  | `#18181C`                   | `#C8FF00`                   | `#F0F0F0`                |
| Card             | `#18181C`                   | `#2A2A30`                   | `#F0F0F0`                |
| Card (active)    | `rgba(200,255,0,0.08)`      | `rgba(200,255,0,0.30)`      | `#C8FF00`                |
| Badge / pill     | `rgba(200,255,0,0.10)`      | `rgba(200,255,0,0.30)`      | `#C8FF00`                |
| Alert            | `rgba(255,77,109,0.10)`     | `rgba(255,77,109,0.25)`     | `#FF4D6D`                |

---

## Supabase — Database Tables

```sql
users        -- managed by Supabase Auth + extended public profile table
students     -- trainer → student relationship
routines     -- routines assigned to a student
exercises    -- exercises within a routine
progress     -- student progress records
```

Row Level Security (RLS) enabled on all tables:
- Trainers can only see their own students and routines.
- Students can only see their own data and their assigned routine.

---

## Environment Variables

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=xxxx
```

Defined in `.env.example` at the repo root. All apps consume them through `packages/db/client.ts`.

---

## MVP Scope

The MVP is validated with **one trainer** and **5–8 real students** in Colombia.

**In scope:**
- Auth (login / registration)
- Routine assignment with exercises
- Student progress logging (weight, photos, calories)
- Trainer dashboard with per-student progress view
- Basic push notifications (Expo Notifications)

**Out of scope:**
- Web dashboard (`apps/web/`)
- Self-service white-label customization (logo/colors per trainer)
- In-app payments and subscription management
- Trainer ↔ student chat

---

## Key Decisions

- **pnpm** as package manager — better monorepo support than npm/yarn
- **Expo Router** for navigation — file-based, more maintainable than manual React Navigation
- **Supabase** over Firebase — PostgreSQL, native RLS, open source, more control long-term
- **Strict TypeScript** across the entire monorepo from day one
- All visual design follows `mobvex-design-system.md` without exceptions