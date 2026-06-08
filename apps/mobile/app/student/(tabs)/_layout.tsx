import { Tabs } from 'expo-router';
import { StudentTabBar } from '@/components/dashboard/StudentTabBar';

/** Student section shell — five tabs with the custom neon tab bar. */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <StudentTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="routines" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="tips" />
      <Tabs.Screen name="recipes" />
    </Tabs>
  );
}
