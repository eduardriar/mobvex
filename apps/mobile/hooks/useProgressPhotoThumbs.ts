import { useCallback, useEffect, useState } from 'react';
import { getProgressPhotos, signedPhotoUrls, type ProgressPhoto } from '@mobvex/db';

type UseProgressPhotoThumbs = {
  /** Date (YYYY-MM-DD) → signed URL of that day's representative photo. */
  thumbs: Map<string, string>;
  reload: () => void;
};

/**
 * Builds one signed thumbnail URL per day that has photos, preferring the
 * `front` pose — used to overlay real photos onto the progress rail.
 */
export function useProgressPhotoThumbs(
  studentId: string | null,
): UseProgressPhotoThumbs {
  const [thumbs, setThumbs] = useState<Map<string, string>>(new Map());

  const load = useCallback(async () => {
    if (!studentId) {
      setThumbs(new Map());
      return;
    }
    const { data, error } = await getProgressPhotos(studentId);
    if (error || !data) return;

    // One representative photo per date — prefer the front pose.
    const repByDate = new Map<string, ProgressPhoto>();
    for (const photo of data) {
      const current = repByDate.get(photo.date);
      if (!current || (photo.pose === 'front' && current.pose !== 'front')) {
        repByDate.set(photo.date, photo);
      }
    }

    const reps = [...repByDate.values()];
    const urls = await signedPhotoUrls(reps.map((r) => r.storage_path));
    const next = new Map<string, string>();
    for (const rep of reps) {
      const url = urls.get(rep.storage_path);
      if (url) next.set(rep.date, url);
    }
    setThumbs(next);
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  return { thumbs, reload: load };
}
