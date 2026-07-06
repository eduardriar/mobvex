import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Screen, Text, colors, overlays, spacing } from '@mobvex/ui';
import { TrainerCard } from '@/components/register/TrainerCard';
import { useRegister } from '@/components/register/RegisterContext';
import { useAuth } from '@/components/auth/AuthProvider';

/** Step 5 — confirmation that the account was created and linked to a trainer. */
export default function Success() {
  const router = useRouter();
  const { trainer } = useRegister();
  const { refresh } = useAuth();
  const [entering, setEntering] = useState(false);

  // The records were created on the previous step; refresh so the resolved
  // student id is in context before landing on the dashboard.
  const goToDashboard = async () => {
    setEntering(true);
    await refresh();
    router.replace('/student');
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View />

      <View style={styles.center}>
        <View style={styles.icon}>
          <Text style={styles.check}>✓</Text>
        </View>
        <Text variant="title" style={styles.heading}>
          CUENTA{'\n'}CREADA
        </Text>
        <Text variant="subtitle" style={styles.body}>
          Quedaste vinculado con tu entrenador. Ya puedes ver tus rutinas y
          comenzar a registrar tu progreso.
        </Text>
        {trainer ? (
          <TrainerCard
            name={trainer.name}
            role="Tu entrenador asignado"
            badge="✓ Activo"
            style={styles.trainer}
          />
        ) : null}
      </View>

      <Button
        label="IR AL DASHBOARD"
        fullWidth
        loading={entering}
        onPress={goToDashboard}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: overlays.accentBadgeBg,
    borderWidth: 1,
    borderColor: overlays.accentCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  check: {
    fontSize: 40,
    lineHeight: 44,
    color: colors.accent,
  },
  heading: {
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: spacing.sm,
  },
  body: {
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 24,
  },
  trainer: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
});
