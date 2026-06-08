import { Pressable, StyleSheet } from 'react-native';
import { Text, colors, fonts, type CategoryHue } from '@mobvex/ui';
import { CategoryIcon } from './CategoryIcon';

type Props = {
  icon: string;
  hue: CategoryHue;
  title: string;
  text: string;
  onPress?: () => void;
};

/** Fixed-width trainer tip card for the horizontal rail. */
export function TipCard({ icon, hue, title, text, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <CategoryIcon emoji={icon} hue={hue} size={36} />
      <Text style={styles.title}>{title}</Text>
      <Text variant="cardRole" style={styles.text}>
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  pressed: {
    borderColor: colors.muted,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    marginTop: 10,
    marginBottom: 6,
    lineHeight: 17,
  },
  text: {
    fontSize: 11,
    lineHeight: 18,
  },
});
