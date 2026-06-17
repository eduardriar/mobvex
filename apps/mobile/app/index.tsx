import { Redirect } from 'expo-router';
import { useActiveSession } from '@/hooks/useActiveSession';

// TODO: replace with the authenticated student's id once auth is wired.
const TEMP_STUDENT_ID = '00000000-0000-0000-0000-000000000003';

// Entry point. If the student has a workout in progress, the active routine is
// the main screen — route straight into it. Otherwise land on the dashboard.
// The onboarding flow lives at /student/register.
export default function Index() {
  const { session, loading } = useActiveSession(TEMP_STUDENT_ID);

  if (loading) return null;

  if (session) {
    return <Redirect href={`/student/workout/${session.id}`} />;
  }

  return <Redirect href="/student" />;
}
