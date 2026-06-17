import { StyleSheet, type ScrollViewProps } from 'react-native';
import { Screen, Text, spacing } from '@mobvex/ui';

type Props = {
  title: string;
  subtitle?: string;
  /** Optional real content rendered below the placeholder header. */
  children?: React.ReactNode;
  /** Pull-to-refresh control forwarded to the scrollable screen. */
  refreshControl?: ScrollViewProps['refreshControl'];
};

/** Placeholder header for tabs whose full screen isn't built yet. */
export function ComingSoon({
  title,
  subtitle = 'Próximamente.',
  children,
  refreshControl,
}: Props) {
  return (
    <Screen scroll contentStyle={styles.content} refreshControl={refreshControl}>
      <Text variant="title" style={styles.title}>
        {title}
      </Text>
      <Text variant="subtitle">{subtitle}</Text>
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    lineHeight: 36,
    marginBottom: spacing.xs,
  },
});
