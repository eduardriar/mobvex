import { supabase } from '../client';

/** Public bucket for trainer-uploaded exercise images. */
export const EXERCISE_MEDIA_BUCKET = 'exercise-media';
/** Public bucket for trainer-uploaded recipe images. */
export const RECIPE_MEDIA_BUCKET = 'recipe-media';

type UploadImageParams = {
  /** Storage object path, e.g. `${trainerId}/${uuid}.jpg` — caller picks it. */
  path: string;
  data: ArrayBuffer | Uint8Array;
  contentType: string;
};

async function uploadCatalogImage(bucket: string, { path, data, contentType }: UploadImageParams) {
  const upload = await supabase.storage.from(bucket).upload(path, data, { contentType });
  if (upload.error) return { data: null, error: upload.error };

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return { data: { publicUrl: publicUrlData.publicUrl }, error: null };
}

/** Uploads a trainer-picked exercise image to Storage, returning its public URL. */
export function uploadExerciseImage(params: UploadImageParams) {
  return uploadCatalogImage(EXERCISE_MEDIA_BUCKET, params);
}

/** Uploads a trainer-picked recipe image to Storage, returning its public URL. */
export function uploadRecipeImage(params: UploadImageParams) {
  return uploadCatalogImage(RECIPE_MEDIA_BUCKET, params);
}
