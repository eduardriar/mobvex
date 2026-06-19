import { useCallback, useEffect, useState } from 'react';
import {
  getProgressPhotosByDate,
  signedPhotoUrls,
  uploadProgressPhoto,
  type PhotoPose,
} from '@mobvex/db';

type PoseState = { url: string | null; uploading: boolean };
type Poses = Record<PhotoPose, PoseState>;

const initialPoses = (): Poses => ({
  front: { url: null, uploading: false },
  left: { url: null, uploading: false },
  right: { url: null, uploading: false },
  back: { url: null, uploading: false },
});

type UsePhotoSession = {
  /** Per-pose signed URL + upload status. */
  poses: Poses;
  error: string | null;
  /** Upload (or replace) the photo for a pose. */
  upload: (
    pose: PhotoPose,
    data: Uint8Array,
    contentType: string,
  ) => Promise<void>;
};

/** Loads a day's existing photos (as signed URLs) and uploads new ones. */
export function usePhotoSession(
  studentId: string | null,
  date: string,
): UsePhotoSession {
  const [poses, setPoses] = useState<Poses>(initialPoses);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPoses(initialPoses());
    if (!studentId) return;
    let active = true;

    (async () => {
      const { data, error: queryError } = await getProgressPhotosByDate(
        studentId,
        date,
      );
      if (!active) return;
      if (queryError) {
        setError(queryError.message);
        return;
      }
      const urls = await signedPhotoUrls((data ?? []).map((p) => p.storage_path));
      if (!active) return;
      setPoses((prev) => {
        const next = { ...prev };
        for (const photo of data ?? []) {
          next[photo.pose] = {
            url: urls.get(photo.storage_path) ?? null,
            uploading: false,
          };
        }
        return next;
      });
    })();

    return () => {
      active = false;
    };
  }, [studentId, date]);

  const upload = useCallback(
    async (pose: PhotoPose, data: Uint8Array, contentType: string) => {
      if (!studentId) return;
      setError(null);
      setPoses((prev) => ({
        ...prev,
        [pose]: { ...prev[pose], uploading: true },
      }));

      const { data: row, error: uploadError } = await uploadProgressPhoto({
        studentId,
        date,
        pose,
        data,
        contentType,
      });
      if (uploadError || !row) {
        setError(uploadError?.message ?? 'No se pudo subir la foto.');
        setPoses((prev) => ({
          ...prev,
          [pose]: { ...prev[pose], uploading: false },
        }));
        return;
      }

      const urls = await signedPhotoUrls([row.storage_path]);
      setPoses((prev) => ({
        ...prev,
        [pose]: { url: urls.get(row.storage_path) ?? null, uploading: false },
      }));
    },
    [studentId, date],
  );

  return { poses, error, upload };
}
