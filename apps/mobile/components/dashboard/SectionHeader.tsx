import { StyleSheet, View } from 'react-native';
import { Text } from '@mobvex/ui';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Section label with an optional right-aligned "see all" action. */
export function SectionHeader({ title, actionLabel, onAction }: Props) {
  return (
    <View style={styles.row}>
      <Text variant="label">{title}</Text>
      {actionLabel ? (
        <Text variant="link" style={styles.action} onPress={onAction}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  action: {
    fontSize: 12,
  },
});
