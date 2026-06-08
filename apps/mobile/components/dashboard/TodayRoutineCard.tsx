import { StyleSheet, View } from 'react-native';
import { Badge, Card, Text, colors, fonts, letterSpacing } from '@mobvex/ui';

type Props = {
  day: string;
  name: string;
  meta: string;
  chips: readonly string[];
  status: string;
  onPress?: () => void;
};

/** Highlighted "today's routine" card (neon active surface). */
export function TodayRoutineCard({ day, name, meta, chips, status, onPress }: Props) {
  return (
    <Card variant="active" onPress={onPress}>
      <Text style={styles.day}>{day}</Text>
      <Text style={styles.name}>{name}</Text>
      <Text variant="cardRole" style={styles.meta}>
        {meta}
      </Text>
      <View style={styles.chips}>
        {chips.map((c) => (
          <View key={c} style={styles.chip}>
            <Text style={styles.chipText}>{c}</Text>
          </View>
        ))}
        <Badge label={status} style={styles.badge} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  day: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: colors.accent,
    marginBottom: 8,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: letterSpacing.title,
    color: colors.text,
    lineHeight: 28,
    marginBottom: 4,
  },
  meta: {
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
  },
  badge: {
    marginLeft: 'auto',
  },
});
