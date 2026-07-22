/**
 * Mobvex design tokens.
 *
 * Single source of truth for every visual value in the app. Never hardcode
 * colors, sizes or spacing in a component — always reference a token from here.
 *
 * Mirrors `.claude/rules/mobvex-design-system.md`.
 */

export const colors = {
  // Base surfaces — darkness as the canvas, layers raised just enough to read.
  bg: '#0A0A0B', // App background
  surface: '#111114', // First-level surfaces (cards, modals)
  surface2: '#18181C', // Second-level surfaces (inputs, chips)
  border: '#2A2A30', // Resting component borders

  // Text
  text: '#F0F0F0', // Primary text, titles, active labels
  muted: '#6B6B78', // Secondary text, placeholders, hints

  // Accents — the neon is a signal; its scarcity is its power.
  accent: '#C8FF00', // Primary accent: CTAs, progress, active selection
  accent2: '#FF4D6D', // Secondary accent: errors, alerts, warnings

  // Text that sits on top of the solid accent fill.
  onAccent: '#0A0A0B',
} as const;

/**
 * Translucent accent variants used for active/highlight states.
 * Prefer these over solid fills for backgrounds and soft borders.
 */
export const overlays = {
  // Primary accent (#C8FF00)
  accentCardBg: 'rgba(200, 255, 0, 0.08)',
  accentCardBorder: 'rgba(200, 255, 0, 0.30)',
  accentIconBg: 'rgba(200, 255, 0, 0.12)',
  accentIconBorder: 'rgba(200, 255, 0, 0.30)',
  accentBadgeBg: 'rgba(200, 255, 0, 0.10)',
  accentGlow: 'rgba(200, 255, 0, 0.06)',

  // Secondary accent (#FF4D6D)
  alertBg: 'rgba(255, 77, 109, 0.10)',
  alertBorder: 'rgba(255, 77, 109, 0.25)',

  // Dark scrim (bg #0A0A0B) over a photo/video thumbnail, for icon contrast.
  mediaScrim: 'rgba(10, 10, 11, 0.35)',
} as const;

/**
 * Extended category hues — used ONLY for decorative category icons and recipe
 * thumbnails (dashboard). These are not brand colors: never use them for CTAs,
 * text, or status. The neon accent stays the single signal color.
 *
 * Each hue exposes: `solid` (icon glyph), `bg`/`border` (icon container at
 * 0.12 / 0.30) and `tint` (faint thumbnail wash at ~0.06).
 */
export const categories = {
  green: {
    solid: colors.accent,
    bg: 'rgba(200, 255, 0, 0.12)',
    border: 'rgba(200, 255, 0, 0.30)',
    tint: 'rgba(200, 255, 0, 0.05)',
  },
  purple: {
    solid: '#7850FF',
    bg: 'rgba(120, 80, 255, 0.12)',
    border: 'rgba(120, 80, 255, 0.30)',
    tint: 'rgba(120, 80, 255, 0.06)',
  },
  orange: {
    solid: '#FF8C00',
    bg: 'rgba(255, 140, 0, 0.12)',
    border: 'rgba(255, 140, 0, 0.30)',
    tint: 'rgba(255, 140, 0, 0.06)',
  },
  blue: {
    solid: '#32A0FF',
    bg: 'rgba(50, 160, 255, 0.12)',
    border: 'rgba(50, 160, 255, 0.30)',
    tint: 'rgba(50, 160, 255, 0.06)',
  },
  pink: {
    solid: colors.accent2,
    bg: 'rgba(255, 77, 109, 0.12)',
    border: 'rgba(255, 77, 109, 0.30)',
    tint: 'rgba(255, 77, 109, 0.06)',
  },
} as const;

export type CategoryHue = keyof typeof categories;

/**
 * Font families. The actual font files are loaded by each app
 * (expo-font on mobile, @font-face / next/font on web) under these names.
 *
 * Bebas Neue for what you shout (brand, action),
 * DM Sans for what you whisper (information, context).
 */
export const fonts = {
  display: 'BebasNeue', // Titles, brand, primary button
  body: 'DMSans', // All functional content
} as const;

export const fontSizes = {
  logo: 42, // Brand / logo
  screenTitle: 36, // Screen title (display)
  displaySubtitle: 28, // Display subtitle
  buttonPrimary: 20, // Primary button label (display)
  input: 16, // Input text / placeholder
  subtitle: 15, // Screen subtitle / card name
  link: 14, // Inline link
  chip: 13, // Chip / selector, hint, link
  cardRole: 12, // Card role text, footnote / legal
  label: 11, // Field label (uppercase), badge / pill
} as const;

export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
} as const;

export const letterSpacing = {
  logo: 2,
  title: 1,
  button: 2,
  label: 1.5,
  none: 0,
} as const;

export const spacing = {
  xs: 8, // Gap between small elements
  sm: 14, // Gap between components within a section
  md: 16, // Inner padding of inputs and chips
  lg: 24, // Screen horizontal padding
  xl: 32, // Separation between sections
  xxl: 48, // Top padding on landing screens
} as const;

export const radius = {
  input: 14, // Inputs and buttons
  card: 18, // Cards
  badge: 8, // Badges / pills
  device: 40, // App container (device frame)
  full: 9999, // Pills / circular avatars
} as const;

/**
 * Ambient depth effects. Used by the screen container and accent containers.
 */
export const shadows = {
  containerGlow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 80,
    elevation: 0,
  },
} as const;

export const tokens = {
  colors,
  overlays,
  categories,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacing,
  spacing,
  radius,
  shadows,
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Tokens = typeof tokens;
