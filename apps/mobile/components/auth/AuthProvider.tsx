import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getStudentByUserId, getUserById, supabase } from '@mobvex/db';
import type { Role, Session, Student, User } from '@mobvex/db';

/**
 * App-wide authentication state, sourced from Supabase Auth. Subscribes to
 * `onAuthStateChange` so the session stays in sync (login, logout, token
 * refresh) and resolves the user's profile row — which carries their `role` —
 * and, for students, their student record (whose id the data hooks need).
 */
type AuthContextValue = {
  /** The Supabase auth session, or null when signed out. */
  session: Session | null;
  /** The authenticated Supabase auth user, or null when signed out. */
  user: Session['user'] | null;
  /** The matching `users` row (name, role, …), or null until loaded/signed out. */
  profile: User | null;
  /** Convenience accessor for the user's role, or null when unknown. */
  role: Role | null;
  /** The signed-in user's student record, or null (trainers / not onboarded). */
  student: Student | null;
  /** Convenience accessor for the student id the data hooks key on. */
  studentId: string | null;
  /** True until the initial session, profile and (for students) student row resolve. */
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(true);

  // Track the auth session. The callback stays synchronous on purpose — running
  // other Supabase calls inside it can deadlock the auth lock, so the profile
  // fetch lives in the effect below instead.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load the profile row whenever the authenticated user changes.
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let active = true;
    setProfileLoading(true);
    getUserById(userId).then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.warn('AuthProvider: failed to load user profile', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
      setProfileLoading(false);
    });

    return () => {
      active = false;
    };
  }, [userId]);

  // Load the student record once the role is known. Keeps `studentLoading` true
  // while the role is still resolving so guards don't act on a half-loaded state.
  const role = profile?.role ?? null;
  useEffect(() => {
    if (!userId) {
      setStudent(null);
      setStudentLoading(false);
      return;
    }
    if (role === null) {
      // Profile (and therefore role) not resolved yet — keep waiting.
      setStudentLoading(true);
      return;
    }
    if (role !== 'student') {
      setStudent(null);
      setStudentLoading(false);
      return;
    }

    let active = true;
    setStudentLoading(true);
    getStudentByUserId(userId).then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.warn('AuthProvider: failed to load student record', error.message);
        setStudent(null);
      } else {
        setStudent(data);
      }
      setStudentLoading(false);
    });

    return () => {
      active = false;
    };
  }, [userId, role]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      student,
      studentId: student?.id ?? null,
      loading: !authReady || profileLoading || studentLoading,
    }),
    [session, profile, role, student, authReady, profileLoading, studentLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
