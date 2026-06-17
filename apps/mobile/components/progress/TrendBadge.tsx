import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text, colors, fonts, fontSizes, overlays, radius } from '@mobvex/ui';

type Props = {
  /** Signed change; sign picks the arrow direction, shown to one decimal. */
  delta: number;
};

/** Accent pill showing a signed trend with a directional arrow (e.g. ↗ +1.5). */
export function TrendBadge({ delta }: Props) {
  const up = delta >= 0;
  const label = `${up ? '+' : '−'}${Math.abs(delta).toFixed(1)}`;

  return (
    <View style={styles.badge}>
      <Feather
        name={up ? 'arrow-up-right' : 'arrow-down-right'}
        size={12}
        color={colors.accent}
      />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: overlays.accentBadgeBg,
    borderWidth: 1,
    borderColor: overlays.accentCardBorder,
    borderRadius: radius.badge,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: fontSizes.label,
    fontWeight: '500',
    color: colors.accent,
  },
});
