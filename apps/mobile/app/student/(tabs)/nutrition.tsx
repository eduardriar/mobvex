import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Alert,
  Avatar,
  Text,
  colors,
  fonts,
  overlays,
  radius,
  spacing,
} from '@mobvex/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MacroBar } from '@/components/nutrition/MacroBar';
import { MealCard } from '@/components/nutrition/MealCard';
import { getSelectedMealOption, useNutritionPlan } from '@/components/nutrition/NutritionProvider';

// TODO: derive from the plan's trainer once joined into the query.
const TRAINER_NAME = 'Carlos Moreno';

/** Relative label for when the plan was assigned. */
function assignedLabel(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Asignado hoy';
  if (days === 1) return 'Asignado ayer';
  return `Asignado hace ${days} días`;
}

export default function Nutrition() {
  const router = useRouter();
  const { plan, loading, error } = useNutritionPlan();

  const subtitle = plan
    ? `${plan.name} · ${assignedLabel(plan.created_at)}`
    : 'Tu plan aparecerá aquí.';

  return (
    <ScreenHeader
      title={'TU DIETA'}
      subtitle={subtitle}
    >
      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.feedback} />
      ) : error ? (
        <Alert message="No pudimos cargar tu dieta." style={styles.feedback} />
      ) : !plan ? (
        <Text variant="subtitle" style={styles.feedback}>
          Aún no tienes un plan de nutrición asignado.
        </Text>
      ) : (
        <>
          {plan.notes ? (
            <View style={styles.note}>
              <Feather name="message-circle" size={18} color={colors.accent} style={styles.noteIcon} />
              <Text variant="cardRole" style={styles.noteText}>
                {plan.notes}
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text variant="label">Objetivo diario</Text>
            <View style={styles.targetCard}>
              <View style={styles.kcalRow}>
                <View style={styles.kcalValueRow}>
                  <Text style={styles.kcal}>
                    {(plan.target_calories ?? 0).toLocaleString('es')}
                  </Text>
                  <Text style={styles.kcalUnit}>kcal / día</Text>
                </View>
                <MaterialCommunityIcons name="fire" size={22} color={colors.accent} />
              </View>
              <View style={styles.macros}>
                <MacroBar label="Proteína" value={plan.protein_g ?? 0} unit="g" pct={75} hue="green" />
                <MacroBar label="Carbos" value={plan.carbs_g ?? 0} unit="g" pct={62} hue="orange" />
                <MacroBar label="Grasas" value={plan.fat_g ?? 0} unit="g" pct={45} hue="blue" />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="label">Comidas del día</Text>
            <View style={styles.meals}>
              {plan.meals.map((meal) => {
                const option = getSelectedMealOption(meal);
                if (!option) return null;
                return (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    option={option}
                    onPress={() => router.push(`/student/diet/${meal.id}`)}
                  />
                );
              })}
            </View>
          </View>
        </>
      )}
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  feedback: {
    marginTop: spacing.xl,
  },
  note: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.xl,
    backgroundColor: overlays.accentCardBg,
    borderWidth: 1,
    borderColor: overlays.accentCardBorder,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  noteIcon: {
    marginTop: 1,
  },
  noteText: {
    flex: 1,
    color: colors.text,
    lineHeight: 20,
  },
  section: {
    marginTop: spacing.xl,
  },
  targetCard: {
    marginTop: 12,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: 20,
  },
  kcalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kcalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  kcal: {
    fontFamily: fonts.display,
    fontSize: 46,
    lineHeight: 46,
    color: colors.accent,
  },
  kcalUnit: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  macros: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 22,
  },
  meals: {
    marginTop: 12,
    gap: 14,
  },
});
