# Mobvex — Style Guide

Developer-facing reference for the design tokens in [`src/tokens.ts`](./src/tokens.ts),
which is the **single source of truth**. Never hardcode colors, sizes, or spacing
in components — import from `@mobvex/ui` (`colors`, `fonts`, `fontSizes`,
`spacing`, `radius`, …). If a value here disagrees with `tokens.ts`, the code wins.

```ts
import { colors, spacing, radius, fonts } from '@mobvex/ui';

backgroundColor: colors.surface   // correct
backgroundColor: '#111114'        // wrong
```

---

## Colors

### Base palette (`colors`)

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0A0A0B` | App background — the canvas |
| `surface` | `#111114` | First-level surfaces (cards, modals) |
| `surface2` | `#18181C` | Second-level surfaces (inputs, chips) |
| `border` | `#2A2A30` | Resting component borders |
| `text` | `#F0F0F0` | Primary text, titles, active labels |
| `muted` | `#6B6B78` | Secondary text, placeholders, hints |
| `accent` | `#C8FF00` | Primary accent: CTAs, progress, active selection, positive status |
| `accent2` | `#FF4D6D` | Secondary accent: errors, alerts, warnings |
| `onAccent` | `#0A0A0B` | Text/icons sitting on top of the solid accent fill |

Layer hierarchy: `bg #0A0A0B` → `surface #111114` → `surface2 #18181C` → `border #2A2A30`.

The neon `accent` is a **signal** — use it only where the user must act or where
information is positive. Its scarcity is its power. Never use `accent` on light
surfaces. `accent2` is reserved for errors and alerts.

### Translucent accent overlays (`overlays`)

Prefer these over solid fills for active/highlight backgrounds and soft borders.

| Token | Value | Use |
|---|---|---|
| `accentCardBg` | `rgba(200, 255, 0, 0.08)` | Active card background |
| `accentCardBorder` | `rgba(200, 255, 0, 0.30)` | Active card / icon border |
| `accentIconBg` | `rgba(200, 255, 0, 0.12)` | Avatar / icon background |
| `accentIconBorder` | `rgba(200, 255, 0, 0.30)` | Avatar / icon border |
| `accentBadgeBg` | `rgba(200, 255, 0, 0.10)` | Badge / pill background |
| `accentGlow` | `rgba(200, 255, 0, 0.06)` | Ambient container glow |
| `alertBg` | `rgba(255, 77, 109, 0.10)` | Alert background |
| `alertBorder` | `rgba(255, 77, 109, 0.25)` | Alert border |

### Category hues (`categories`)

Decorative only — for category icons and recipe thumbnails on the dashboard.
**Never** use these for CTAs, text, or status; the neon accent stays the single
signal color. Each hue exposes `solid` (glyph), `bg` / `border` (container at
0.12 / 0.30), and `tint` (faint thumbnail wash ~0.06).

| Hue | `solid` |
|---|---|
| `green` | `#C8FF00` (= accent) |
| `purple` | `#7850FF` |
| `orange` | `#FF8C00` |
| `blue` | `#32A0FF` |
| `pink` | `#FF4D6D` (= accent2) |

---

## Typography

### Families (`fonts`)

| Role | Token | Family | Use |
|---|---|---|---|
| Display | `fonts.display` | `BebasNeue` | Titles, brand, primary buttons — what you *shout* |
| Body | `fonts.body` | `DMSans` | All functional content — what you *whisper* |

Never mix roles: Bebas Neue for brand/action, DM Sans for information/context.
Bebas Neue is not used for body text or secondary labels.

### Sizes (`fontSizes`)

| Token | px | Typical use |
|---|---|---|
| `logo` | 42 | Brand / logo |
| `screenTitle` | 36 | Screen title (display) |
| `displaySubtitle` | 28 | Display subtitle |
| `buttonPrimary` | 20 | Primary button label (display) |
| `input` | 16 | Input text / placeholder / body |
| `subtitle` | 15 | Screen subtitle / card name |
| `link` | 14 | Inline link |
| `chip` | 13 | Chip / selector, hint |
| `cardRole` | 12 | Card role text, footnote |
| `label` | 11 | Field label (uppercase), badge |

### Weights (`fontWeights`)

| Token | Value |
|---|---|
| `light` | `300` |
| `regular` | `400` |
| `medium` | `500` |

### Letter spacing (`letterSpacing`)

| Token | Value | Use |
|---|---|---|
| `logo` | 2 | Logo / brand |
| `title` | 1 | Screen / display titles |
| `button` | 2 | Primary button label |
| `label` | 1.5 | Uppercase field labels |
| `none` | 0 | Default |

### Text variants

Use the `Text` component's `variant` prop (from `@mobvex/ui`) instead of building
type styles by hand. Available variants:

| Variant | Spec |
|---|---|
| `logo` | Bebas 42, spacing 2, `text` |
| `title` | Bebas 36, spacing 1, `text` |
| `displaySubtitle` | Bebas 28, spacing 1, `text` |
| `subtitle` | DM Sans 15, regular, `muted` |
| `body` | DM Sans 16, regular, `text` |
| `label` | DM Sans 11, medium, spacing 1.5, uppercase, `muted` |
| `cardName` | DM Sans 15, medium, `text` |
| `cardRole` | DM Sans 12, regular, `muted` |
| `badge` | DM Sans 11, medium, `accent` |
| `hint` | DM Sans 13, regular, `accent2` |
| `footnote` | DM Sans 12, regular, `muted` |
| `link` | DM Sans 14, regular, `accent` |

---

## Spacing & radius

### Spacing (`spacing`)

| Token | px | Typical use |
|---|---|---|
| `xs` | 8 | Gap between small elements |
| `sm` | 14 | Gap between components in a section |
| `md` | 16 | Inner padding of inputs and chips |
| `lg` | 24 | Screen horizontal padding |
| `xl` | 32 | Separation between sections |
| `xxl` | 48 | Top padding on landing screens |

### Radius (`radius`)

| Token | px | Use |
|---|---|---|
| `input` | 14 | Inputs and buttons |
| `card` | 18 | Cards |
| `badge` | 8 | Badges / pills |
| `device` | 40 | App container (device frame) |
| `full` | 9999 | Pills / circular avatars |

### Effects (`shadows`)

| Token | Spec |
|---|---|
| `containerGlow` | `shadowColor: accent`, offset `0,0`, opacity `0.06`, radius `80` — ambient depth for the app container |

---

## Component style rules

Prefer the shared `@mobvex/ui` components (`Button`, `Input`, `Chip`, `Card`,
`Badge`, `Alert`, `Text`, `Avatar`, `Divider`, `Screen`) over re-implementing
these styles.

**Button (primary)** — solid `accent` fill, `onAccent` label, Bebas Neue,
`buttonPrimary` (20), spacing 2, radius `input` (14). The only solid
high-contrast component. *No exceptions.*

**Button (secondary)** — transparent, `border` at rest; border and label brighten
to `text` on press.

**Button (ghost)** — no fill, no border; `muted` label for tertiary actions.

**Input** — `surface2` fill, `border` at rest, `accent` border on focus, `accent2`
border + `hint` message on error. Radius `input` (14).

**Chip** — inactive: `surface2` fill, `border`, `muted` text. Active: `accentCardBg`
fill, `accentCardBorder`, `accent` text. Radius `full`.

**Card** — `default`: `surface2` fill + `border`. `active`: `accentCardBg` +
`accentCardBorder`. Radius `card` (18), padding 18 (unless `flush`).

**Badge / pill** — `accentBadgeBg` fill, `accentCardBorder`, `accent` text,
`label` size (11), radius `badge` (8).

---

## Principles

- **Darkness as the canvas.** Black is the base; surfaces lift only enough to read.
- **The neon as a signal.** `accent` appears only for action or positive info.
- **Type contrast of roles.** Bebas for action, DM Sans for context — never mixed.
- **No unnecessary visual noise.** Minimal shadows, no decorative gradients; weight
  comes from type and color, not effects.
