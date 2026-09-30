import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Text, colors, fontSizes, spacing } from '@mobvex/ui';
import { COPY } from '@/lib/copy';

const T = COPY.routines;

type Props = {
  name: string;
  exercises: string[];
  onStart?: () => void;
  onMenu?: () => void;
};

/** Summary card for an assigned routine: title, exercise preview, start CTA. */
export function RoutineSummaryCard({ name, exercises, onStart, onMenu }: Props) {
  return (
    <Card>
      <View style={styles.header}>
        <Text variant="cardName" style={styles.title}>
          {name}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={T.routineOptions}
          hitSlop={8}
          onPress={onMenu}
        >
          <Feather name="more-horizontal" size={20} color={colors.muted} />
        </Pressable>
      </View>

      <Text variant="cardRole" numberOfLines={2} style={styles.exercises}>
        {exercises.join(', ')}
      </Text>

      <Button
        label={T.startRoutine}
        variant="primary"
        fullWidth
        onPress={onStart}
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fontSizes.input,
  },
  exercises: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  button: {
    marginTop: spacing.md,
  },
});
