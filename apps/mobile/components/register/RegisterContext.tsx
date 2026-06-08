import { createContext, useContext, useMemo, useState } from 'react';
import type { Channel, Goal } from './constants';

/**
 * Holds the data collected across the multi-step registration flow so each
 * screen can read and update a shared draft. Kept in memory only — nothing is
 * persisted until the flow is wired to Supabase.
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

type RegisterContextValue = RegisterData & {
  update: (patch: Partial<RegisterData>) => void;
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

const RegisterContext = createContext<RegisterContextValue | null>(null);

export function RegisterProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RegisterData>(initialData);

  const value = useMemo<RegisterContextValue>(
    () => ({
      ...data,
      update: (patch) => setData((prev) => ({ ...prev, ...patch })),
    }),
    [data],
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
