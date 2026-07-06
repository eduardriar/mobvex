import { useCallback, useEffect, useState } from 'react';
import {
  getProgressByStudent,
  signedPhotoUrls,
  type ProgressWithSignedPhotos,
} from '@mobvex/db';

type UseProgress = {
  /** Progress entries (with their photos as signed URLs), newest first. */
  entries: ProgressWithSignedPhotos[];
  /** True during the initial load only. */
  loading: boolean;
  /** True during a user-triggered pull-to-refresh. */
  refreshing: boolean;
  error: string | null;
  /** Re-fetch the entries (e.g. from a pull-to-refresh gesture). */
  refresh: () => void;
  /** Silent re-fetch (no loading/refreshing flags) — e.g. on screen focus. */
  reload: () => void;
};

/**
 * Fetch a student's progress history and resolve each entry's photos into signed
 * display URLs in one batch.
 */
async function loadProgress(
  studentId: string | null,
): Promise<{ entries: ProgressWithSignedPhotos[]; error: string | null }> {
  const { data, error } = await getProgressByStudent(studentId);

  if (error) {
    return { entries: [], error: error.message };
  }

  const rows = data ?? [];
  const urls = await signedPhotoUrls(
    rows.flatMap((row) => row.photos.map((photo) => photo.storage_path)),
  );
  const entries = rows.map((row) => ({
    ...row,
    photos: row.photos.map((photo) => ({
      ...photo,
      url: urls.get(photo.storage_path) ?? null,
    })),
  }));
  return { entries, error: null };
}

/** A student's progress history (weight, body fat, measurements, photos). */
export function useProgress(studentId: string | null): UseProgress {
  const [entries, setEntries] = useState<ProgressWithSignedPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(
    (result: Awaited<ReturnType<typeof loadProgress>>) => {
      if (result.error) {
        setError(result.error);
      } else {
        setEntries(result.entries);
        setError(null);
      }
    },
    [],
  );

  useEffect(() => {
    if (!studentId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);

    loadProgress(studentId).then((result) => {
      if (!active) return;
      apply(result);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [studentId, apply]);

  const refresh = useCallback(() => {
    if (!studentId) return;
    setRefreshing(true);
    loadProgress(studentId).then((result) => {
      apply(result);
      setRefreshing(false);
    });
  }, [studentId, apply]);

  const reload = useCallback(() => {
    loadProgress(studentId).then(apply);
  }, [studentId, apply]);

  return { entries, loading, refreshing, error, refresh, reload };
}
