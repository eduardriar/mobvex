import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing } from '@mobvex/ui';
import { StepDots } from './StepDots';

type Props = {
  /** Zero-based index of the current step, passed through to the step dots. */
  step: number;
};

/** Top bar shared by every form step: a back button and the step indicator. */
export function StepHeader({ step }: Props) {
  const router = useRouter();

  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed ? styles.backPressed : null]}
      >
        <Text style={styles.chevron}>‹</Text>
      </Pressable>
      <StepDots current={step} />
      <View style={styles.spacer} />
    </View>
  );
}

const SIZE = 36;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  back: {
    width: SIZE,
    height: SIZE,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: {
    backgroundColor: colors.border,
  },
  chevron: {
    fontFamily: fonts.body,
    fontSize: 24,
    lineHeight: 26,
    color: colors.text,
    marginTop: -2,
  },
  spacer: {
    width: SIZE,
  },
});
