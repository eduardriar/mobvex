import { Stack } from 'expo-router';

/** Full-screen workout flow (no tab bar). */
export default function WorkoutLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
