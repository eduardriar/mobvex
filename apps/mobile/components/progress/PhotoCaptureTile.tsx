import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Text, categories, colors, fonts, radius, spacing, type CategoryHue } from '@mobvex/ui';

type Props = {
  label: string;
  hint: string;
  hue: CategoryHue;
  /** Signed URL of the already-captured photo, if any. */
  imageUrl?: string | null;
  uploading?: boolean;
  onPress?: () => void;
};

/** Capture slot for one progress-photo pose: tap to take/pick, shows a preview. */
export function PhotoCaptureTile({
  label,
  hint,
  hue,
  imageUrl,
  uploading = false,
  onPress,
}: Props) {
  const c = categories[hue];
  const hasPhoto = Boolean(imageUrl);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${hasPhoto ? 'Reemplazar' : 'Añadir'} foto · ${label}`}
        disabled={uploading}
        onPress={onPress}
        style={({ pressed }) => [
          styles.tile,
          { backgroundColor: c.tint, borderColor: hasPhoto ? c.solid : c.border },
          pressed ? styles.pressed : null,
        ]}
      >
        {hasPhoto ? (
          <Image source={{ uri: imageUrl! }} style={styles.image} resizeMode="cover" />
        ) : null}

        {uploading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : hasPhoto ? (
          // A small badge over the photo to re-take.
          <View style={styles.retake}>
            <Feather name="refresh-ccw" size={14} color={colors.text} />
          </View>
        ) : (
          <>
            <View style={[styles.iconCircle, { backgroundColor: c.bg, borderColor: c.border }]}>
              <Feather name="camera" size={24} color={c.solid} />
            </View>
            <Text variant="cardRole" style={styles.helper}>
              Toca para abrir la cámara o elegir un archivo
            </Text>
          </>
        )}
      </Pressable>
      <Text style={styles.label}>{label}</Text>
      <Text variant="cardRole">{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '48%',
  },
  tile: {
    height: 200,
    borderRadius: radius.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 11, 0.55)',
  },
  retake: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: 'rgba(10, 10, 11, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: {
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
});
