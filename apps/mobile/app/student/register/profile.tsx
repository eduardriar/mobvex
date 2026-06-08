import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Chip, Input, Screen, Text, colors, spacing } from '@mobvex/ui';
import { StepHeader } from '@/components/register/StepHeader';
import { GOALS } from '@/components/register/constants';
import { useRegister } from '@/components/register/RegisterContext';

/** Step 4 — minimal profile before the account is created. */
export default function Profile() {
  const router = useRouter();
  const { name, weight, height, birthdate, goal, update } = useRegister();

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

      <View style={styles.spacer} />

      <Button
        label="CREAR CUENTA"
        fullWidth
        style={styles.cta}
        onPress={() => router.replace('/student/register/success')}
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
