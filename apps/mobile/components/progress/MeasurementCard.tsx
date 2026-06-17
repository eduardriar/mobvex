import { StyleSheet, View } from 'react-native';
import { Text, colors, fonts, fontSizes, radius, spacing } from '@mobvex/ui';
import { TrendBadge } from './TrendBadge';

type Props = {
  label: string;
  value: number;
  unit: string;
  /** Net change across the series; omitted when there's nothing to compare. */
  delta?: number;
};

/** A single body-measurement tile: label + trend on top, big value below. */
export function MeasurementCard({ label, value, unit, delta }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {delta != null ? <TrendBadge delta={delta} /> : null}
      </View>
      <Text style={styles.value}>
        {value}
        <Text style={styles.unit}> {unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xs,
    minHeight: 40,
  },
  label: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.subtitle,
    color: colors.muted,
  },
  value: {
    fontFamily: fonts.body,
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '400',
    color: colors.muted,
  },
});
