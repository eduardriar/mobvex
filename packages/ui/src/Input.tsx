import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Text } from './Text';
import {
  colors,
  fonts,
  fontSizes,
  radius,
  spacing,
} from './tokens';

type Props = Omit<TextInputProps, 'style'> & {
  /** Uppercase field label rendered above the input. */
  label?: string;
  /** Neutral helper text shown below the input. */
  hint?: string;
  /** Error message — switches the border to the alert accent and overrides the hint. */
  error?: string;
  /** Trailing unit shown inside the input (e.g. "kg", "cm"). */
  suffix?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

/**
 * Text input. Resting border darkens to the neutral border; focus raises it to
 * the neon accent; an `error` raises it to the alert accent and shows the message.
 */
export function Input({
  label,
  hint,
  error,
  suffix,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View style={styles.inputWrap}>
        <TextInput
          placeholderTextColor={colors.muted}
          selectionColor={colors.accent}
          style={[
            styles.input,
            focused ? styles.inputFocused : null,
            hasError ? styles.inputError : null,
            suffix ? styles.inputWithSuffix : null,
            inputStyle,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {suffix ? (
          <View pointerEvents="none" style={styles.suffixWrap}>
            <Text variant="footnote">{suffix}</Text>
          </View>
        ) : null}
      </View>

      {error ? (
        <Text variant="hint" style={styles.message}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="footnote" style={styles.message}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    alignSelf: 'stretch',
  },
  label: {
    marginBottom: 2,
  },
  inputWrap: {
    position: 'relative',
    alignSelf: 'stretch',
  },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: fontSizes.input,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.accent,
  },
  inputError: {
    borderColor: colors.accent2,
  },
  inputWithSuffix: {
    paddingRight: 44,
  },
  suffixWrap: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  message: {
    marginTop: 2,
  },
});
