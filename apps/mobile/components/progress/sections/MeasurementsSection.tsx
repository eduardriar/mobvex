import { StyleSheet, View } from 'react-native';
import { spacing } from '@mobvex/ui';
import { AddSectionHeader } from '../AddSectionHeader';
import { MeasurementCard } from '../MeasurementCard';
import { COPY } from '@/lib/copy';

const T = COPY.progress.measurements;

export type MeasurementItem = {
  label: string;
  /** Undefined when the student hasn't registered this measurement yet. */
  value?: number;
  unit: string;
  /** Net change across the series; omitted when there's nothing to compare. */
  delta?: number;
};

type Props = {
  measurements: MeasurementItem[];
  onAdd: () => void;
};

/** Progress screen section: body-measurement grid, one tile per tracked field. */
export function MeasurementsSection({ measurements, onAdd }: Props) {
  if (measurements.length === 0) return null;

  return (
    <View style={styles.section}>
      <AddSectionHeader title={T.sectionTitle} onAdd={onAdd} />
      <View style={[styles.sectionBody, styles.grid]}>
        {measurements.map((m) => (
          <MeasurementCard
            key={m.label}
            label={m.label}
            value={m.value}
            unit={m.unit}
            delta={m.delta}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
  },
  sectionBody: {
    marginTop: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
});
