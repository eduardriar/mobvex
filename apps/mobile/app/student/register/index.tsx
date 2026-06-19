import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Divider, Screen, Text, colors, spacing } from '@mobvex/ui';
import { useRegister } from '@/components/register/RegisterContext';

/** Step 0 — welcome / invitation landing. */
export default function Welcome() {
  const router = useRouter();
  // The invite arrives via deep link, e.g. mobvex://student/register?invite=<token>.
  const { invite } = useLocalSearchParams<{ invite?: string }>();
  const { resolveInvite } = useRegister();

  useEffect(() => {
    if (invite) resolveInvite(invite);
  }, [invite, resolveInvite]);

  return (
    <Screen contentStyle={styles.screen}>
      <View>
        <Text variant="logo">
          MOB
          <Text variant="logo" color={colors.accent}>
            VEX
          </Text>
        </Text>
        <Divider variant="accent" style={styles.deco} />
        <Text variant="subtitle" style={styles.intro}>
          Tu entrenador te invitó a entrenar en la plataforma.
        </Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.emoji}>🏋️</Text>
        <Text variant="displaySubtitle" style={styles.heroTitle}>
          ¿LISTO PARA{'\n'}ENTRENAR?
        </Text>
        <Text variant="cardRole">Regístrate en menos de 2 minutos</Text>
      </View>

      <View>
        <Button
          label="COMENZAR"
          fullWidth
          onPress={() => router.push('/student/register/contact')}
        />
        <View style={styles.loginRow}>
          <Text variant="cardRole">¿Ya tienes cuenta? </Text>
          <Text
            variant="cardRole"
            color={colors.accent}
            onPress={() => router.push('/student/register/contact')}
          >
            Inicia sesión
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  deco: {
    marginVertical: spacing.md,
  },
  intro: {
    maxWidth: 260,
    lineHeight: 24,
  },
  hero: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
});
