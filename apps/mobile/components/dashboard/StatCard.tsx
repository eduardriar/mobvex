import { StyleSheet, View } from 'react-native';
import { Text, colors, fonts, letterSpacing } from '@mobvex/ui';

type Props = {
  value: string;
  sup?: string;
  label: string;
  accent?: boolean;
};

/** Compact metric tile used in the dashboard stats row. */
export function StatCard({ value, sup, label, accent = false }: Props) {
  return (
    <View style={styles.card}>
      <Text style={[styles.num, accent ? styles.numAccent : null]}>
        {value}
        {sup ? <Text style={styles.sup}>{sup}</Text> : null}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  num: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: letterSpacing.title,
    color: colors.text,
    lineHeight: 28,
  },
  numAccent: {
    color: colors.accent,
  },
  sup: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 13,
  },
});
