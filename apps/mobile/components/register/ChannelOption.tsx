import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, fontSizes, overlays, radius, spacing } from '@mobvex/ui';

type Props = {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** Large selectable tile for choosing the OTP delivery channel. */
export function ChannelOption({ icon, label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.inactive,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, selected ? styles.labelSelected : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.input,
    alignItems: 'center',
  },
  inactive: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: overlays.accentCardBg,
    borderColor: overlays.accentCardBorder,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.chip,
    color: colors.muted,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.accent,
  },
});
