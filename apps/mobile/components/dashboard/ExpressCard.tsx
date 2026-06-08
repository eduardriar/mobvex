import { Pressable, StyleSheet, View } from 'react-native';
import { Text, colors, fonts, letterSpacing, type CategoryHue } from '@mobvex/ui';
import { CategoryIcon } from './CategoryIcon';

type Props = {
  time: string;
  icon: string;
  hue: CategoryHue;
  name: string;
  meta: string;
  onPress?: () => void;
};

/** Fixed-width express-routine card for the horizontal rail. */
export function ExpressCard({ time, icon, hue, name, meta, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.top}>
        <Text style={styles.time}>
          {time}
          <Text style={styles.unit}>min</Text>
        </Text>
        <CategoryIcon emoji={icon} hue={hue} size={32} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text variant="cardRole">{meta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  pressed: {
    borderColor: colors.muted,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  time: {
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: letterSpacing.title,
    color: colors.accent,
    lineHeight: 28,
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
});
