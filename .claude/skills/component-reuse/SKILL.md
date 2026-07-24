---
name: component-reuse
description: Apply whenever creating or editing a screen, form, or any UI in apps/trainer or apps/mobile. Both apps have their own shared component library — use it instead of hand-rolling markup/styles that already exist there, and add genuinely new patterns to that shared library instead of inline in a screen.
---

# Component reuse

Mobvex has **two separate, non-interchangeable** shared component
libraries — one per app. Never import one app's library into the other,
and never rebuild a component inline in a screen when the app's own
library already has it.

| App | Library | Import | Built with |
|---|---|---|---|
| `apps/mobile` (student pages) | `packages/ui` | `@mobvex/ui` | React Native primitives (`View`/`StyleSheet`), also used via `react-native-web` |
| `apps/trainer` (trainer web) | `apps/trainer/src/components/ui/` | `@/components/ui/<Name>` | Tailwind CSS classes |

They exist for the same reason and follow the same principle — different
implementation, same rule: **check the library before writing new UI.**

## apps/mobile → `@mobvex/ui`

```ts
import { Text, Button, Input, Card, Badge, Chip, Avatar, Screen, Divider, Alert } from '@mobvex/ui';
import { colors, spacing, radius, fonts, fontSizes, overlays } from '@mobvex/ui';
```

- Components: `Text`, `Button`, `Input`, `Card`, `Badge`, `Chip`, `Avatar`,
  `Screen`, `Divider`, `Alert`.
- Full component/prop spec and design tokens (`colors`, `spacing`, `radius`,
  `fonts`, `fontSizes`, `fontWeights`, `letterSpacing`, `overlays`,
  `categories`, `shadows`): `packages/ui/STYLE_GUIDE.md`.
- **Never hardcode a color, size, or spacing value** in mobile code —
  import the token. `backgroundColor: colors.surface`, not
  `backgroundColor: '#111114'`.
- Adding a new mobile-only visual variant of an EXISTING token/component
  belongs in `packages/ui`, not duplicated in `apps/mobile/components/`.

## apps/trainer → `apps/trainer/src/components/ui/`

```tsx
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
```

- Components: `Avatar`, `Badge`, `Button`, `Card`, `ChipRow`, `Divider`,
  `Input`, `LoadingIndicator`, `Modal`, `Text`.
- Styling is Tailwind utility classes reading CSS custom properties (design
  tokens), per `.claude/rules/mobvex-design-system.md` — same "never
  hardcode colors/spacing" rule as mobile, enforced via Tailwind's token
  classes (`bg-surface`, `text-muted`, `rounded-card`, …) instead of raw
  hex/px values.
- If a screen needs a visual pattern this library doesn't have yet (e.g. a
  new badge style, a new form control), add it as a new file in
  `apps/trainer/src/components/ui/` — don't build it inline in the screen
  or screen-local component folder (see the `screen-structure` skill's
  "scope check" rule: anything reusable across screens doesn't belong in a
  screen folder).

## Checklist before writing new markup

1. Which app is this? Import from that app's library only.
2. Does `Button`/`Input`/`Card`/`Badge`/`Text`/… already cover this? Use it,
   don't hand-roll an equivalent `<button>`/`<div>` with matching styles.
3. Need a variant the component doesn't support? Extend the shared
   component's props (add a variant), don't fork it into a one-off.
4. Genuinely new pattern, no existing component fits, and it's or will be
   used by more than one screen? Add it to the app's shared library, not a
   screen-local file.
5. Every color/spacing/radius/font value traces back to a design token —
   grep your diff for raw hex codes or magic pixel values before finishing.
