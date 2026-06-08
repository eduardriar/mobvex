import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@mobvex/ui';

type Props = {
  /** Zero-based index of the active step. */
  current: number;
  total?: number;
};

/**
 * Progress indicator for the registration flow. The active step is an elongated
 * neon pill; completed steps are dimmed neon; upcoming steps are neutral dots.
 */
export function StepDots({ current, total = 4 }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const variant = i === current ? styles.active : i < current ? styles.done : styles.todo;
        return <View key={i} style={[styles.dot, variant]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  active: {
    width: 18,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  done: {
    backgroundColor: colors.accent,
    opacity: 0.4,
  },
  todo: {
    backgroundColor: colors.border,
  },
});
