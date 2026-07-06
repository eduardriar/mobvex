import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Screen, Text, colors, spacing } from '@mobvex/ui';
import { signUpWithEmailOtp, verifyEmailOtp } from '@mobvex/db';
import { StepHeader } from '@/components/register/StepHeader';
import { OtpInput } from '@/components/register/OtpInput';
import { OTP_LENGTH, RESEND_SECONDS } from '@/components/register/constants';
import { useRegister } from '@/components/register/RegisterContext';

/** Step 3 — enter the 6-digit verification code. */
export default function Otp() {
  const router = useRouter();
  const { contact, channel } = useRegister();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const destination = channel === 'email' ? 'tu correo' : 'tu WhatsApp';

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const startCountdown = () => {
    setSeconds(RESEND_SECONDS);
    timer.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          if (timer.current) clearInterval(timer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (seconds > 0) return;
    setError(false);
    if (channel === 'email') {
      await signUpWithEmailOtp(contact.trim());
    }
    startCountdown();
  };

  const verify = async () => {
    if (code.length !== OTP_LENGTH || channel !== 'email') {
      setError(true);
      return;
    }
    setVerifying(true);
    const { error: verifyError } = await verifyEmailOtp(contact.trim(), code);
    setVerifying(false);
    if (verifyError) {
      setError(true);
      return;
    }
    // A session now exists; the profile + student records are created on the
    // next step. Onboarding stays in the registration flow until then.
    router.push('/student/register/profile');
  };

  return (
    <Screen contentStyle={styles.screen}>
      <StepHeader step={2} />

      <Text variant="title" style={styles.title}>
        INGRESA{'\n'}EL CÓDIGO
      </Text>
      <Text variant="subtitle" style={styles.sub}>
        Enviamos 6 dígitos a{' '}
        <Text variant="subtitle" color={colors.accent}>
          {destination}
        </Text>
        . Válido 10 minutos.
      </Text>

      <OtpInput
        value={code}
        onChange={(c) => {
          setCode(c);
          setError(false);
        }}
        error={error}
      />

      {error ? (
        <Text variant="hint" style={styles.errorText}>
          El código no es válido o expiró. Inténtalo de nuevo.
        </Text>
      ) : null}

      <View style={styles.resend}>
        {seconds > 0 ? (
          <Text variant="cardRole">
            Reenviar en{' '}
            <Text variant="cardRole" color={colors.accent}>
              {seconds}s
            </Text>
          </Text>
        ) : (
          <Text variant="cardRole">
            ¿No llegó?{' '}
            <Text variant="cardRole" color={colors.accent} onPress={handleResend}>
              Reenviar código
            </Text>
          </Text>
        )}
      </View>

      <View style={styles.spacer} />

      <Button label="VERIFICAR" fullWidth loading={verifying} onPress={verify} />
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
  errorText: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  resend: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  spacer: {
    flex: 1,
  },
});
