import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans';
import { colors } from '@mobvex/ui';

export default function RootLayout() {
  // Token font families ('BebasNeue', 'DMSans') must match these keys.
  const [fontsLoaded] = useFonts({
    BebasNeue: BebasNeue_400Regular,
    DMSans: DMSans_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </>
  );
}
