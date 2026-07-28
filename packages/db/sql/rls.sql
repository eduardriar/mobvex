-- Mobvex — Row Level Security for every application table.
--
-- Prisma does not manage RLS, so this is a standalone SQL script. Run it against
-- the Postgres direct connection (idempotent — safe to re-run):
--   prisma db execute --url "$DIRECT_URL" --file sql/rls.sql
--
-- Ownership model:
--   * a student reads/writes only their own rows (students, progress,
--     progress_photos, workout_sessions, set_logs), and reads what their
--     trainer assigned them (routines, nutrition, and the exercise/recipe
--     catalog reachable through those assignments);
--   * a trainer reads/writes their own roster's rows (students, routines,
--     nutrition and its meals/options, exercises, recipes, invitations);
--   * exercises/recipes are hybrid-owned: trainer_id null = shared global
--     catalog (readable by everyone, writable by no one via RLS — only the
--     seed script, which connects directly and bypasses RLS), a set
--     trainer_id = that trainer's private catalog item.
--
-- INVITE RESOLUTION: the registration flow resolves an invite token BEFORE the
-- student authenticates, and shows the inviting trainer's name. With `users`/
-- `invitations` RLS on, anon cannot read those rows directly — and exposing
-- them to anon would leak emails. `getInvitationByToken` (packages/db/queries/
-- invitations.ts) calls the `invitation_by_token` SECURITY DEFINER function
-- below instead, which returns only safe trainer fields for a valid token.

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
alter table users enable row level security;

drop policy if exists "users_self_select" on users;
drop policy if exists "users_trainer_select" on users;
drop policy if exists "users_roster_select" on users;
drop policy if exists "users_self_insert" on users;
drop policy if exists "users_trainer_insert_student" on users;
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

-- A trainer creates a placeholder profile (role student, random id) when
-- adding a new student before that student has an auth account of their own
-- (createStudentForTrainer). claim_student_invitation later re-points it to
-- the student's real auth uid.
create policy "users_trainer_insert_student" on users
  for insert to authenticated
  with check (
    role = 'student'
    and exists (select 1 from users u where u.id = auth.uid() and u.role = 'trainer')
  );

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
drop policy if exists "students_trainer_insert" on students;
drop policy if exists "students_manage_update" on students;

-- A student reads their own record; a trainer reads their roster.
create policy "students_select" on students
  for select to authenticated
  using (user_id = auth.uid() or trainer_id = auth.uid());

-- A student creates their own record during onboarding (links to a trainer).
create policy "students_self_insert" on students
  for insert to authenticated
  with check (user_id = auth.uid());

-- A trainer creates a student record for their roster (createStudentForTrainer).
create policy "students_trainer_insert" on students
  for insert to authenticated
  with check (trainer_id = auth.uid());

-- A student updates their own record; a trainer manages their roster.
create policy "students_manage_update" on students
  for update to authenticated
  using (user_id = auth.uid() or trainer_id = auth.uid())
  with check (user_id = auth.uid() or trainer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- invitations
-- ---------------------------------------------------------------------------
alter table invitations enable row level security;

drop policy if exists "invitations_trainer_select" on invitations;
drop policy if exists "invitations_trainer_insert" on invitations;

-- A trainer sees the invitations they sent.
create policy "invitations_trainer_select" on invitations
  for select to authenticated
  using (trainer_id = auth.uid());

-- A trainer creates invitations for their own roster.
create policy "invitations_trainer_insert" on invitations
  for insert to authenticated
  with check (trainer_id = auth.uid());

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

-- ---------------------------------------------------------------------------
-- routines
-- ---------------------------------------------------------------------------
alter table routines enable row level security;

drop policy if exists "routines_select" on routines;
drop policy if exists "routines_trainer_insert" on routines;
drop policy if exists "routines_trainer_update" on routines;

create policy "routines_select" on routines
  for select to authenticated
  using (
    trainer_id = auth.uid()
    or student_id in (select id from students where user_id = auth.uid())
  );

create policy "routines_trainer_insert" on routines
  for insert to authenticated
  with check (trainer_id = auth.uid());

create policy "routines_trainer_update" on routines
  for update to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- routine_exercises — read-only via routine ownership; no writer today.
-- ---------------------------------------------------------------------------
alter table routine_exercises enable row level security;

drop policy if exists "routine_exercises_select" on routine_exercises;

create policy "routine_exercises_select" on routine_exercises
  for select to authenticated
  using (
    routine_id in (
      select id from routines
      where trainer_id = auth.uid()
         or student_id in (select id from students where user_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- exercises — hybrid catalog (trainer_id null = shared, set = private).
-- ---------------------------------------------------------------------------
alter table exercises enable row level security;

drop policy if exists "exercises_select" on exercises;
drop policy if exists "exercises_trainer_insert" on exercises;
drop policy if exists "exercises_trainer_update" on exercises;
drop policy if exists "exercises_trainer_delete" on exercises;

create policy "exercises_select" on exercises
  for select to authenticated
  using (
    trainer_id is null
    or trainer_id = auth.uid()
    or trainer_id in (select trainer_id from students where user_id = auth.uid())
  );

create policy "exercises_trainer_insert" on exercises
  for insert to authenticated
  with check (trainer_id = auth.uid());

create policy "exercises_trainer_update" on exercises
  for update to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "exercises_trainer_delete" on exercises
  for delete to authenticated
  using (trainer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- workout_sessions — student-owned only (trainer app does not read these yet).
-- ---------------------------------------------------------------------------
alter table workout_sessions enable row level security;

drop policy if exists "workout_sessions_select" on workout_sessions;
drop policy if exists "workout_sessions_student_insert" on workout_sessions;
drop policy if exists "workout_sessions_student_update" on workout_sessions;

create policy "workout_sessions_select" on workout_sessions
  for select to authenticated
  using (student_id in (select id from students where user_id = auth.uid()));

create policy "workout_sessions_student_insert" on workout_sessions
  for insert to authenticated
  with check (student_id in (select id from students where user_id = auth.uid()));

create policy "workout_sessions_student_update" on workout_sessions
  for update to authenticated
  using (student_id in (select id from students where user_id = auth.uid()))
  with check (student_id in (select id from students where user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- set_logs
-- ---------------------------------------------------------------------------
alter table set_logs enable row level security;

drop policy if exists "set_logs_select" on set_logs;
drop policy if exists "set_logs_student_insert" on set_logs;
drop policy if exists "set_logs_student_update" on set_logs;

create policy "set_logs_select" on set_logs
  for select to authenticated
  using (
    session_id in (
      select id from workout_sessions
      where student_id in (select id from students where user_id = auth.uid())
    )
  );

create policy "set_logs_student_insert" on set_logs
  for insert to authenticated
  with check (
    session_id in (
      select id from workout_sessions
      where student_id in (select id from students where user_id = auth.uid())
    )
  );

create policy "set_logs_student_update" on set_logs
  for update to authenticated
  using (
    session_id in (
      select id from workout_sessions
      where student_id in (select id from students where user_id = auth.uid())
    )
  )
  with check (
    session_id in (
      select id from workout_sessions
      where student_id in (select id from students where user_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- progress
-- ---------------------------------------------------------------------------
alter table progress enable row level security;

drop policy if exists "progress_select" on progress;
drop policy if exists "progress_student_insert" on progress;
drop policy if exists "progress_student_update" on progress;

create policy "progress_select" on progress
  for select to authenticated
  using (student_id in (select id from students where user_id = auth.uid()));

create policy "progress_student_insert" on progress
  for insert to authenticated
  with check (student_id in (select id from students where user_id = auth.uid()));

create policy "progress_student_update" on progress
  for update to authenticated
  using (student_id in (select id from students where user_id = auth.uid()))
  with check (student_id in (select id from students where user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- progress_photos
-- ---------------------------------------------------------------------------
alter table progress_photos enable row level security;

drop policy if exists "progress_photos_select" on progress_photos;
drop policy if exists "progress_photos_student_insert" on progress_photos;
drop policy if exists "progress_photos_student_update" on progress_photos;
drop policy if exists "progress_photos_student_delete" on progress_photos;

create policy "progress_photos_select" on progress_photos
  for select to authenticated
  using (
    progress_id in (
      select id from progress
      where student_id in (select id from students where user_id = auth.uid())
    )
  );

create policy "progress_photos_student_insert" on progress_photos
  for insert to authenticated
  with check (
    progress_id in (
      select id from progress
      where student_id in (select id from students where user_id = auth.uid())
    )
  );

create policy "progress_photos_student_update" on progress_photos
  for update to authenticated
  using (
    progress_id in (
      select id from progress
      where student_id in (select id from students where user_id = auth.uid())
    )
  )
  with check (
    progress_id in (
      select id from progress
      where student_id in (select id from students where user_id = auth.uid())
    )
  );

create policy "progress_photos_student_delete" on progress_photos
  for delete to authenticated
  using (
    progress_id in (
      select id from progress
      where student_id in (select id from students where user_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- nutrition
-- ---------------------------------------------------------------------------
alter table nutrition enable row level security;

drop policy if exists "nutrition_select" on nutrition;
drop policy if exists "nutrition_trainer_insert" on nutrition;
drop policy if exists "nutrition_trainer_update" on nutrition;
drop policy if exists "nutrition_trainer_delete" on nutrition;

create policy "nutrition_select" on nutrition
  for select to authenticated
  using (
    trainer_id = auth.uid()
    or student_id in (select id from students where user_id = auth.uid())
  );

create policy "nutrition_trainer_insert" on nutrition
  for insert to authenticated
  with check (trainer_id = auth.uid());

create policy "nutrition_trainer_update" on nutrition
  for update to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "nutrition_trainer_delete" on nutrition
  for delete to authenticated
  using (trainer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- meals — trainer full CRUD; student may only update their own selection.
-- ---------------------------------------------------------------------------
alter table meals enable row level security;

drop policy if exists "meals_select" on meals;
drop policy if exists "meals_trainer_insert" on meals;
drop policy if exists "meals_trainer_update" on meals;
drop policy if exists "meals_student_update" on meals;
drop policy if exists "meals_trainer_delete" on meals;

create policy "meals_select" on meals
  for select to authenticated
  using (
    nutrition_id in (
      select id from nutrition
      where trainer_id = auth.uid()
         or student_id in (select id from students where user_id = auth.uid())
    )
  );

create policy "meals_trainer_insert" on meals
  for insert to authenticated
  with check (nutrition_id in (select id from nutrition where trainer_id = auth.uid()));

create policy "meals_trainer_update" on meals
  for update to authenticated
  using (nutrition_id in (select id from nutrition where trainer_id = auth.uid()))
  with check (nutrition_id in (select id from nutrition where trainer_id = auth.uid()));

-- setMealSelection: the student picks their recipe option for the day.
create policy "meals_student_update" on meals
  for update to authenticated
  using (
    nutrition_id in (
      select id from nutrition
      where student_id in (select id from students where user_id = auth.uid())
    )
  )
  with check (
    nutrition_id in (
      select id from nutrition
      where student_id in (select id from students where user_id = auth.uid())
    )
  );

create policy "meals_trainer_delete" on meals
  for delete to authenticated
  using (nutrition_id in (select id from nutrition where trainer_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- meal_recipes — trainer-owned options for a meal slot.
-- ---------------------------------------------------------------------------
alter table meal_recipes enable row level security;

drop policy if exists "meal_recipes_select" on meal_recipes;
drop policy if exists "meal_recipes_trainer_insert" on meal_recipes;
drop policy if exists "meal_recipes_trainer_update" on meal_recipes;
drop policy if exists "meal_recipes_trainer_delete" on meal_recipes;

create policy "meal_recipes_select" on meal_recipes
  for select to authenticated
  using (
    meal_id in (
      select id from meals where nutrition_id in (
        select id from nutrition
        where trainer_id = auth.uid()
           or student_id in (select id from students where user_id = auth.uid())
      )
    )
  );

create policy "meal_recipes_trainer_insert" on meal_recipes
  for insert to authenticated
  with check (
    meal_id in (
      select id from meals where nutrition_id in (
        select id from nutrition where trainer_id = auth.uid()
      )
    )
  );

create policy "meal_recipes_trainer_update" on meal_recipes
  for update to authenticated
  using (
    meal_id in (
      select id from meals where nutrition_id in (
        select id from nutrition where trainer_id = auth.uid()
      )
    )
  )
  with check (
    meal_id in (
      select id from meals where nutrition_id in (
        select id from nutrition where trainer_id = auth.uid()
      )
    )
  );

create policy "meal_recipes_trainer_delete" on meal_recipes
  for delete to authenticated
  using (
    meal_id in (
      select id from meals where nutrition_id in (
        select id from nutrition where trainer_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- meal_recipe_items — per-student portion of a meal option.
-- ---------------------------------------------------------------------------
alter table meal_recipe_items enable row level security;

drop policy if exists "meal_recipe_items_select" on meal_recipe_items;
drop policy if exists "meal_recipe_items_trainer_insert" on meal_recipe_items;
drop policy if exists "meal_recipe_items_trainer_update" on meal_recipe_items;
drop policy if exists "meal_recipe_items_trainer_delete" on meal_recipe_items;

create policy "meal_recipe_items_select" on meal_recipe_items
  for select to authenticated
  using (
    meal_recipe_id in (
      select id from meal_recipes where meal_id in (
        select id from meals where nutrition_id in (
          select id from nutrition
          where trainer_id = auth.uid()
             or student_id in (select id from students where user_id = auth.uid())
        )
      )
    )
  );

create policy "meal_recipe_items_trainer_insert" on meal_recipe_items
  for insert to authenticated
  with check (
    meal_recipe_id in (
      select id from meal_recipes where meal_id in (
        select id from meals where nutrition_id in (
          select id from nutrition where trainer_id = auth.uid()
        )
      )
    )
  );

create policy "meal_recipe_items_trainer_update" on meal_recipe_items
  for update to authenticated
  using (
    meal_recipe_id in (
      select id from meal_recipes where meal_id in (
        select id from meals where nutrition_id in (
          select id from nutrition where trainer_id = auth.uid()
        )
      )
    )
  )
  with check (
    meal_recipe_id in (
      select id from meal_recipes where meal_id in (
        select id from meals where nutrition_id in (
          select id from nutrition where trainer_id = auth.uid()
        )
      )
    )
  );

create policy "meal_recipe_items_trainer_delete" on meal_recipe_items
  for delete to authenticated
  using (
    meal_recipe_id in (
      select id from meal_recipes where meal_id in (
        select id from meals where nutrition_id in (
          select id from nutrition where trainer_id = auth.uid()
        )
      )
    )
  );

-- ---------------------------------------------------------------------------
-- recipes — hybrid catalog (trainer_id null = shared, set = private).
-- ---------------------------------------------------------------------------
alter table recipes enable row level security;

drop policy if exists "recipes_select" on recipes;
drop policy if exists "recipes_trainer_insert" on recipes;
drop policy if exists "recipes_trainer_update" on recipes;
drop policy if exists "recipes_trainer_delete" on recipes;

create policy "recipes_select" on recipes
  for select to authenticated
  using (
    trainer_id is null
    or trainer_id = auth.uid()
    or trainer_id in (select trainer_id from students where user_id = auth.uid())
  );

create policy "recipes_trainer_insert" on recipes
  for insert to authenticated
  with check (trainer_id = auth.uid());

create policy "recipes_trainer_update" on recipes
  for update to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "recipes_trainer_delete" on recipes
  for delete to authenticated
  using (trainer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- recipe_items — catalog recipes' food lines.
-- ---------------------------------------------------------------------------
alter table recipe_items enable row level security;

drop policy if exists "recipe_items_select" on recipe_items;
drop policy if exists "recipe_items_trainer_insert" on recipe_items;
drop policy if exists "recipe_items_trainer_update" on recipe_items;
drop policy if exists "recipe_items_trainer_delete" on recipe_items;

create policy "recipe_items_select" on recipe_items
  for select to authenticated
  using (
    recipe_id in (
      select id from recipes
      where trainer_id is null
         or trainer_id = auth.uid()
         or trainer_id in (select trainer_id from students where user_id = auth.uid())
    )
  );

create policy "recipe_items_trainer_insert" on recipe_items
  for insert to authenticated
  with check (recipe_id in (select id from recipes where trainer_id = auth.uid()));

create policy "recipe_items_trainer_update" on recipe_items
  for update to authenticated
  using (recipe_id in (select id from recipes where trainer_id = auth.uid()))
  with check (recipe_id in (select id from recipes where trainer_id = auth.uid()));

create policy "recipe_items_trainer_delete" on recipe_items
  for delete to authenticated
  using (recipe_id in (select id from recipes where trainer_id = auth.uid()));
