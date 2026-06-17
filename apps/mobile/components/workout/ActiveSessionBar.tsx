import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import {
  Card,
  Text,
  colors,
  fonts,
  letterSpacing,
  spacing,
} from '@mobvex/ui';
import { ProgressBar } from '@/components/dashboard/ProgressBar';

type Props = {
  routineName: string;
  completedSets: number;
  totalSets: number;
  onPress: () => void;
};

/** Compact resume bar for an in-progress session, shown on the dashboard. */
export function ActiveSessionBar({
  routineName,
  completedSets,
  totalSets,
  onPress,
}: Props) {
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  return (
    <Card variant="active" onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Rutina en curso</Text>
        <View style={styles.continue}>
          <Text variant="badge">Continuar</Text>
          <Feather name="chevron-right" size={16} color={colors.accent} />
        </View>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {routineName}
      </Text>

      <View style={styles.progress}>
        <ProgressBar progress={progress} />
      </View>
      <Text variant="cardRole" style={styles.count}>
        {completedSets} de {totalSets} series completadas
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: letterSpacing.title,
    color: colors.text,
    lineHeight: 28,
    marginTop: 8,
    marginBottom: spacing.md,
  },
  progress: {
    marginBottom: 6,
  },
  count: {},
});
