import { Redirect } from 'expo-router';

// Entry point. Until auth/role routing exists, land on the student dashboard.
// The onboarding flow lives at /student/register.
export default function Index() {
  return <Redirect href="/student" />;
}
