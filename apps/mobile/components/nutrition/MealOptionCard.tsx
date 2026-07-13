import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, Text, colors, fonts, radius } from '@mobvex/ui';
import type { MealOption } from '@mobvex/db';

type Props = {
  option: MealOption;
  selected: boolean;
  onSelect: () => void;
};

/** One selectable meal option in the picker: radio + name + kcal + items. */
export function MealOptionCard({ option, selected, onSelect }: Props) {
  return (
    <Card variant={selected ? 'active' : 'default'} onPress={onSelect}>
      <View style={styles.header}>
        <View style={[styles.radio, selected ? styles.radioOn : null]}>
          {selected ? (
            <Feather name="check" size={15} color={colors.onAccent} />
          ) : null}
        </View>
        <Text variant="cardName" style={styles.name}>
          {option.recipe.name}
        </Text>
        <Text style={[styles.kcal, selected ? styles.kcalOn : null]}>
          {option.kcal}
          <Text style={styles.kcalUnit}> kcal</Text>
        </Text>
      </View>

      <View style={styles.items}>
        {option.meal_recipe_items.map((item, i) => (
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
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  kcal: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.text,
  },
  kcalOn: {
    color: colors.accent,
  },
  kcalUnit: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
  },
  items: {
    marginTop: 14,
    paddingLeft: 36,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
});
