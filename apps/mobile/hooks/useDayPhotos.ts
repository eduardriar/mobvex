import { useCallback, useEffect, useState } from 'react';
import {
  getProgressPhotosByDate,
  signedPhotoUrls,
  type PhotoPose,
} from '@mobvex/db';

export type DayPhotoUrls = Record<PhotoPose, string | null>;

const emptyUrls = (): DayPhotoUrls => ({
  front: null,
  left: null,
  right: null,
  back: null,
});

/**
 * Load a day's saved photos and return a signed URL per pose (null where a pose
 * has none). Pure data fetch — call it from any surface that *displays* photos.
 */
export async function loadDayPhotoUrls(
  studentId: string,
  date: string,
): Promise<{ urls: DayPhotoUrls; error: string | null }> {
  const { data, error } = await getProgressPhotosByDate(studentId, date);
  if (error) {
    return { urls: emptyUrls(), error: error.message };
  }
  const photos = data ?? [];
  const signed = await signedPhotoUrls(photos.map((p) => p.storage_path));
  const urls = emptyUrls();
  for (const photo of photos) {
    urls[photo.pose] = signed.get(photo.storage_path) ?? null;
  }
  return { urls, error: null };
}

type UseDayPhotos = {
  urls: DayPhotoUrls;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/** Loads (and can re-load) a day's photos as per-pose signed URLs for display. */
export function useDayPhotos(studentId: string, date: string): UseDayPhotos {
  const [urls, setUrls] = useState<DayPhotoUrls>(emptyUrls);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setUrls(emptyUrls());

    loadDayPhotoUrls(studentId, date).then((result) => {
      if (!active) return;
      setUrls(result.urls);
      setError(result.error);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [studentId, date]);

  const reload = useCallback(() => {
    loadDayPhotoUrls(studentId, date).then((result) => {
      setUrls(result.urls);
      setError(result.error);
    });
  }, [studentId, date]);

  return { urls, loading, error, reload };
}
