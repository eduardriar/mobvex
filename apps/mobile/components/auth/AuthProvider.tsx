import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getUserById, supabase } from '@mobvex/db';
import type { Role, Session, User } from '@mobvex/db';

/**
 * App-wide authentication state, sourced from Supabase Auth. Subscribes to
 * `onAuthStateChange` so the session stays in sync (login, logout, token
 * refresh) and resolves the user's profile row — which carries their `role` —
 * whenever the authenticated user changes.
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
  /** True until the initial session and (if any) profile have resolved. */
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

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

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      loading: !authReady || profileLoading,
    }),
    [session, profile, authReady, profileLoading],
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
