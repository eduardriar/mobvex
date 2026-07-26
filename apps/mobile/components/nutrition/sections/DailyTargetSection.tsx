import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, colors, fonts, radius, spacing } from '@mobvex/ui';
import { MacroBar } from '../MacroBar';
import { COPY } from '@/lib/copy';

const T = COPY.nutrition.dailyTarget;

type Props = {
  targetCalories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
};

/** Nutrition screen section: daily calorie target and macro bars. */
export function DailyTargetSection({ targetCalories, proteinG, carbsG, fatG }: Props) {
  return (
    <View style={styles.section}>
      <Text variant="label">{T.sectionTitle}</Text>
      <View style={styles.targetCard}>
        <View style={styles.kcalRow}>
          <View style={styles.kcalValueRow}>
            <Text style={styles.kcal}>{(targetCalories ?? 0).toLocaleString('es')}</Text>
            <Text style={styles.kcalUnit}>{T.kcalUnit}</Text>
          </View>
          <MaterialCommunityIcons name="fire" size={22} color={colors.accent} />
        </View>
        <View style={styles.macros}>
          <MacroBar label={T.protein} value={proteinG ?? 0} unit="g" pct={75} hue="green" />
          <MacroBar label={T.carbs} value={carbsG ?? 0} unit="g" pct={62} hue="orange" />
          <MacroBar label={T.fat} value={fatG ?? 0} unit="g" pct={45} hue="blue" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
