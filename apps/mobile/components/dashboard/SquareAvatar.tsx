import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, overlays } from '@mobvex/ui';

type Props = {
  initials: string;
  size?: number;
};

/** Rounded-square avatar with neon initials (student / trainer). */
export function SquareAvatar({ initials, size = 40 }: Props) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size >= 48 ? 14 : 12 },
      ]}
    >
      <Text style={[styles.text, { fontSize: Math.round(size * 0.4) }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: overlays.accentIconBg,
    borderWidth: 1,
    borderColor: overlays.accentIconBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.display,
    color: colors.accent,
    letterSpacing: 1,
  },
});
