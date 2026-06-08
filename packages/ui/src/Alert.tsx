import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, fonts, fontSizes, overlays, radius, spacing } from './tokens';

export type AlertVariant = 'error' | 'success';

type Props = {
  message: string;
  /** Optional bold title above the message. */
  title?: string;
  /**
   * - `error`   — alert accent (pink). Validation / failure messages.
   * - `success` — primary accent (neon). Positive confirmations.
   */
  variant?: AlertVariant;
  style?: StyleProp<ViewStyle>;
};

/** Inline callout block for form-level errors and confirmations. */
export function Alert({ message, title, variant = 'error', style }: Props) {
  const tone = variant === 'error' ? colors.accent2 : colors.accent;

  return (
    <View style={[styles.base, variantStyles[variant], style]}>
      {title ? (
        <Text style={[styles.title, { color: tone }]}>{title}</Text>
      ) : null}
      <Text style={[styles.message, { color: tone }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: fontSizes.chip,
    fontWeight: '500',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: fontSizes.chip,
    fontWeight: '400',
  },
});

const variantStyles = StyleSheet.create({
  error: {
    backgroundColor: overlays.alertBg,
    borderColor: overlays.alertBorder,
  },
  success: {
    backgroundColor: overlays.accentCardBg,
    borderColor: overlays.accentCardBorder,
  },
});
