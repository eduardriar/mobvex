import { Redirect } from 'expo-router';
import { useActiveSession } from '@/hooks/useActiveSession';
import { useAuth } from '@/components/auth/AuthProvider';

// Entry point. Routes by auth state: signed-out users go to onboarding; a
// student with a workout in progress lands straight in it; otherwise the
// dashboard. The onboarding flow lives at /student/register.
export default function Index() {
  const { loading, session, role, studentId } = useAuth();
  const { session: workout, loading: workoutLoading } = useActiveSession(studentId);

  if (loading || workoutLoading) return null;

  if (!session) {
    return <Redirect href="/student/register" />;
  }

  // Only the student app exists today — anyone without a student profile goes
  // back to onboarding.
  if (role !== 'student' || !studentId) {
    return <Redirect href="/student/register" />;
  }

  if (workout) {
    return <Redirect href={`/student/workout/${workout.id}`} />;
  }

  return <Redirect href="/student" />;
}
