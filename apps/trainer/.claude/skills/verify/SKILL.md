---
name: verify
description: How to run and drive the trainer app end-to-end for verification — launch, headless-browser login with a disposable trainer, and gotchas.
---

# Verifying apps/trainer end-to-end

## Launch

```bash
cd apps/trainer && pnpm dev        # Next.js on http://localhost:3001
```

## Drive the UI headlessly

Playwright is NOT a repo dependency — install `playwright-core` in a scratch
dir and launch with the system Chrome:

```js
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
```

Login form selectors: `input[type=email]`, `input[type=password]`, button
`Entrar`. After login the roster shows "Mis alumnos"; sidebar nav items are
text buttons (`Ejercicios`, `Dietas`).

**Selector gotcha:** `page.locator('div').filter({ has: … })` matches every
ancestor div, so `.last()` on buttons inside it clicks the last button on the
page, not the one in the intended card. Scope to the card first:
`page.locator('div.rounded-card').filter({ has: page.getByText(name, { exact: true }) }).last()`.
When editing via a modal, assert the loaded value
(`getByPlaceholder(…).inputValue()`) before typing.

## Getting a session (auth has email confirmation ON)

Registration can't be completed headlessly and there is no service-role key.
With user authorization, create a disposable trainer directly (tsx script in
`packages/db`, Prisma `$executeRawUnsafe`):

1. INSERT into `auth.users` (instance_id `00000000-…`, aud/role
   `authenticated`, `encrypted_password = crypt(pw, gen_salt('bf'))`,
   `email_confirmed_at = now()`, app_meta `{"provider":"email","providers":["email"]}`)
   — **and set all token columns to `''`, not NULL** (`confirmation_token`,
   `recovery_token`, `email_change`, `email_change_token_new`,
   `email_change_token_current`, `phone_change`, `phone_change_token`,
   `reauthentication_token`), or every login 500s with
   "Database error querying schema".
2. INSERT matching `auth.identities` row (provider `email`, `provider_id` =
   user id, identity_data with sub/email).
3. INSERT `public.users` row (same id, role `trainer`).
4. Tear down afterwards: delete the trainer's `public.exercises`,
   `public.users`, `auth.identities`, `auth.users` rows.

Use a clearly-synthetic email (`claude-verify@test.mobvex.local`) and a fixed
UUID so teardown is deterministic.

## Data layer without a session

RLS on most tables (exercises, routines…) is still dev-open, so the
`@mobvex/db` query functions can be driven directly with the anon key: tsx
script inside `packages/db` importing `./index`, loading `packages/db/.env`
manually before the import (client.ts reads env at import time).

## Flows worth driving

- Ejercicios: catalog grouped by the 4 Spanish muscle buckets; create →
  count bumps + survives reload; edit; delete own; delete a seeded exercise
  referenced by a routine → 409/23503 → Spanish "en uso" error inside the
  modal (seeded routines reference most catalog rows, so this is easy to hit).
- Reset catalog data anytime with `pnpm --filter @mobvex/db db:seed`
  (upserts by name — if a seeded exercise was *renamed* during testing,
  restore it by id first or the seed will duplicate it).
