import { useEffect, useState } from 'react';
import { getUserById, type User } from '@mobvex/db';

type UseTrainer = {
  /** The trainer's user profile, or null while loading / when unassigned. */
  trainer: User | null;
  /** True during the initial load only. */
  loading: boolean;
  error: string | null;
};

/** Fetches the profile of the trainer assigned to a student. */
export function useTrainer(trainerId: string | null): UseTrainer {
  const [trainer, setTrainer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trainerId) {
      setTrainer(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);

    getUserById(trainerId).then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) {
        setError(queryError.message);
        setTrainer(null);
      } else {
        setTrainer(data);
        setError(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [trainerId]);

  return { trainer, loading, error };
}
