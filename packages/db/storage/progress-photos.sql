-- Mobvex — Storage setup for progress photos.
--
-- Prisma does not manage Supabase Storage (the `storage` schema), so this is a
-- standalone SQL script. Run it against the Postgres direct connection:
--   prisma db execute --url "$DIRECT_URL" --file storage/progress-photos.sql
--
-- Creates a PRIVATE bucket and dev-stage access policies.
--
-- ⚠️ DEV-STAGE POLICIES: these grant the `anon` role full access to objects in
-- this bucket because auth is not wired yet (the app uses a fixed student id and
-- RLS is off project-wide). Before launch, REPLACE the `anon` policies with
-- ones scoped to the authenticated owner, e.g.:
--     to authenticated using (owner = auth.uid())
-- and restrict the path prefix to the student's own folder.

-- Private bucket (not publicly readable; the app reads via signed URLs).
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Idempotent: drop then recreate the dev policies.
drop policy if exists "progress_photos_dev_read" on storage.objects;
drop policy if exists "progress_photos_dev_write" on storage.objects;
drop policy if exists "progress_photos_dev_update" on storage.objects;
drop policy if exists "progress_photos_dev_delete" on storage.objects;

create policy "progress_photos_dev_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'progress-photos');

create policy "progress_photos_dev_write" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'progress-photos');

create policy "progress_photos_dev_update" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'progress-photos')
  with check (bucket_id = 'progress-photos');

create policy "progress_photos_dev_delete" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'progress-photos');
