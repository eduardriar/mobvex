import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  colors,
  fonts,
  fontSizes,
  letterSpacing,
  radius,
  spacing,
} from './tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the full width of the parent. */
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Optional element rendered before the label (e.g. an icon). */
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Primary action button. The only solid, high-contrast component in the system.
 *
 * - `primary`   — neon fill, dark Bebas Neue label. The main CTA.
 * - `secondary` — transparent with a resting border; border + label brighten on press.
 * - `ghost`     — no fill, no border. Tertiary actions (e.g. "skip").
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  style,
  ...rest
}: Props) {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;

  const spinnerColor = variant === 'primary' ? colors.onAccent : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        variant === 'secondary' && pressed ? styles.secondaryPressed : null,
        variant !== 'secondary' && pressed ? styles.pressed : null,
        fullWidth ? styles.fullWidth : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text
            style={[
              styles.label,
              labelSize[size],
              labelVariant[variant],
              variant === 'secondary' && pressed ? styles.secondaryLabelPressed : null,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    marginRight: 2,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.85,
  },
  secondaryPressed: {
    borderColor: colors.text,
  },
  secondaryLabelPressed: {
    color: colors.text,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: fonts.display,
    letterSpacing: letterSpacing.button,
    textAlign: 'center',
  },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: 10, paddingHorizontal: spacing.md },
  md: { paddingVertical: 14, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: 18, paddingHorizontal: spacing.xl },
});

const labelSize = StyleSheet.create({
  sm: { fontSize: fontSizes.subtitle },
  md: { fontSize: fontSizes.buttonPrimary },
  lg: { fontSize: fontSizes.displaySubtitle },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});

const labelVariant = StyleSheet.create({
  primary: { color: colors.onAccent },
  secondary: { color: colors.muted },
  ghost: { color: colors.muted },
});
