import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Alert, Button, Screen, Text, colors, spacing } from '@mobvex/ui';
import { saveProgress, type NewProgress } from '@mobvex/db';
import { MeasurementInputRow } from '@/components/progress/MeasurementInputRow';
import { useProgress } from '@/hooks/useProgress';

// TODO: replace with the authenticated student's id once auth is wired.
const TEMP_STUDENT_ID = '00000000-0000-0000-0000-000000000003';

// Numeric measurement fields, in display order.
type FieldKey =
  | 'weight_kg'
  | 'body_fat_pct'
  | 'chest_cm'
  | 'arm_cm'
  | 'waist_cm'
  | 'shoulder_cm'
  | 'quads_cm'
  | 'calf_cm'
  | 'glutes_cm';

const FIELDS: { key: FieldKey; label: string; unit: string }[] = [
  { key: 'weight_kg', label: 'Peso', unit: 'kg' },
  { key: 'body_fat_pct', label: 'Grasa corporal', unit: '%' },
  { key: 'chest_cm', label: 'Pecho', unit: 'cm' },
  { key: 'arm_cm', label: 'Brazo', unit: 'cm' },
  { key: 'waist_cm', label: 'Cintura', unit: 'cm' },
  { key: 'shoulder_cm', label: 'Hombro', unit: 'cm' },
  { key: 'quads_cm', label: 'Cuádriceps', unit: 'cm' },
  { key: 'calf_cm', label: 'Pantorrilla', unit: 'cm' },
  { key: 'glutes_cm', label: 'Glúteos', unit: 'cm' },
];

/** Parse a numeric field; empty/invalid input is treated as "not measured". */
function parseNumber(value: string): number | undefined {
  const normalized = value.replace(',', '.').trim();
  if (normalized === '') return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const emptyForm = () =>
  Object.fromEntries(FIELDS.map((f) => [f.key, ''])) as Record<FieldKey, string>;

export default function NewMeasurement() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries } = useProgress(TEMP_STUDENT_ID);
  const latest = entries[0];

  const [values, setValues] = useState<Record<FieldKey, string>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const dateLabel = today.toLocaleDateString('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const hasInput = FIELDS.some((f) => parseNumber(values[f.key]) != null);

  const handleSave = async () => {
    const payload: NewProgress = {
      student_id: TEMP_STUDENT_ID,
      date: today.toISOString().slice(0, 10),
    };
    for (const field of FIELDS) {
      const parsed = parseNumber(values[field.key]);
      if (parsed != null) payload[field.key] = parsed;
    }

    setSaving(true);
    setError(null);
    const { error: saveError } = await saveProgress(payload);
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    router.back();
  };

  return (
    <Screen flush>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // Compensate for Screen's SafeAreaView top inset so the footer lands
        // flush above the keyboard instead of behind it.
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text variant="label" style={styles.eyebrow}>
                Registro de hoy
              </Text>
              <Text variant="title" style={styles.title}>
                NUEVA MEDICIÓN
              </Text>
              <View style={styles.dateRow}>
                <Feather name="calendar" size={14} color={colors.muted} />
                <Text variant="subtitle">{dateLabel}</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              hitSlop={8}
              onPress={() => router.back()}
            >
              <Feather name="x" size={24} color={colors.muted} />
            </Pressable>
          </View>

          {error ? (
            <Alert message="No pudimos guardar la medición." style={styles.alert} />
          ) : null}

          <View style={styles.list}>
            {FIELDS.map((field) => (
              <MeasurementInputRow
                key={field.key}
                label={field.label}
                unit={field.unit}
                previous={latest?.[field.key]}
                value={values[field.key]}
                onChangeText={(text) =>
                  setValues((current) => ({ ...current, [field.key]: text }))
                }
              />
            ))}
          </View>

          <Text variant="footnote" style={styles.hint}>
            Deja en blanco lo que no midas hoy. Solo se guardan los campos
            completados.
          </Text>
        </ScrollView>

        {/* Floating action bar — stays above the keyboard. */}
        <View style={styles.footer}>
          <Button
            label="GUARDAR MEDICIÓN"
            variant="primary"
            fullWidth
            loading={saving}
            disabled={!hasInput}
            onPress={handleSave}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  title: {
    lineHeight: 36,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  alert: {
    marginTop: spacing.lg,
  },
  list: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  hint: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  save: {
    marginTop: spacing.lg,
  },
});
