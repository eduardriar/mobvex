/* Mobvex Trainer — the signed-in trainer's profile (sidebar footer). */
"use client";

import { useEffect, useState } from "react";
import { getSession, getUserById } from "@mobvex/db";

export type TrainerProfile = {
  name: string;
  email: string;
};

export function useTrainerProfile() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await getSession();
      if (sessionError || !session) return;

      const { data, error } = await getUserById(session.user.id);
      if (error || !data || cancelled) return;
      setProfile({ name: data.name, email: data.email });
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return profile;
}
