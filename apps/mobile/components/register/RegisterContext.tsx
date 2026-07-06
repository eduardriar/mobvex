import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getInvitationByToken } from '@mobvex/db';
import type { InvitationWithTrainer } from '@mobvex/db';
import type { Channel, Goal } from './constants';

/**
 * Holds the data collected across the multi-step registration flow so each
 * screen can read and update a shared draft, plus the resolved trainer
 * invitation. Kept in memory only — nothing is persisted until the flow is
 * wired to Supabase (see the profile/success steps).
 */
type RegisterData = {
  contact: string;
  channel: Channel;
  name: string;
  weight: string;
  height: string;
  birthdate: string;
  goal: Goal;
};

/** Lifecycle of resolving an invite token to a trainer. */
type InviteState = 'idle' | 'loading' | 'valid' | 'invalid';

type RegisterContextValue = RegisterData & {
  update: (patch: Partial<RegisterData>) => void;
  /** Begin resolving an invite token captured from the deep link. */
  resolveInvite: (token: string) => void;
  inviteState: InviteState;
  /** Summary of the inviting trainer, or null until a valid invite resolves. */
  trainer: InvitationWithTrainer['trainer'] | null;
  /** The inviting trainer's id — used to link the new student on signup. */
  trainerId: string | null;
  /** The invitation id — used to mark the invite accepted on signup. */
  invitationId: string | null;
};

const initialData: RegisterData = {
  contact: '',
  channel: 'email',
  name: '',
  weight: '',
  height: '',
  birthdate: '',
  goal: 'fat_loss',
};

/** An invite is usable only while pending and not past its expiry. */
function isInviteUsable(invite: InvitationWithTrainer): boolean {
  if (invite.status !== 'pending') return false;
  if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
    return false;
  }
  return true;
}

const RegisterContext = createContext<RegisterContextValue | null>(null);

export function RegisterProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RegisterData>(initialData);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationWithTrainer | null>(null);
  const [inviteState, setInviteState] = useState<InviteState>('idle');

  const resolveInvite = useCallback((token: string) => {
    setInviteToken(token);
  }, []);

  // Resolve the invite token to a trainer whenever it changes.
  useEffect(() => {
    if (!inviteToken) return;
    let active = true;
    setInviteState('loading');

    getInvitationByToken(inviteToken).then(({ data: invite, error }) => {
      if (!active) return;
      if (error || !invite || !isInviteUsable(invite)) {
        setInvitation(null);
        setInviteState('invalid');
        return;
      }
      setInvitation(invite);
      setInviteState('valid');
    });

    return () => {
      active = false;
    };
  }, [inviteToken]);

  console.log('>>>>>', invitation)

  const value = useMemo<RegisterContextValue>(
    () => ({
      ...data,
      update: (patch) => setData((prev) => ({ ...prev, ...patch })),
      resolveInvite,
      inviteState,
      trainer: invitation?.trainer ?? null,
      trainerId: invitation?.trainer_id ?? null,
      invitationId: invitation?.id ?? null,
    }),
    [data, resolveInvite, inviteState, invitation],
  );

  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>;
}

export function useRegister(): RegisterContextValue {
  const ctx = useContext(RegisterContext);
  if (!ctx) {
    throw new Error('useRegister must be used within a RegisterProvider');
  }
  return ctx;
}
