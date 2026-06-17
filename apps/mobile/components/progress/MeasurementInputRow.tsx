import { StyleSheet, TextInput, View } from 'react-native';
import { Text, colors, fonts, fontSizes, radius, spacing } from '@mobvex/ui';

type Props = {
  label: string;
  unit: string;
  /** Previous value, shown as a hint and the input placeholder. */
  previous?: number;
  value: string;
  onChangeText: (text: string) => void;
};

/** One measurement field: label + previous value on the left, an input + unit. */
export function MeasurementInputRow({
  label,
  unit,
  previous,
  value,
  onChangeText,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text variant="cardRole" style={styles.prev}>
          {previous != null
            ? `Anterior: ${previous} ${unit}`
            : 'Sin registro previo'}
        </Text>
      </View>

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder={previous != null ? `${previous}` : '—'}
          placeholderTextColor={colors.muted}
          selectionColor={colors.accent}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  info: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  prev: {
    marginTop: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  input: {
    minWidth: 92,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: fontSizes.input,
    color: colors.muted,
  },
});
