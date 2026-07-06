import { useCallback, useState } from 'react';
import { signedPhotoUrls, uploadProgressPhoto, type PhotoPose } from '@mobvex/db';

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
  /** Clear all captured poses back to empty. */
  reset: () => void;
};

/**
 * Tracks photos captured in the current session and uploads them. It does NOT
 * load existing photos from the DB — the capture screen starts empty. To display
 * a day's already-saved photos, use `useDayPhotos` / `loadDayPhotoUrls`.
 */
export function usePhotoSession(
  studentId: string | null,
  date: string,
): UsePhotoSession {
  const [poses, setPoses] = useState<Poses>(initialPoses);
  const [error, setError] = useState<string | null>(null);

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

  const reset = useCallback(() => {
    setPoses(initialPoses());
    setError(null);
  }, []);

  return { poses, error, upload, reset };
}
