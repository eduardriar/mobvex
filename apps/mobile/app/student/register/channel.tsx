import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Alert, Button, Screen, Text, colors, radius, spacing } from '@mobvex/ui';
import { signUpWithEmailOtp } from '@mobvex/db';
import { StepHeader } from '@/components/register/StepHeader';
import { ChannelOption } from '@/components/register/ChannelOption';
import { useRegister } from '@/components/register/RegisterContext';

/** Step 2 — choose how the verification code is delivered. */
export default function ChannelScreen() {
  const router = useRouter();
  const { contact, channel, update } = useRegister();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);

    // WhatsApp delivery is not wired yet (tracked separately).
    if (channel === 'whatsapp') {
      setError(
        'La verificación por WhatsApp estará disponible pronto. Usa tu correo por ahora.',
      );
      return;
    }

    const email = contact.trim();
    if (!email) {
      setError('Vuelve al paso anterior e ingresa tu correo.');
      return;
    }

    setSending(true);
    const { error: otpError } = await signUpWithEmailOtp(email);
    setSending(false);
    if (otpError) {
      setError('No pudimos enviar el código. Revisa tu correo e inténtalo de nuevo.');
      return;
    }

    router.push('/student/register/otp');
  };

  return (
    <Screen contentStyle={styles.screen}>
      <StepHeader step={1} />

      <Text variant="title" style={styles.title}>
        ¿CÓMO{'\n'}RECIBES{'\n'}EL CÓDIGO?
      </Text>
      <Text variant="subtitle" style={styles.sub}>
        Elige el canal de verificación.
      </Text>

      <View style={styles.options}>
        <ChannelOption
          icon="✉️"
          label={'Correo\nelectrónico'}
          selected={channel === 'email'}
          onPress={() => update({ channel: 'email' })}
        />
        <ChannelOption
          icon="💬"
          label="WhatsApp"
          selected={channel === 'whatsapp'}
          onPress={() => update({ channel: 'whatsapp' })}
        />
      </View>

      <View style={styles.note}>
        <Text variant="cardRole" style={styles.noteText}>
          Te enviaremos un código de 6 dígitos válido por 10 minutos. Si no llega,
          puedes reenviar después de 60 segundos.
        </Text>
      </View>

      {error ? <Alert message={error} style={styles.alert} /> : null}

      <View style={styles.spacer} />

      <Button
        label="ENVIAR CÓDIGO"
        fullWidth
        loading={sending}
        onPress={handleSend}
      />
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
    marginBottom: spacing.xl,
  },
  options: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
  note: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    padding: spacing.md,
  },
  alert: {
    marginTop: spacing.md,
  },
  noteText: {
    lineHeight: 20,
  },
  spacer: {
    flex: 1,
  },
});
