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
-- SCOPE: this covers `users`, `students`, `exercises`, `routines` and
-- `routine_exercises`. The other tables (progress, nutrition, workout_sessions,
-- set_logs, progress_photos, invitations) and the progress-photos storage
-- bucket still run dev-stage policies and need their own auth-scoped pass
-- before launch.
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
-- exercises
-- ---------------------------------------------------------------------------
alter table exercises enable row level security;

drop policy if exists "exercises_catalog_select" on exercises;
drop policy if exists "exercises_own_select" on exercises;
drop policy if exists "exercises_student_select" on exercises;
drop policy if exists "exercises_trainer_insert" on exercises;
drop policy if exists "exercises_trainer_update" on exercises;
drop policy if exists "exercises_trainer_delete" on exercises;

-- Anyone authenticated reads the shared global catalog (trainer_id is null).
create policy "exercises_catalog_select" on exercises
  for select to authenticated
  using (trainer_id is null);

-- A trainer reads their own private exercises.
create policy "exercises_own_select" on exercises
  for select to authenticated
  using (trainer_id = auth.uid());

-- A student reads their own trainer's private exercises (their assigned
-- routines may reference them).
create policy "exercises_student_select" on exercises
  for select to authenticated
  using (trainer_id in (select trainer_id from students where user_id = auth.uid()));

-- A trainer creates only their own exercises (never a shared catalog row).
create policy "exercises_trainer_insert" on exercises
  for insert to authenticated
  with check (trainer_id = auth.uid());

-- A trainer updates only their own exercises.
create policy "exercises_trainer_update" on exercises
  for update to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

-- A trainer deletes only their own exercises.
create policy "exercises_trainer_delete" on exercises
  for delete to authenticated
  using (trainer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- routines
-- ---------------------------------------------------------------------------
alter table routines enable row level security;

drop policy if exists "routines_select" on routines;
drop policy if exists "routines_trainer_insert" on routines;
drop policy if exists "routines_trainer_update" on routines;
drop policy if exists "routines_trainer_delete" on routines;

-- A trainer reads their own routines; a student reads their own assigned routines.
create policy "routines_select" on routines
  for select to authenticated
  using (
    trainer_id = auth.uid()
    or student_id in (select id from students where user_id = auth.uid())
  );

-- A trainer creates routines only for their own students.
create policy "routines_trainer_insert" on routines
  for insert to authenticated
  with check (
    trainer_id = auth.uid()
    and student_id in (select id from students where trainer_id = auth.uid())
  );

-- A trainer updates only their own routines.
create policy "routines_trainer_update" on routines
  for update to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

-- A trainer deletes only their own routines.
create policy "routines_trainer_delete" on routines
  for delete to authenticated
  using (trainer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- routine_exercises — no trainer_id/student_id column; ownership flows
-- through the parent routine.
-- ---------------------------------------------------------------------------
alter table routine_exercises enable row level security;

drop policy if exists "routine_exercises_select" on routine_exercises;
drop policy if exists "routine_exercises_trainer_write" on routine_exercises;

-- Readable by whoever can read the parent routine (owning trainer or assigned student).
create policy "routine_exercises_select" on routine_exercises
  for select to authenticated
  using (
    routine_id in (
      select id from routines
      where trainer_id = auth.uid()
         or student_id in (select id from students where user_id = auth.uid())
    )
  );

-- Only the owning trainer writes (insert/update/delete) prescriptions.
create policy "routine_exercises_trainer_write" on routine_exercises
  for all to authenticated
  using (routine_id in (select id from routines where trainer_id = auth.uid()))
  with check (routine_id in (select id from routines where trainer_id = auth.uid()));

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
