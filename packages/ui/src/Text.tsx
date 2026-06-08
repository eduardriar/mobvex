import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacing,
} from './tokens';

/**
 * Typography roles from the design system. Bebas Neue (display) for brand and
 * action; DM Sans (body) for everything functional.
 */
export type TextVariant =
  | 'logo' // Brand / logo — 42 display
  | 'title' // Screen title — 36 display
  | 'displaySubtitle' // Display subtitle — 28 display
  | 'subtitle' // Screen subtitle — 15 muted
  | 'body' // Default body text — 16
  | 'label' // Field label — 11 uppercase muted
  | 'cardName' // Card primary text — 15 medium
  | 'cardRole' // Card secondary text — 12 muted
  | 'badge' // Badge / pill text — 11 accent
  | 'hint' // Inline hint / error — 13 accent2
  | 'footnote' // Legal / footnote — 12 muted
  | 'link'; // Inline link — 14 accent

type Props = RNTextProps & {
  variant?: TextVariant;
  /** Override the variant's default color with any token color. */
  color?: string;
};

export function Text({ variant = 'body', color, style, ...rest }: Props) {
  return (
    <RNText
      style={[styles[variant], color ? { color } : null, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    fontFamily: fonts.display,
    fontSize: fontSizes.logo,
    letterSpacing: letterSpacing.logo,
    color: colors.text,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.screenTitle,
    letterSpacing: letterSpacing.title,
    color: colors.text,
  },
  displaySubtitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.displaySubtitle,
    letterSpacing: letterSpacing.title,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.subtitle,
    fontWeight: fontWeights.regular,
    color: colors.muted,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSizes.input,
    fontWeight: fontWeights.regular,
    color: colors.text,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  cardName: {
    fontFamily: fonts.body,
    fontSize: fontSizes.subtitle,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  cardRole: {
    fontFamily: fonts.body,
    fontSize: fontSizes.cardRole,
    fontWeight: fontWeights.regular,
    color: colors.muted,
  },
  badge: {
    fontFamily: fonts.body,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.medium,
    color: colors.accent,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.chip,
    fontWeight: fontWeights.regular,
    color: colors.accent2,
  },
  footnote: {
    fontFamily: fonts.body,
    fontSize: fontSizes.cardRole,
    fontWeight: fontWeights.regular,
    color: colors.muted,
  },
  link: {
    fontFamily: fonts.body,
    fontSize: fontSizes.link,
    fontWeight: fontWeights.regular,
    color: colors.accent,
  },
});
