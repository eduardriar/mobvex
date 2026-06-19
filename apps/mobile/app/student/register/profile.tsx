import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Alert, Button, Chip, Input, Screen, Text, colors, spacing } from '@mobvex/ui';
import {
  acceptInvitation,
  createStudent,
  getOrCreateUserProfile,
  getStudentByUserId,
  saveProgress,
} from '@mobvex/db';
import { StepHeader } from '@/components/register/StepHeader';
import { GOALS } from '@/components/register/constants';
import { useRegister } from '@/components/register/RegisterContext';
import { useAuth } from '@/components/auth/AuthProvider';

/** Step 4 — minimal profile before the account is created. */
export default function Profile() {
  const router = useRouter();
  // height & birthdate are collected into the draft but have no column in the
  // current schema, so they are not persisted yet (see task note).
  const {
    name,
    weight,
    height,
    birthdate,
    goal,
    contact,
    trainerId,
    invitationId,
    update,
  } = useRegister();
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);

    const userId = session?.user?.id;
    const email = session?.user?.email ?? contact.trim();
    if (!userId || !email) {
      setError('Tu sesión expiró. Vuelve a verificar tu código.');
      return;
    }
    if (!trainerId) {
      setError('No encontramos tu invitación. Pídele el enlace a tu entrenador.');
      return;
    }

    setSaving(true);

    // 1. Profile row — idempotent, so a retry after a partial failure is safe.
    const { error: profileError } = await getOrCreateUserProfile({
      id: userId,
      email,
      name: name.trim(),
      role: 'student',
    });
    if (profileError) {
      setSaving(false);
      setError('No pudimos crear tu cuenta. Inténtalo de nuevo.');
      return;
    }

    // 2. Student record linking to the trainer (skip if it already exists).
    const existing = await getStudentByUserId(userId);
    let studentId = existing.data?.id ?? null;
    if (!studentId) {
      const { data: studentRow, error: studentError } = await createStudent({
        trainer_id: trainerId,
        user_id: userId,
        goal,
        active: true,
      });
      if (studentError || !studentRow) {
        setSaving(false);
        setError('No pudimos vincularte con tu entrenador. Inténtalo de nuevo.');
        return;
      }
      studentId = studentRow.id;
    }

    // 3. Best-effort extras — don't block onboarding if these fail.
    if (invitationId) {
      await acceptInvitation(invitationId);
    }
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
          onChangeText={(t) => update({ name: t })}
        />

        <View style={styles.row}>
          <Input
            containerStyle={styles.rowItem}
            label="Peso actual"
            placeholder="75"
            keyboardType="numeric"
            suffix="kg"
            value={weight}
            onChangeText={(t) => update({ weight: t })}
          />
          <Input
            containerStyle={styles.rowItem}
            label="Estatura"
            placeholder="175"
            keyboardType="numeric"
            suffix="cm"
            value={height}
            onChangeText={(t) => update({ height: t })}
          />
        </View>

        <Input
          label="Fecha de nacimiento"
          placeholder="DD / MM / AAAA"
          value={birthdate}
          onChangeText={(t) => update({ birthdate: t })}
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
        disabled={!name.trim()}
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
