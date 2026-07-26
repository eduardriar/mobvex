import { StyleSheet, View } from 'react-native';
import { Text, spacing } from '@mobvex/ui';
import type { MealWithOptions } from '@mobvex/db';
import { getSelectedMealOption } from '../NutritionProvider';
import { MealCard } from '../MealCard';
import { COPY } from '@/lib/copy';

const T = COPY.nutrition.meals;

type Props = {
  meals: MealWithOptions[];
  onPressMeal: (mealId: string) => void;
};

/** Nutrition screen section: the day's meals, each showing the chosen option. */
export function MealsSection({ meals, onPressMeal }: Props) {
  return (
    <View style={styles.section}>
      <Text variant="label">{T.sectionTitle}</Text>
      <View style={styles.meals}>
        {meals.map((meal) => {
          const option = getSelectedMealOption(meal);
          if (!option) return null;
          return (
            <MealCard
              key={meal.id}
              meal={meal}
              option={option}
              onPress={() => onPressMeal(meal.id)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
  },
  meals: {
    marginTop: 12,
    gap: 14,
  },
});
