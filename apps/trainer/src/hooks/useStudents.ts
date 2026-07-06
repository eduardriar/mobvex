/* Mobvex Trainer — loads the signed-in trainer's students from the DB. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { getSession, getStudentsWithUser } from "@mobvex/db";
import { hydrateStudents, studentFromDb } from "@/lib/data";
import type { Student } from "@/lib/types";

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await getSession();
      if (sessionError || !session) {
        setError("Tu sesión ha expirado. Vuelve a iniciar sesión.");
        return;
      }

      const { data, error: fetchError } = await getStudentsWithUser(
        session.user.id,
      );
      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      const list = (data ?? []).map(studentFromDb);
      // Keep the shared in-memory roster in sync so studentById lookups
      // (ficha, topbar subtitle) resolve the same students.
      hydrateStudents(list);
      setStudents(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { students, loading, error, refetch: load };
}
