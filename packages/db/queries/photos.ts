import { supabase } from '../client';
import type { PhotoPose, ProgressPhoto } from '../types';

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
 * Upload a pose photo to Storage and upsert its metadata row. Re-uploading the
 * same student/date/pose overwrites both the file and the row.
 */
export async function uploadProgressPhoto({
  studentId,
  date,
  pose,
  data,
  contentType,
}: UploadParams) {
  const path = photoPath(studentId, date, pose);

  const upload = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, data, { contentType, upsert: true });
  if (upload.error) {
    return { data: null, error: upload.error };
  }

  return supabase
    .from('progress_photos')
    .upsert(
      { student_id: studentId, date, pose, storage_path: path },
      { onConflict: 'student_id,date,pose' },
    )
    .select()
    .single<ProgressPhoto>();
}

/** All photo rows for a student on a given day. */
export async function getProgressPhotosByDate(studentId: string, date: string) {
  return supabase
    .from('progress_photos')
    .select('*')
    .eq('student_id', studentId)
    .eq('date', date)
    .returns<ProgressPhoto[]>();
}

/** A student's photos, newest first (for the photo-history rail). */
export async function getProgressPhotos(studentId: string) {
  return supabase
    .from('progress_photos')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
    .returns<ProgressPhoto[]>();
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
