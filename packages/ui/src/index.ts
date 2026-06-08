/**
 * @mobvex/ui — shared design system.
 *
 * Universal components (React Native primitives) consumed by both
 * apps/mobile (Expo) and apps/web (Next.js via react-native-web).
 *
 * Never hardcode design values in app code — import tokens from here.
 */

// Design tokens
export {
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
  tokens,
} from './tokens';
export type { Colors, Spacing, Radius, Tokens, CategoryHue } from './tokens';

// Components
export { Text } from './Text';
export type { TextVariant } from './Text';

export { Button } from './Button';
export type { ButtonVariant, ButtonSize } from './Button';

export { Input } from './Input';

export { Card } from './Card';
export type { CardVariant } from './Card';

export { Badge } from './Badge';
export type { BadgeVariant } from './Badge';

export { Chip } from './Chip';

export { Avatar } from './Avatar';
export type { AvatarSize, AvatarVariant } from './Avatar';

export { Screen } from './Screen';

export { Divider } from './Divider';
export type { DividerVariant } from './Divider';

export { Alert } from './Alert';
export type { AlertVariant } from './Alert';
