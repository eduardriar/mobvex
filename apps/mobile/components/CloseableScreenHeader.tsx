import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text, colors, spacing } from '@mobvex/ui';

type Props = {
  eyebrow: string;
  title: string;
  /** Optional date line under the title, shown with a calendar icon. */
  dateLabel?: string;
  onClose: () => void;
  closeAccessibilityLabel?: string;
};

/**
 * Shared header for closeable form/detail screens (new measurement, new
 * photos, active workout): eyebrow label, title, optional date line, and a
 * close (X) button aligned to the top-right.
 */
export function CloseableScreenHeader({
  eyebrow,
  title,
  dateLabel,
  onClose,
  closeAccessibilityLabel = 'Cerrar',
}: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text variant="label" style={styles.eyebrow}>
          {eyebrow}
        </Text>
        <Text variant="title" style={styles.title}>
          {title}
        </Text>
        {dateLabel ? (
          <View style={styles.dateRow}>
            <Feather name="calendar" size={14} color={colors.muted} />
            <Text variant="subtitle">{dateLabel}</Text>
          </View>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={closeAccessibilityLabel}
        hitSlop={8}
        onPress={onClose}
      >
        <Feather name="x" size={24} color={colors.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  title: {
    lineHeight: 36,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
});
