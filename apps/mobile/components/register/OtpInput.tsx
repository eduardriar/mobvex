import { useRef } from 'react';
import {
  Keyboard,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { colors, fonts, radius, spacing } from '@mobvex/ui';
import { OTP_LENGTH } from './constants';

type Props = {
  value: string;
  onChange: (code: string) => void;
  /** Tints every box with the alert accent (e.g. after a failed verification). */
  error?: boolean;
};

/**
 * Six single-digit boxes that behave as one code field: typing advances focus,
 * backspace on an empty box steps back.
 */
export function OtpInput({ value, onChange, error = false }: Props) {
  const refs = useRef<(TextInput | null)[]>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');

  const setDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = digits.slice();
    next[index] = digit;
    const code = next.join('').slice(0, OTP_LENGTH);
    onChange(code);
    if (digit && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    } else if (code.length === OTP_LENGTH) {
      // Code complete — drop the keyboard so the CTA is visible.
      Keyboard.dismiss();
    }
  };

  const onKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((digit, i) => (
        <TextInput
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          onChangeText={(t) => setDigit(i, t)}
          onKeyPress={(e) => onKeyPress(i, e)}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={1}
          selectionColor={colors.accent}
          style={[styles.box, error ? styles.boxError : null]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: spacing.lg,
  },
  box: {
    width: 48,
    height: 60,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: 1,
    color: colors.accent,
    textAlign: 'center',
  },
  boxError: {
    borderColor: colors.accent2,
  },
});
