import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, overlays, radius } from './tokens';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarVariant = 'accent' | 'neutral';

type Props = {
  /** Full name — used to derive initials when no image is provided. */
  name?: string;
  /** Remote image URL. Falls back to initials when absent or while loading. */
  uri?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  style?: StyleProp<ViewStyle>;
};

const DIMENSIONS: Record<AvatarSize, number> = {
  sm: 32,
  md: 44,
  lg: 64,
};

const INITIAL_SIZE: Record<AvatarSize, number> = {
  sm: 12,
  md: 16,
  lg: 22,
};

function initials(name?: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Circular avatar for students and trainers. Shows the remote image when
 * available, otherwise renders neon initials over a translucent accent disc.
 */
export function Avatar({
  name,
  uri,
  size = 'md',
  variant = 'accent',
  style,
}: Props) {
  const dimension = DIMENSIONS[size];
  const shape: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: radius.full,
  };

  if (uri) {
    return (
      <Image
        accessibilityLabel={name}
        source={{ uri }}
        style={[shape, styles.image, style] as StyleProp<ImageStyle>}
      />
    );
  }

  return (
    <View style={[shape, styles.fallback, variantStyles[variant], style]}>
      <Text
        style={[
          styles.initials,
          { fontSize: INITIAL_SIZE[size] },
          variant === 'accent' ? styles.initialsAccent : styles.initialsNeutral,
        ]}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surface2,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  initials: {
    fontFamily: fonts.display,
    letterSpacing: 1,
  },
  initialsAccent: {
    color: colors.accent,
  },
  initialsNeutral: {
    color: colors.text,
  },
});

const variantStyles = StyleSheet.create({
  accent: {
    backgroundColor: overlays.accentIconBg,
    borderColor: overlays.accentIconBorder,
  },
  neutral: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
  },
});
