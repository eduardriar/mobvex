-- Mobvex — Row Level Security for `users` and `students`.
--
-- Prisma does not manage RLS, so this is a standalone SQL script. Run it against
-- the Postgres direct connection (idempotent — safe to re-run):
--   prisma db execute --url "$DIRECT_URL" --file sql/rls.sql
--
-- Replaces the dev-stage "RLS off / anon full access" posture with policies
-- scoped to the authenticated user (auth.uid()):
--   * a student reads/writes only their own users + students rows;
--   * a trainer reads their own roster (their students and those students' users);
--   * a student reads their assigned trainer's profile (for the dashboard header).
--
-- SCOPE: this covers `users` and `students` only. The other tables (progress,
-- routines, nutrition, exercises, workout_sessions, set_logs, progress_photos,
-- invitations) and the progress-photos storage bucket still run dev-stage
-- policies and need their own auth-scoped pass before launch.
--
-- INVITE RESOLUTION: the registration flow resolves an invite token BEFORE the
-- student authenticates, and shows the inviting trainer's name. With `users` RLS
-- on, anon cannot read that trainer row — and exposing trainer rows to anon would
-- leak emails. The `invitation_by_token` function below (SECURITY DEFINER) returns
-- only safe trainer fields for a valid token. When this file is applied, switch
-- the app's `getInvitationByToken` to call it:
--   supabase.rpc('invitation_by_token', { p_token })

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
alter table users enable row level security;

drop policy if exists "users_self_select" on users;
drop policy if exists "users_trainer_select" on users;
drop policy if exists "users_roster_select" on users;
drop policy if exists "users_self_insert" on users;
drop policy if exists "users_self_update" on users;

-- A user can read their own profile.
create policy "users_self_select" on users
  for select to authenticated
  using (id = auth.uid());

-- A student can read their assigned trainer's profile (dashboard header).
create policy "users_trainer_select" on users
  for select to authenticated
  using (id in (select trainer_id from students where user_id = auth.uid()));

-- A trainer can read the profiles of their own students.
create policy "users_roster_select" on users
  for select to authenticated
  using (id in (select user_id from students where trainer_id = auth.uid()));

-- A user creates only their own profile row (id must equal their auth uid).
create policy "users_self_insert" on users
  for insert to authenticated
  with check (id = auth.uid());

-- A user updates only their own profile.
create policy "users_self_update" on users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- students
-- ---------------------------------------------------------------------------
alter table students enable row level security;

drop policy if exists "students_select" on students;
drop policy if exists "students_self_insert" on students;
drop policy if exists "students_manage_update" on students;

-- A student reads their own record; a trainer reads their roster.
create policy "students_select" on students
  for select to authenticated
  using (user_id = auth.uid() or trainer_id = auth.uid());

-- A student creates their own record during onboarding (links to a trainer).
create policy "students_self_insert" on students
  for insert to authenticated
  with check (user_id = auth.uid());

-- A student updates their own record; a trainer manages their roster.
create policy "students_manage_update" on students
  for update to authenticated
  using (user_id = auth.uid() or trainer_id = auth.uid())
  with check (user_id = auth.uid() or trainer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- invitation_by_token — pre-auth invite resolution without exposing `users`.
-- ---------------------------------------------------------------------------
create or replace function public.invitation_by_token(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(i) || jsonb_build_object(
    'trainer', jsonb_build_object('id', u.id, 'name', u.name, 'avatar_url', u.avatar_url)
  )
  from invitations i
  join users u on u.id = i.trainer_id
  where i.token = p_token;
$$;

-- Only callable as the RPC (anon during onboarding, authenticated otherwise);
-- it returns just id/name/avatar for the trainer — never the email.
revoke all on function public.invitation_by_token(text) from public;
grant execute on function public.invitation_by_token(text) to anon, authenticated;
