-- Mobvex — Storage setup for recipe catalog images.
--
-- Prisma does not manage Supabase Storage (the `storage` schema), so this is a
-- standalone SQL script. Run it against the Postgres direct connection:
--   prisma db execute --url "$DIRECT_URL" --file storage/recipe-media.sql
--
-- Creates a PUBLIC bucket. Unlike progress-photos, recipe images are catalog
-- content (not private student data), so a public bucket + public URLs is
-- simpler than signed URLs — no expiry to manage, works as a plain
-- <img src>/Image uri on both the trainer web app and the mobile app.
--
-- ⚠️ DEV-STAGE POLICIES: these grant the `anon` role write access to objects
-- in this bucket because auth is not wired yet (RLS is off project-wide).
-- Before launch, replace the `anon` policies with ones scoped to the
-- authenticated trainer, e.g. restricting the path prefix to their own id:
--     to authenticated using (owner = auth.uid())

insert into storage.buckets (id, name, public)
values ('recipe-media', 'recipe-media', true)
on conflict (id) do nothing;

drop policy if exists "recipe_media_dev_write" on storage.objects;
drop policy if exists "recipe_media_dev_update" on storage.objects;
drop policy if exists "recipe_media_dev_delete" on storage.objects;

create policy "recipe_media_dev_write" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'recipe-media');

create policy "recipe_media_dev_update" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'recipe-media')
  with check (bucket_id = 'recipe-media');

create policy "recipe_media_dev_delete" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'recipe-media');
