import { StyleSheet, View } from 'react-native';
import { colors } from '@mobvex/ui';

type Props = {
  /** 0–1. */
  progress: number;
};

/** Thin neon progress track. */
export function ProgressBar({ progress }: Props) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%` as `${number}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.border,
    width: '100%',
  },
  fill: {
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
