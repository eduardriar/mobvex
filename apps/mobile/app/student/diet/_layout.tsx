import { Stack } from 'expo-router';

/** Full-screen diet flows (meal picker), presented over the tabs. */
export default function DietLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
