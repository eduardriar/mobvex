import { StyleSheet, View } from 'react-native';
import { spacing } from '@mobvex/ui';
import { WeightTrendCard } from '../WeightTrendCard';

type Props = {
  /** Weight series in chronological order (oldest → newest). */
  weights: number[];
  /** Undefined when the student hasn't registered their weight yet. */
  current?: number;
  /** Net change across the series; omitted when there's nothing to compare. */
  delta?: number;
};

/** Progress screen section: current weight, trend badge and sparkline. */
export function WeightSection({ weights, current, delta }: Props) {
  return (
    <View style={styles.hero}>
      <WeightTrendCard weights={weights} current={current} delta={delta} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing.xl,
  },
});
