import { StyleSheet, Text, View } from 'react-native';
import { categories, type CategoryHue } from '@mobvex/ui';

type Props = {
  emoji: string;
  hue: CategoryHue;
  size?: number;
};

/** An emoji glyph inside a translucent, hue-tinted rounded square. */
export function CategoryIcon({ emoji, hue, size = 40 }: Props) {
  const c = categories[hue];
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size >= 40 ? 12 : 10,
          backgroundColor: c.bg,
          borderColor: c.border,
        },
      ]}
    >
      <Text style={{ fontSize: Math.round(size * 0.5) }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
