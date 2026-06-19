import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, Text, categories, colors, fonts } from '@mobvex/ui';
import type { MealOption, MealWithOptions } from '@mobvex/db';

/** Category-tinted icon tile for a meal. */
function MealGlyph({ meal }: { meal: MealWithOptions }) {
  const c = categories[meal.hue];
  return (
    <View style={[styles.tile, { backgroundColor: c.bg, borderColor: c.border }]}>
      {meal.icon === 'droplet' ? (
        <Feather name="droplet" size={20} color={c.solid} />
      ) : (
        <MaterialCommunityIcons name="silverware-fork-knife" size={20} color={c.solid} />
      )}
    </View>
  );
}

type Props = {
  meal: MealWithOptions;
  /** The currently selected option for this meal. */
  option: MealOption;
  onPress: () => void;
};

/** A meal in the day's plan: icon, name, selected option + items, "Cambiar". */
export function MealCard({ meal, option, onPress }: Props) {
  const recipe = option.recipe;

  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <MealGlyph meal={meal} />
        <View style={styles.headerText}>
          <Text variant="cardName" style={styles.name}>
            {meal.name}
          </Text>
          <Text variant="cardRole" style={styles.meta}>
            {meal.time} h · {recipe.name}
          </Text>
        </View>
        <Text style={styles.kcal}>
          {recipe.kcal}
          <Text style={styles.kcalUnit}> kcal</Text>
        </Text>
      </View>

      <View style={styles.items}>
        {recipe.recipe_items.map((item, i) => (
          <View key={item.id} style={[styles.itemRow, i > 0 ? styles.itemDivider : null]}>
            <Text variant="cardRole" style={styles.food}>
              {item.food}
            </Text>
            <Text variant="cardRole" style={styles.qty}>
              {item.qty}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text variant="cardRole" style={styles.footerLabel}>
          {meal.meal_recipes.length} opciones del entrenador
        </Text>
        <View style={styles.change}>
          <Text style={styles.changeText}>Cambiar</Text>
          <Feather name="chevron-right" size={15} color={colors.accent} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tile: {
    width: 40,
    height: 40,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    marginTop: 2,
  },
  kcal: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.accent,
  },
  kcalUnit: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
  },
  items: {
    marginTop: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  food: {
    color: colors.text,
    fontSize: 13,
  },
  qty: {
    fontSize: 13,
  },
  footer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontSize: 12,
  },
  change: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  changeText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
});
