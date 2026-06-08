import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@mobvex/ui';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  /** Show the alert notification dot in the top-right corner. */
  dot?: boolean;
  accessibilityLabel?: string;
};

/** 36×36 neutral surface button hosting a single icon (notifications, back). */
export function IconButton({ children, onPress, dot = false, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed ? styles.pressed : null]}
    >
      {children}
      {dot ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.border,
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent2,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
});
