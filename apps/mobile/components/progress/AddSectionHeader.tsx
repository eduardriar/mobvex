import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, colors, fonts, fontSizes, overlays, radius, spacing } from '@mobvex/ui';
import { COPY } from '@/lib/copy';

const T = COPY.progress.common;

type Props = {
  title: string;
  onAdd: () => void;
};

/** Section header with a right-aligned accent "+ Añadir" pill button. */
export function AddSectionHeader({ title, onAdd }: Props) {
  return (
    <View style={styles.row}>
      <Text variant="label">{title}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={T.addAccessibilityLabel(title)}
        onPress={onAdd}
        style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
      >
        <Feather name="plus" size={14} color={colors.accent} />
        <Text style={styles.label}>{T.add}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: overlays.accentBadgeBg,
    borderWidth: 1,
    borderColor: overlays.accentCardBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.chip,
    fontWeight: '500',
    color: colors.accent,
  },
});
