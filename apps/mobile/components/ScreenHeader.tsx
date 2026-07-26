import { StyleSheet, View, type ScrollViewProps } from 'react-native';
import { Screen, Text, spacing } from '@mobvex/ui';

type Props = {
  title: string;
  subtitle?: string;
  /** Optional element rendered beside the title/subtitle (e.g. a trainer avatar). */
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  /** Pull-to-refresh control forwarded to the scrollable screen. */
  refreshControl?: ScrollViewProps['refreshControl'];
};

/**
 * Shared scrollable screen shell: title + subtitle header, used by every
 * student tab (Rutinas, Progreso, Dieta, …) so the layout stays consistent.
 */
export function ScreenHeader({ title, subtitle, trailing, children, refreshControl }: Props) {
  return (
    <Screen scroll contentStyle={styles.content} refreshControl={refreshControl}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="title" style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="subtitle" style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing}
      </View>
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    lineHeight: 36,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
