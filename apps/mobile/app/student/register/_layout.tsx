import { Stack } from 'expo-router';
import { RegisterProvider } from '@/components/register/RegisterContext';

/** Wraps the registration steps in the shared draft state + a slide stack. */
export default function RegisterLayout() {
  return (
    <RegisterProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </RegisterProvider>
  );
}
