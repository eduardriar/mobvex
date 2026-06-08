import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  colors,
  fonts,
  fontSizes,
  overlays,
  radius,
  spacing,
} from './tokens';

type Props = {
  label: string;
  /** Active/selected state — neon fill + accent text. */
  selected?: boolean;
  /** Makes the chip toggleable. Omit for a static, read-only chip. */
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Selector chip for single/multi choice (goals, muscle groups, filters).
 *
 * - inactive — muted surface, muted text.
 * - `selected` — translucent neon fill, accent border, accent text.
 */
export function Chip({ label, selected = false, onPress, disabled = false, style }: Props) {
  const content = (
    <Text
      style={[styles.label, selected ? styles.labelSelected : null]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );

  const composed = [
    styles.base,
    selected ? styles.selected : styles.inactive,
    disabled ? styles.disabled : null,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [composed, pressed ? styles.pressed : null]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={composed}>{content}</View>;
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  inactive: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: overlays.accentCardBg,
    borderColor: overlays.accentCardBorder,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.chip,
    fontWeight: '400',
    color: colors.muted,
  },
  labelSelected: {
    color: colors.accent,
  },
});
