import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Text, colors, spacing } from '@mobvex/ui';
import { ExerciseVideoPlayer } from '@/components/workout/ExerciseVideoPlayer';

export default function ExerciseVideoScreen() {
  const router = useRouter();
  const { videoId, title } = useLocalSearchParams<{
    videoId: string;
    title?: string;
  }>();

  if (!videoId) {
    return <Redirect href="/student" />;
  }

  return (
    <Screen flush>
      <View style={styles.header}>
        <Text variant="cardName" style={styles.title} numberOfLines={1}>
          {title ?? 'Video del ejercicio'}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          hitSlop={8}
          onPress={() => {
            // router.back() throws "GO_BACK was not handled" when this screen
            // has no history to pop to (e.g. opened directly via deep link) —
            // fall back to a known-safe destination instead of crashing.
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/student');
            }
          }}
        >
          <Feather name="x" size={24} color={colors.muted} />
        </Pressable>
      </View>

      <ExerciseVideoPlayer videoId={videoId} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    flex: 1,
  },
});
