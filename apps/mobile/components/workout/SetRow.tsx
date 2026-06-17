import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import {
  Text,
  colors,
  fonts,
  fontSizes,
  overlays,
  radius,
  spacing,
} from '@mobvex/ui';

type SetChanges = {
  weight_kg?: number;
  reps?: number;
  rir?: number;
  completed?: boolean;
};

type Props = {
  setNumber: number;
  weightKg?: number;
  reps?: number;
  rir?: number;
  completed: boolean;
  /** True for the next set to perform (first incomplete) — highlighted ring. */
  active: boolean;
  onChange: (changes: SetChanges) => void;
};

/** Parse a numeric field, treating empty/invalid input as cleared (undefined). */
function parseNumber(value: string): number | undefined {
  const normalized = value.replace(',', '.').trim();
  if (normalized === '') return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * One logged set: a status circle (number / check, tap to complete) followed by
 * weight (kg), actual reps and effort (RIR) inputs. Numeric fields commit on
 * blur; the circle toggles completion immediately. A completed row is tinted
 * with the accent; the active (next-up) row gets a solid accent ring.
 */
export function SetRow({
  setNumber,
  weightKg,
  reps,
  rir,
  completed,
  active,
  onChange,
}: Props) {
  const [weightText, setWeightText] = useState(weightKg?.toString() ?? '');
  const [repsText, setRepsText] = useState(reps?.toString() ?? '');
  const [rirText, setRirText] = useState(rir?.toString() ?? '');

  const circleStyle = completed
    ? styles.circleCompleted
    : active
      ? styles.circleActive
      : styles.circlePending;

  const cellStyle = [styles.cell, completed ? styles.cellCompleted : null];

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={`Marcar serie ${setNumber} como completada`}
        hitSlop={8}
        onPress={() => onChange({ completed: !completed })}
        style={[styles.circle, circleStyle]}
      >
        {completed ? (
          <Feather name="check" size={18} color={colors.onAccent} />
        ) : (
          <Text
            style={[styles.setNumber, active ? styles.setNumberActive : null]}
          >
            {setNumber}
          </Text>
        )}
      </Pressable>

      {/* Each input is wrapped in a flex View so the columns divide evenly —
          flex:1 directly on sibling TextInputs mis-measures and collapses one. */}
      <View style={styles.cellWrap}>
        <TextInput
          style={cellStyle}
          value={weightText}
          onChangeText={setWeightText}
          onEndEditing={() => onChange({ weight_kg: parseNumber(weightText) })}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={colors.muted}
          selectionColor={colors.accent}
        />
      </View>
      <View style={styles.cellWrap}>
        <TextInput
          style={cellStyle}
          value={repsText}
          onChangeText={setRepsText}
          onEndEditing={() => onChange({ reps: parseNumber(repsText) })}
          keyboardType="number-pad"
          placeholder="—"
          placeholderTextColor={colors.muted}
          selectionColor={colors.accent}
        />
      </View>
      <View style={styles.cellWrap}>
        <TextInput
          style={cellStyle}
          value={rirText}
          onChangeText={setRirText}
          onEndEditing={() => onChange({ rir: parseNumber(rirText) })}
          keyboardType="number-pad"
          placeholder="—"
          placeholderTextColor={colors.muted}
          selectionColor={colors.accent}
        />
      </View>
    </View>
  );
}

const CIRCLE_SIZE = 44;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  circleActive: {
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: 'transparent',
  },
  circlePending: {
    borderStyle: 'dashed',
    borderColor: colors.muted,
    backgroundColor: 'transparent',
  },
  setNumber: {
    fontFamily: fonts.body,
    fontSize: fontSizes.subtitle,
    fontWeight: '500',
    color: colors.muted,
  },
  setNumberActive: {
    color: colors.accent,
  },
  cellWrap: {
    flex: 1,
  },
  cell: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    fontFamily: fonts.body,
    fontSize: fontSizes.input,
    color: colors.text,
    textAlign: 'center',
  },
  cellCompleted: {
    backgroundColor: overlays.accentCardBg,
    borderColor: overlays.accentCardBorder,
    color: colors.accent,
  },
});
