import { ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Alert, Text, colors, spacing } from '@mobvex/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PlanNoteSection } from '@/components/nutrition/sections/PlanNoteSection';
import { DailyTargetSection } from '@/components/nutrition/sections/DailyTargetSection';
import { MealsSection } from '@/components/nutrition/sections/MealsSection';
import { useNutritionPlan } from '@/components/nutrition/NutritionProvider';
import { COPY } from '@/lib/copy';

const T = COPY.nutrition;

/** Relative label for when the plan was assigned. */
function assignedLabel(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return T.assignedToday;
  if (days === 1) return T.assignedYesterday;
  return T.assignedDaysAgo(days);
}

export default function Nutrition() {
  const router = useRouter();
  const { plan, loading, error } = useNutritionPlan();

  const subtitle = plan
    ? `${plan.name} · ${assignedLabel(plan.created_at)}`
    : T.noPlanSubtitle;

  return (
    <ScreenHeader title={T.title} subtitle={subtitle}>
      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.feedback} />
      ) : error ? (
        <Alert message={T.loadError} style={styles.feedback} />
      ) : !plan ? (
        <Text variant="subtitle" style={styles.feedback}>
          {T.emptyState}
        </Text>
      ) : (
        <>
          <PlanNoteSection notes={plan.notes} />

          <DailyTargetSection
            targetCalories={plan.target_calories}
            proteinG={plan.protein_g}
            carbsG={plan.carbs_g}
            fatG={plan.fat_g}
          />

          <MealsSection
            meals={plan.meals}
            onPressMeal={(mealId) => router.push(`/student/diet/${mealId}`)}
          />
        </>
      )}
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  feedback: {
    marginTop: spacing.xl,
  },
});
