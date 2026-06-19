import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Screen, Text, colors, spacing } from '@mobvex/ui';
import { MealOptionCard } from '@/components/nutrition/MealOptionCard';
import { useNutritionPlan } from '@/hooks/useNutritionPlan';

// TODO: replace with the authenticated student's id once auth is wired.
const TEMP_STUDENT_ID = '00000000-0000-0000-0000-000000000003';

export default function MealPicker() {
  const router = useRouter();
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const { plan, loading, selectMeal } = useNutritionPlan(TEMP_STUDENT_ID);

  const meal = plan?.meals.find((m) => m.id === mealId);
  const currentIndex = meal
    ? Math.max(
        0,
        meal.meal_recipes.findIndex(
          (mr) => mr.recipe_id === meal.selected_recipe_id,
        ),
      )
    : 0;
  const [choice, setChoice] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </Screen>
    );
  }

  // Plan loaded but the meal id was invalid — back to the plan.
  if (!meal) {
    return <Redirect href="/student/nutrition" />;
  }

  const selectedIndex = choice ?? currentIndex;

  const handleSave = async () => {
    setSaving(true);
    await selectMeal(meal.id, meal.meal_recipes[selectedIndex].recipe_id);
    router.back();
  };

  return (
    <Screen flush>
      <View style={styles.flex}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text variant="label" color={colors.accent} style={styles.eyebrow}>
              {meal.time} h · Elegir comida
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              hitSlop={8}
              onPress={() => router.back()}
            >
              <Feather name="x" size={24} color={colors.muted} />
            </Pressable>
          </View>
          <Text variant="title" style={styles.title}>
            {meal.name.toUpperCase()}
          </Text>
          <Text variant="subtitle" style={styles.subtitle}>
            Tu entrenador dejó {meal.meal_recipes.length} opciones equivalentes.
            Elige la que prefieras hoy.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {meal.meal_recipes.map((option, index) => (
            <MealOptionCard
              key={option.id}
              option={option}
              selected={selectedIndex === index}
              onSelect={() => setChoice(index)}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={
              selectedIndex === currentIndex
                ? 'MANTENER ESTA COMIDA'
                : 'ELEGIR ESTA COMIDA'
            }
            variant="primary"
            fullWidth
            loading={saving}
            onPress={handleSave}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loader: {
    marginTop: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  eyebrow: {
    flex: 1,
    marginTop: 4,
  },
  title: {
    marginTop: 6,
    lineHeight: 38,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 12,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
