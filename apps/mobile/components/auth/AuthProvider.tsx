import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  /** Re-fetch the profile + student record (e.g. right after onboarding creates them). */
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

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

  // Resolve the profile row and (for students) the student record for the
  // authenticated user. A signed-in user with no profile yet — e.g.
  // mid-registration, right after OTP verification — is a valid, fully-resolved
  // state (profile/student null), not perpetual loading. The `loadSeq` ref makes
  // the latest load win when several overlap (user change + manual refresh).
  const userId = session?.user?.id ?? null;
  const loadSeq = useRef(0);

  const loadUserData = useCallback(async () => {
    const seq = (loadSeq.current += 1);
    const isStale = () => seq !== loadSeq.current;

    if (!userId) {
      if (!isStale()) {
        setProfile(null);
        setStudent(null);
        setDataLoading(false);
      }
      return;
    }

    setDataLoading(true);
    const { data: profileRow, error: profileError } = await getUserById(userId);
    if (isStale()) return;
    if (profileError) {
      // PGRST116 ("no rows") simply means the user hasn't been onboarded yet.
      if (profileError.code !== 'PGRST116') {
        console.warn('AuthProvider: failed to load user profile', profileError.message);
      }
      setProfile(null);
      setStudent(null);
      setDataLoading(false);
      return;
    }

    setProfile(profileRow);
    if (profileRow?.role !== 'student') {
      setStudent(null);
      setDataLoading(false);
      return;
    }

    const { data: studentRow, error: studentError } = await getStudentByUserId(userId);
    if (isStale()) return;
    if (studentError) {
      console.warn('AuthProvider: failed to load student record', studentError.message);
      setStudent(null);
    } else {
      setStudent(studentRow);
    }
    setDataLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!authReady) return;
    void loadUserData();
  }, [authReady, loadUserData]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      student,
      studentId: student?.id ?? null,
      loading: !authReady || dataLoading,
      refresh: loadUserData,
    }),
    [session, profile, student, authReady, dataLoading, loadUserData],
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
