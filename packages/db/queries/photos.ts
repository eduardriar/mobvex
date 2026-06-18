import { supabase } from '../client';
import type { PhotoPose, ProgressPhoto, ProgressPhotoWithDate } from '../types';

/** Private Storage bucket holding progress photos. */
export const PHOTO_BUCKET = 'progress-photos';

/** Stable object path for a pose on a given day (no extension — see below). */
function photoPath(studentId: string, date: string, pose: PhotoPose): string {
  // Extension-less so re-uploading a pose overwrites the same object (the
  // content type is stored in the object's metadata).
  return `${studentId}/${date}/${pose}`;
}

type UploadParams = {
  studentId: string;
  date: string;
  pose: PhotoPose;
  data: ArrayBuffer | Uint8Array;
  contentType: string;
};

/**
 * Upload a pose photo and attach it to the day's Progress entry. Ensures a
 * Progress row exists for the student/day first (one per day), then upserts the
 * photo so re-uploading the same pose overwrites both the file and the row.
 */
export async function uploadProgressPhoto({
  studentId,
  date,
  pose,
  data,
  contentType,
}: UploadParams) {
  // 1. Ensure the day's progress entry exists and get its id.
  const { data: progress, error: progressError } = await supabase
    .from('progress')
    .upsert({ student_id: studentId, date }, { onConflict: 'student_id,date' })
    .select('id')
    .single<{ id: string }>();
  if (progressError || !progress) {
    return { data: null, error: progressError };
  }

  // 2. Upload the file.
  const path = photoPath(studentId, date, pose);
  const upload = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, data, { contentType, upsert: true });
  if (upload.error) {
    return { data: null, error: upload.error };
  }

  // 3. Upsert the metadata row — one per pose per progress entry.
  return supabase
    .from('progress_photos')
    .upsert(
      { progress_id: progress.id, pose, storage_path: path },
      { onConflict: 'progress_id,pose' },
    )
    .select()
    .single<ProgressPhoto>();
}

/** All photo rows attached to a student's progress entry for a given day. */
export async function getProgressPhotosByDate(studentId: string, date: string) {
  const { data: progress, error: progressError } = await supabase
    .from('progress')
    .select('id')
    .eq('student_id', studentId)
    .eq('date', date)
    .maybeSingle<{ id: string }>();
  if (progressError) {
    return { data: [] as ProgressPhoto[], error: progressError };
  }
  if (!progress) {
    return { data: [] as ProgressPhoto[], error: null };
  }

  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('progress_id', progress.id)
    .returns<ProgressPhoto[]>();
  return { data: data ?? [], error };
}

/**
 * A student's photos with their progress date, newest first (for the photo rail).
 * Joins through the parent progress entry to recover the date.
 */
export async function getProgressPhotos(studentId: string) {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('id, pose, storage_path, created_at, progress_id, progress!inner(date)')
    .eq('progress.student_id', studentId)
    .returns<(ProgressPhoto & { progress: { date: string } })[]>();
  if (error || !data) {
    return { data: [] as ProgressPhotoWithDate[], error };
  }

  const flat: ProgressPhotoWithDate[] = data
    .map(({ progress, ...photo }) => ({ ...photo, date: progress.date }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { data: flat, error: null };
}

/** Remove a pose photo (Storage object + metadata row). */
export async function deleteProgressPhoto(photo: ProgressPhoto) {
  const removal = await supabase.storage
    .from(PHOTO_BUCKET)
    .remove([photo.storage_path]);
  if (removal.error) {
    return { error: removal.error };
  }
  const { error } = await supabase
    .from('progress_photos')
    .delete()
    .eq('id', photo.id);
  return { error };
}

/**
 * Short-lived signed URLs for private photo objects, keyed by storage path.
 * Returns an empty map when given no paths.
 */
export async function signedPhotoUrls(
  paths: string[],
  expiresInSeconds = 3600,
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (paths.length === 0) return result;

  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(paths, expiresInSeconds);
  if (error || !data) return result;

  for (const item of data) {
    if (item.signedUrl && item.path) {
      result.set(item.path, item.signedUrl);
    }
  }
  return result;
}
