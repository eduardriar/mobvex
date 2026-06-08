import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { Text, categories, colors, fonts, type CategoryHue } from '@mobvex/ui';
import { Tag } from './Tag';

type Props = {
  emoji: string;
  hue: CategoryHue;
  name: string;
  tags: string[];
  onPress?: () => void;
};

/** Fixed-width recipe card with a tinted thumbnail for the horizontal rail. */
export function RecipeCard({ emoji, hue, name, tags, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={[styles.img, { backgroundColor: categories[hue].tint }]}>
        <RNText style={styles.emoji}>{emoji}</RNText>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.tags}>
          {tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pressed: {
    borderColor: colors.muted,
  },
  img: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
  },
  body: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 17,
    marginBottom: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
