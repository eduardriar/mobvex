import { StyleSheet, View } from 'react-native';
import { Text, colors } from '@mobvex/ui';

type Props = {
  label: string;
};

/** Small read-only metadata pill (kcal, protein, time…). */
export function Tag({ label }: Props) {
  return (
    <View style={styles.base}>
      <Text variant="footnote" style={styles.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
  },
});
