import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, fonts, fontSizes, overlays, radius } from './tokens';

export type BadgeVariant = 'accent' | 'alert' | 'neutral';

type Props = {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
};

/**
 * Small status pill.
 *
 * - `accent`  — positive / active status (neon).
 * - `alert`   — error / warning status (pink).
 * - `neutral` — informational status (muted).
 */
export function Badge({ label, variant = 'accent', style }: Props) {
  return (
    <View style={[styles.base, variantStyles[variant], style]}>
      <Text style={[styles.label, labelColor[variant]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.badge,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.label,
    fontWeight: '500',
  },
});

const variantStyles = StyleSheet.create({
  accent: {
    backgroundColor: overlays.accentBadgeBg,
    borderColor: overlays.accentCardBorder,
  },
  alert: {
    backgroundColor: overlays.alertBg,
    borderColor: overlays.alertBorder,
  },
  neutral: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
  },
});

const labelColor = StyleSheet.create({
  accent: { color: colors.accent },
  alert: { color: colors.accent2 },
  neutral: { color: colors.muted },
});
