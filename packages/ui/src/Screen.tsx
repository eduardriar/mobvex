import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, spacing } from './tokens';

type Props = {
  children: React.ReactNode;
  /** Wrap content in a vertically scrollable area. */
  scroll?: boolean;
  /** Center content vertically and horizontally (welcome / auth screens). */
  centered?: boolean;
  /** Remove the default 24px horizontal screen padding. */
  flush?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Root screen container. Paints the app background and applies the standard
 * horizontal screen padding. Use `scroll` for long content, `centered` for
 * landing / auth screens.
 */
export function Screen({
  children,
  scroll = false,
  centered = false,
  flush = false,
  style,
  contentStyle,
}: Props) {
  const padding = [
    flush ? null : styles.padded,
    centered ? styles.centered : null,
    contentStyle,
  ];

  return (
    <SafeAreaView style={[styles.safe, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, padding]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, padding]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});
