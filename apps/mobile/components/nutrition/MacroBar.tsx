import { StyleSheet, View } from 'react-native';
import { Text, categories, colors, fonts, type CategoryHue } from '@mobvex/ui';

type Props = {
  label: string;
  value: number;
  unit: string;
  /** Fill level 0–100. */
  pct: number;
  hue: CategoryHue;
};

/** A macro target: big value + unit, a hue-colored fill bar, and a label. */
export function MacroBar({ label, value, unit, pct, hue }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.max(0, Math.min(100, pct))}%`,
              backgroundColor: categories[hue].solid,
            },
          ]}
        />
      </View>
      <Text variant="cardRole" style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 24,
    color: colors.text,
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
  },
  track: {
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginVertical: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  label: {
    fontSize: 11,
  },
});
