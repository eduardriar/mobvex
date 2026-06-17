import { Feather } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text, categories, colors, radius, spacing, type CategoryHue } from '@mobvex/ui';

type Props = {
  weekLabel: string;
  dateLabel: string;
  hue: CategoryHue;
  /** Signed URL of the photo for this session, if one exists. */
  imageUrl?: string | null;
  /** Highlights the tile (accent border + dot) — e.g. the most recent photo. */
  active?: boolean;
  onPress?: () => void;
};

/**
 * Progress-photo tile: shows the captured photo when available, otherwise a
 * camera placeholder on a hue-tinted square.
 */
export function PhotoThumbnail({
  weekLabel,
  dateLabel,
  hue,
  imageUrl,
  active = false,
  onPress,
}: Props) {
  const c = categories[hue];
  const hasPhoto = Boolean(imageUrl);

  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View
        style={[
          styles.thumb,
          { backgroundColor: c.bg },
          active ? styles.thumbActive : { borderColor: colors.border },
        ]}
      >
        {hasPhoto ? (
          <Image source={{ uri: imageUrl! }} style={styles.image} resizeMode="cover" />
        ) : (
          <Feather
            name="camera"
            size={30}
            color={active ? colors.accent : colors.muted}
          />
        )}
        {active ? <View style={styles.dot} /> : null}
      </View>
      <Text variant="cardName" style={styles.week}>
        {weekLabel}
      </Text>
      <Text variant="cardRole">{dateLabel}</Text>
    </Pressable>
  );
}

const THUMB_SIZE = 140;

const styles = StyleSheet.create({
  wrap: {
    width: THUMB_SIZE,
  },
  thumb: {
    width: THUMB_SIZE,
    height: 150,
    borderRadius: radius.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbActive: {
    borderColor: colors.accent,
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  week: {
    marginTop: spacing.xs,
  },
});
