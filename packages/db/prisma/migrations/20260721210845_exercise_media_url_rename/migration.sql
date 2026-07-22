-- Generalize exercise media beyond video: `video_url` never held real data
-- (the trainer form's media control was a non-persisted placeholder), so
-- renaming it is safe. Trainers can now attach a YouTube link or a direct
-- image link; the kind is derived from the URL shape at render time, not
-- stored. Thumbnail/title are only ever populated for YouTube links (fetched
-- once via YouTube's oEmbed endpoint when the trainer saves the exercise).
ALTER TABLE "exercises" RENAME COLUMN "video_url" TO "media_url";
ALTER TABLE "exercises" ADD COLUMN "media_thumbnail_url" TEXT;
ALTER TABLE "exercises" ADD COLUMN "media_title" TEXT;
