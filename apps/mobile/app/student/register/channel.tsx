import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Screen, Text, colors, radius, spacing } from '@mobvex/ui';
import { StepHeader } from '@/components/register/StepHeader';
import { ChannelOption } from '@/components/register/ChannelOption';
import { useRegister } from '@/components/register/RegisterContext';

/** Step 2 — choose how the verification code is delivered. */
export default function ChannelScreen() {
  const router = useRouter();
  const { channel, update } = useRegister();

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

      <View style={styles.spacer} />

      <Button
        label="ENVIAR CÓDIGO"
        fullWidth
        onPress={() => router.push('/student/register/otp')}
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
  noteText: {
    lineHeight: 20,
  },
  spacer: {
    flex: 1,
  },
});
