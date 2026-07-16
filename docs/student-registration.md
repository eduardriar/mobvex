# Student registration flow

How a student joins Mobvex: from the trainer's invitation to a linked, active
student account in the mobile app. Registration is **invite-only** — a student
cannot sign up without a trainer's link.

## Overview

```
Trainer app                     Student
───────────                     ─────────────────────
"Nuevo alumno" form
  └─ creates invite link ──────▶ opens HTTPS landing page (browser)
     (copy / WhatsApp)           https://<trainer-app>/i/<token>
                                   └─ "Abrir la app" ──▶ deep link (mobile app)
                                 mobvex://student/register?invite=<token>
                                   1. Welcome         (invite resolves to trainer)
                                   2. Contact         (email)
                                   3. Channel         (how to receive the code)
                                   4. OTP             (6-digit verification)
                                   5. Profile         (name, weight, goal…)
                                   6. Success ────────▶ student dashboard
```

## 1. The trainer creates the invitation

In the trainer web app, **Alumnos → Nuevo alumno** (`NewStudentScreen`,
`useCreateStudent`) asks for the student's name, email and coaching goal, then
`createStudentForTrainer` (`packages/db/queries/students.ts`):

1. Inserts a `users` row (`role: 'student'`) — a placeholder profile with no
   login yet.
2. Inserts a `students` row linking it to the trainer.
3. Inserts an `invitations` row (`status: 'pending'`, bound to the student's
   email). The database generates its `token`; `expires_at` is left null for
   now, so links don't expire.

The screen then shows a shareable **HTTPS** link built by `buildInviteLink`
(`apps/trainer/src/lib/invite.ts`) from the invitation's token, plus a
"Compartir por WhatsApp" button that opens `wa.me` with a pre-filled message.
The link is HTTPS (not the app's custom scheme) because messaging apps and
email clients only linkify `http(s)://` URLs:

```
https://<trainer-app-origin>/i/<token>
```

## 1b. The landing page

`apps/trainer/src/app/i/[token]` (`InviteScreen`) is a public, student-facing
page in the trainer web app. It resolves the token with
`getInvitationByToken` and, for a usable invite (`pending`, not expired),
shows the inviting trainer and an **"Abrir la app"** CTA whose tap navigates
to the deep link built by `buildAppDeepLink`:

```
mobvex://student/register?invite=<token>
```

If the app isn't installed there's a copy-link fallback with instructions
(store links / Universal Links are future work — the app isn't published
yet). Used/revoked/expired/unknown tokens get an "ask your trainer for a new
link" message.

## 2. The student opens the deep link (Welcome)

`apps/mobile/app/student/register/index.tsx`. The invite token is read from
the **launch URL** (not router params — auth redirects strip the query
string). `RegisterContext.resolveInvite` looks the token up with
`getInvitationByToken`, which returns the invitation plus a summary of the
inviting trainer (name, avatar).

An invite is usable only while `status = 'pending'` and not past
`expires_at`. If it's invalid the flow still renders but the student cannot
complete step 5 (no `trainerId` to link to — they're told to ask their
trainer for a new link).

## 3. Contact (step 1 of the wizard)

`contact.tsx` — captures the student's email (phone is accepted by the input
but only email verification is wired). When the invite resolved, the screen
shows an "Invitación de {trainer}" badge and the trainer's card so the
student knows who invited them.

## 4. Verification channel (step 2)

`channel.tsx` — the student chooses how to receive the 6-digit code:

- **Email** — calls `signUpWithEmailOtp(email)`: Supabase Auth sends an OTP
  and will create the auth user on verification (passwordless signup).
- **WhatsApp** — shown but not wired yet; selecting it explains it's coming
  soon and asks to use email.

## 5. OTP (step 3)

`otp.tsx` — the student types the 6-digit code. `verifyEmailOtp(email, code)`
verifies it against Supabase Auth; success creates the **auth session** (and
the `auth.users` row on first verification). A resend button re-sends the
code with a cooldown (`RESEND_SECONDS`).

At this point the student is *authenticated* but has no profile or trainer
link yet.

## 6. Profile (step 4)

`profile.tsx` — collects the minimum: full name, current weight, height,
birthdate and goal ("Solo lo básico. Tu entrenador completará el resto.").
On **Crear cuenta**:

1. `claimStudentInvitation({ invitationId, name, goal })` — one atomic
   `SECURITY DEFINER` RPC (`claim_student_invitation`) that does the whole
   hand-off:
   - **adopts the trainer's placeholder** when one exists: the placeholder
     `users` row's id is updated to the auth uid (email/name refreshed), and
     `students.user_id` follows via `ON UPDATE CASCADE` — the `students` row
     keeps its id, so anything the trainer pre-assigned (routines, diets)
     stays attached. This also sidesteps the `users.email` UNIQUE constraint
     that made a second insert fail.
   - creates the profile + `students` link from scratch when there is no
     placeholder;
   - updates the goal to the student's choice and marks the invitation
     `accepted`. Idempotent — retries return the same student id.
2. Best-effort extra that never blocks onboarding:
   `saveProgress({ student_id, date: today, weight_kg })` — the weight
   entered becomes the first progress entry, so charts have a starting point
   from day one.

Height and birthdate are validated and kept in the draft but **not persisted
yet** — the current schema has no columns for them.

## 7. Success (step 5)

`success.tsx` — confirms "Cuenta creada", shows the assigned trainer's card,
and **Ir al dashboard** refreshes the auth context (so the resolved student
id is available) and lands on `/student` — routines, nutrition plan and
progress logging are live from that moment.

## Data created, in summary

| Table | Row | When |
|---|---|---|
| `invitations` | `status: 'pending'`, email-bound token | trainer creates the student |
| `auth.users` | the login (passwordless/OTP) | OTP verified (step 5) |
| `users` | placeholder becomes the real profile (id → auth uid) | profile step (claim RPC) |
| `students` | re-pointed to auth uid, goal updated | profile step (claim RPC) |
| `invitations` | `status → accepted` | profile step (claim RPC) |
| `progress` | first weight entry (today) | profile step (best effort) |

## Known gaps

- **`students.invite_token` is vestigial:** the invite link is built from
  `invitations.token`; the older `students.invite_token` column is no longer
  referenced and can be dropped in a cleanup migration.
- **WhatsApp OTP** is UI-only.
- **Height / birthdate** are collected but not stored (no schema columns).
- `getOrCreateUserProfile` / `acceptInvitation` in `packages/db` are no longer
  used by the register flow (superseded by `claimStudentInvitation`); they
  remain as general-purpose helpers.
