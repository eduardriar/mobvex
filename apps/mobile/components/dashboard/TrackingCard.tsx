import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, categories, colors, type CategoryHue } from '@mobvex/ui';
import { CategoryIcon } from './CategoryIcon';

type Props = {
  icon: string;
  hue: CategoryHue;
  title: string;
  sub: string;
  onPress?: () => void;
  /** Footer content: a progress bar + meta, deltas, etc. */
  children?: React.ReactNode;
};

/** Progress-tracking entry card (photos, measurements) with a hue accent bar. */
export function TrackingCard({ icon, hue, title, sub, onPress, children }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={[styles.accentBar, { backgroundColor: categories[hue].border }]} />
      <View style={styles.row}>
        <View style={styles.left}>
          <CategoryIcon emoji={icon} hue={hue} size={40} />
          <View style={styles.text}>
            <Text variant="cardName">{title}</Text>
            <Text variant="cardRole" style={styles.sub}>
              {sub}
            </Text>
          </View>
        </View>
        <View style={styles.arrow}>
          <Feather name="chevron-right" size={14} color={colors.muted} />
        </View>
      </View>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    overflow: 'hidden',
  },
  pressed: {
    borderColor: colors.muted,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  text: {
    flex: 1,
  },
  sub: {
    marginTop: 2,
  },
  arrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
