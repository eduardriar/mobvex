import { StyleSheet } from 'react-native';
import { Screen, Text, spacing } from '@mobvex/ui';

type Props = {
  title: string;
  subtitle?: string;
};

/** Placeholder body for tabs whose full screen isn't built yet. */
export function ComingSoon({ title, subtitle = 'Próximamente.' }: Props) {
  return (
    <Screen contentStyle={styles.content}>
      <Text variant="title" style={styles.title}>
        {title}
      </Text>
      <Text variant="subtitle">{subtitle}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
  },
  title: {
    lineHeight: 36,
    marginBottom: spacing.xs,
  },
});
