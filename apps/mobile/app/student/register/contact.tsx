import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge, Button, Input, Screen, Text, spacing } from '@mobvex/ui';
import { StepHeader } from '@/components/register/StepHeader';
import { TrainerCard } from '@/components/register/TrainerCard';
import { TRAINER_ROLE_LABEL } from '@/components/register/constants';
import { validateContact } from '@/components/register/validation';
import { useRegister } from '@/components/register/RegisterContext';

/** Step 1 — capture the student's email or phone. */
export default function Contact() {
  const router = useRouter();
  const { contact, update, trainer, inviteState } = useRegister();
  console.log('>>>> Invite state',inviteState)
  console.log('>>>> Trainer',trainer)
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    const message = validateContact(contact);
    if (message) {
      setError(message);
      return;
    }
    router.push('/student/register/channel');
  };

  return (
    <Screen contentStyle={styles.screen}>
      <StepHeader step={0} />

      <Text variant="title" style={styles.title}>
        INGRESA{'\n'}TU CONTACTO
      </Text>
      <Text variant="subtitle" style={styles.sub}>
        Te enviaremos un código de verificación de 6 dígitos.
      </Text>

      <View style={styles.form}>
        <Input
          label="Correo electrónico o teléfono"
          placeholder="ej. juan@gmail.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={contact}
          error={error ?? undefined}
          onChangeText={(t) => {
            update({ contact: t });
            if (error) setError(null);
          }}
        />
        {trainer ? (
          <>
            <Badge
              label={`Invitación de ${trainer.name}`}
              variant="alert"
              style={styles.invite}
            />
            <TrainerCard name={trainer.name} role={TRAINER_ROLE_LABEL} />
          </>
        ) : inviteState === 'loading' ? (
          <Text variant="subtitle" style={styles.invite}>
            Verificando tu invitación…
          </Text>
        ) : (
          <Text variant="hint" style={styles.invite}>
            No encontramos una invitación válida. Pídele a tu entrenador el
            enlace de invitación.
          </Text>
        )}
      </View>

      <View style={styles.spacer} />

      <Button label="CONTINUAR" fullWidth onPress={handleContinue} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    lineHeight: 38,
  },
  sub: {
    marginTop: spacing.xs,
  },
  form: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  invite: {
    marginTop: spacing.xs,
  },
  spacer: {
    flex: 1,
  },
});
