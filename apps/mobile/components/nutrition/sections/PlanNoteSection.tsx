import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text, colors, overlays, radius, spacing } from '@mobvex/ui';

type Props = {
  notes?: string;
};

/** Nutrition screen section: trainer's note about the plan, if any. */
export function PlanNoteSection({ notes }: Props) {
  if (!notes) return null;

  return (
    <View style={styles.note}>
      <Feather name="message-circle" size={18} color={colors.accent} style={styles.noteIcon} />
      <Text variant="cardRole" style={styles.noteText}>
        {notes}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
