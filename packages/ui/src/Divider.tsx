import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, spacing } from './tokens';

export type DividerVariant = 'line' | 'accent';

type Props = {
  /**
   * - `line`   — full-width neutral hairline separator.
   * - `accent` — 40×3 neon brand mark (used under the logo on welcome screens).
   */
  variant?: DividerVariant;
  style?: StyleProp<ViewStyle>;
};

export function Divider({ variant = 'line', style }: Props) {
  return <View style={[styles[variant], style]} />;
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  accent: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});
