import { StyleSheet, View } from 'react-native';
import { Card, Text, colors, fonts, spacing } from '@mobvex/ui';
import { Sparkline } from './Sparkline';
import { TrendBadge } from './TrendBadge';

type Props = {
  /** Weight series in chronological order (oldest → newest). */
  weights: number[];
  current: number;
  /** Net change across the series. */
  delta: number;
};

/** Hero card: current weight + trend badge on the left, a sparkline on the right. */
export function WeightTrendCard({ weights, current, delta }: Props) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text variant="label">PESO ACTUAL</Text>
          <Text style={styles.value}>
            {current}
            <Text style={styles.unit}> kg</Text>
          </Text>
          <View style={styles.badge}>
            <TrendBadge delta={delta} />
          </View>
        </View>

        <View style={styles.right}>
          <Sparkline values={weights} width={150} height={64} />
          <Text variant="cardRole" style={styles.caption}>
            últimas {weights.length} mediciones
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  left: {
    justifyContent: 'center',
  },
  value: {
    fontFamily: fonts.body,
    fontSize: 44,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 48,
    marginTop: spacing.xs,
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '400',
    color: colors.muted,
  },
  badge: {
    marginTop: spacing.sm,
  },
  right: {
    alignItems: 'flex-end',
  },
  caption: {
    marginTop: spacing.xs,
  },
});
