import { Tabs } from 'expo-router';
import { StudentTabBar } from '@/components/dashboard/StudentTabBar';

/**
 * Student section shell with the custom neon tab bar. Nav order:
 * Inicio · Rutinas · Progreso · Dieta. `tips` stays a route but is kept out of
 * the bar (retired tab).
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <StudentTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="routines" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="nutrition" />
      <Tabs.Screen name="tips" />
    </Tabs>
  );
}
