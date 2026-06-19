import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Alert,
  Avatar,
  Screen,
  Text,
  colors,
  fonts,
  overlays,
  radius,
  spacing,
} from '@mobvex/ui';
import { MacroBar } from '@/components/nutrition/MacroBar';
import { MealCard } from '@/components/nutrition/MealCard';
import { useNutritionPlan } from '@/hooks/useNutritionPlan';

// TODO: replace with the authenticated student's id once auth is wired.
const TEMP_STUDENT_ID = '00000000-0000-0000-0000-000000000003';
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
  const { plan, loading, error, reload } = useNutritionPlan(TEMP_STUDENT_ID);

  // Pick up a freshly changed meal option when returning from the picker.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const subtitle = plan
    ? `${plan.name} · ${assignedLabel(plan.created_at)}`
    : 'Tu plan aparecerá aquí.';

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="title" style={styles.title}>
            {'TU\nDIETA'}
          </Text>
          <Text variant="subtitle" style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>
        <Avatar name={TRAINER_NAME} />
      </View>

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
                const option =
                  meal.meal_recipes.find(
                    (mr) => mr.recipe_id === meal.selected_recipe_id,
                  ) ?? meal.meal_recipes[0];
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    lineHeight: 36,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
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
