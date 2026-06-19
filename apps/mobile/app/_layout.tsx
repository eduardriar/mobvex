import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans';
import { colors } from '@mobvex/ui';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';

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
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  useProtectedRoute();

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

/**
 * Keeps navigation in sync with auth state: signed-out users are pushed to the
 * registration flow, and signed-in users are pushed out of it. The root index
 * screen routes itself (active workout vs. dashboard), so it is left untouched
 * here.
 */
function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const inRegister = segments[0] === 'student' && segments[1] === 'register';

    if (!session && !inRegister) {
      router.replace('/student/register');
    } else if (session && inRegister) {
      router.replace('/');
    }
  }, [loading, session, segments, router]);
}
