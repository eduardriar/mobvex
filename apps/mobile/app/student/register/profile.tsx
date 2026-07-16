import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Alert, Button, Chip, Input, Screen, Text, colors, spacing } from '@mobvex/ui';
import { claimStudentInvitation, saveProgress } from '@mobvex/db';
import { StepHeader } from '@/components/register/StepHeader';
import { GOALS } from '@/components/register/constants';
import {
  validateBirthdate,
  validateHeight,
  validateName,
  validateWeight,
} from '@/components/register/validation';
import { useRegister } from '@/components/register/RegisterContext';
import { useAuth } from '@/components/auth/AuthProvider';

type FieldKey = 'name' | 'weight' | 'height' | 'birthdate';

/** Step 4 — minimal profile before the account is created. */
export default function Profile() {
  const router = useRouter();
  // height & birthdate are collected (and validated) into the draft but have no
  // column in the current schema, so they are not persisted yet (see task note).
  const {
    name,
    weight,
    height,
    birthdate,
    goal,
    trainerId,
    invitationId,
    update,
  } = useRegister();
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldKey, string>>
  >({});

  const clearError = (key: FieldKey) =>
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const validate = (): boolean => {
    const next: Partial<Record<FieldKey, string>> = {
      name: validateName(name) ?? undefined,
      weight: validateWeight(weight) ?? undefined,
      height: validateHeight(height) ?? undefined,
      birthdate: validateBirthdate(birthdate) ?? undefined,
    };
    setFieldErrors(next);
    return !next.name && !next.weight && !next.height && !next.birthdate;
  };

  const handleCreate = async () => {
    setError(null);
    if (!validate()) return;

    const userId = session?.user?.id;
    if (!userId) {
      setError('Tu sesión expiró. Vuelve a verificar tu código.');
      return;
    }
    if (!trainerId || !invitationId) {
      setError('No encontramos tu invitación. Pídele el enlace a tu entrenador.');
      return;
    }

    setSaving(true);

    // Profile + trainer link + invitation acceptance, in one atomic RPC.
    // Adopts the placeholder the trainer pre-created (users.email is unique,
    // so creating a second profile client-side would fail or duplicate).
    // Idempotent — a retry after a partial failure is safe.
    const { data: studentId, error: claimError } = await claimStudentInvitation({
      invitationId,
      name: name.trim(),
      goal,
    });
    if (claimError || !studentId) {
      setSaving(false);
      setError('No pudimos vincularte con tu entrenador. Inténtalo de nuevo.');
      return;
    }

    // Best-effort extras — don't block onboarding if these fail.
    const initialWeight = Number(weight.replace(',', '.'));
    if (Number.isFinite(initialWeight) && initialWeight > 0) {
      await saveProgress({
        student_id: studentId,
        date: new Date().toISOString().slice(0, 10),
        weight_kg: initialWeight,
      });
    }

    setSaving(false);
    router.replace('/student/register/success');
  };

  return (
    <Screen scroll contentStyle={styles.screen}>
      <StepHeader step={3} />

      <Text variant="title">TU PERFIL</Text>
      <Text variant="subtitle" style={styles.sub}>
        Solo lo básico. Tu entrenador completará el resto.
      </Text>

      <View style={styles.form}>
        <Input
          label="Nombre completo"
          placeholder="Juan Pérez"
          value={name}
          error={fieldErrors.name}
          onChangeText={(t) => {
            update({ name: t });
            clearError('name');
          }}
        />

        <View style={styles.row}>
          <Input
            containerStyle={styles.rowItem}
            label="Peso actual"
            placeholder="75"
            keyboardType="numeric"
            suffix="kg"
            value={weight}
            error={fieldErrors.weight}
            onChangeText={(t) => {
              update({ weight: t });
              clearError('weight');
            }}
          />
          <Input
            containerStyle={styles.rowItem}
            label="Estatura"
            placeholder="175"
            keyboardType="numeric"
            suffix="cm"
            value={height}
            error={fieldErrors.height}
            onChangeText={(t) => {
              update({ height: t });
              clearError('height');
            }}
          />
        </View>

        <Input
          label="Fecha de nacimiento"
          placeholder="DD / MM / AAAA"
          value={birthdate}
          error={fieldErrors.birthdate}
          onChangeText={(t) => {
            update({ birthdate: t });
            clearError('birthdate');
          }}
        />

        <View>
          <Text variant="label" style={styles.goalLabel}>
            Objetivo principal
          </Text>
          <View style={styles.goals}>
            {GOALS.map((g) => (
              <Chip
                key={g.value}
                label={g.label}
                selected={goal === g.value}
                onPress={() => update({ goal: g.value })}
              />
            ))}
          </View>
        </View>
      </View>

      {error ? <Alert message={error} style={styles.alert} /> : null}

      <View style={styles.spacer} />

      <Button
        label="CREAR CUENTA"
        fullWidth
        loading={saving}
        style={styles.cta}
        onPress={handleCreate}
      />
      <Text variant="footnote" style={styles.terms}>
        Al continuar aceptas los{' '}
        <Text variant="footnote" color={colors.accent}>
          Términos de uso
        </Text>{' '}
        y la{' '}
        <Text variant="footnote" color={colors.accent}>
          Política de privacidad
        </Text>
        .
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  sub: {
    marginTop: spacing.xs,
  },
  form: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowItem: {
    flex: 1,
  },
  goalLabel: {
    marginBottom: spacing.xs,
  },
  goals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  alert: {
    marginTop: spacing.md,
  },
  spacer: {
    minHeight: spacing.lg,
    flexGrow: 1,
  },
  cta: {
    marginBottom: spacing.xs,
  },
  terms: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
