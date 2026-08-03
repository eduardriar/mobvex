import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, overlays, radius } from './tokens';

export type CardVariant = 'default' | 'active';

type Props = {
  variant?: CardVariant;
  /** Makes the card pressable. When omitted the card is a static surface. */
  onPress?: () => void;
  /** Remove the default 18px inner padding (e.g. for full-bleed media). */
  flush?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Base surface for grouped content (student, routine and exercise cards).
 *
 * - `default` — neutral surface with a resting border.
 * - `active`  — translucent neon fill + border for the selected / highlighted item.
 */
export function Card({
  variant = 'default',
  onPress,
  flush = false,
  children,
  style,
}: Props) {
  const composed = [
    styles.base,
    flush ? null : styles.padded,
    variantStyles[variant],
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [composed, pressed ? styles.pressed : null]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={composed}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    borderWidth: 1,
  },
  padded: {
    padding: 18,
  },
  pressed: {
    opacity: 0.9,
  },
});

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
  },
  active: {
    backgroundColor: overlays.accentCardBg,
    borderColor: overlays.accentCardBorder,
  },
});
