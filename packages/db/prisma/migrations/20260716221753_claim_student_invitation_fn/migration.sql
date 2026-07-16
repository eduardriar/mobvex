-- claim_student_invitation: atomic registration hand-off from the trainer's
-- placeholder to the student's real auth account.
--
-- Context: `createStudentForTrainer` pre-creates a `users` row (placeholder,
-- random id, student's email) plus the `students` row pointing at it. When the
-- student later registers (passwordless OTP), their auth uid differs from the
-- placeholder id, and `users.email` is UNIQUE — so creating a second profile
-- either fails (same email) or duplicates the student (different email),
-- leaving the trainer's roster pointing at the placeholder.
--
-- This function runs as SECURITY DEFINER so it also works once the users /
-- students RLS pass lands (the student could not re-point rows they don't own).
--
-- Claim strategy: UPDATE the placeholder users.id to auth.uid() — the
-- students.user_id FK is ON UPDATE CASCADE, so the students row follows and
-- keeps its id (pre-assigned routines/diets stay attached).

create or replace function public.claim_student_invitation(
  p_invitation_id uuid,
  p_name text,
  p_goal public."Goal"
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_inv public.invitations%rowtype;
  v_student_id uuid;
  v_placeholder uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  select email into v_email from auth.users where id = v_uid;

  -- Retry-safe: if this user is already linked, return that — even when the
  -- invitation was consumed by the earlier attempt (close it if still open).
  select id into v_student_id from public.students where user_id = v_uid;
  if found then
    update public.invitations
      set status = 'accepted', accepted_at = now()
      where id = p_invitation_id and status = 'pending';
    return v_student_id;
  end if;

  select * into v_inv
  from public.invitations
  where id = p_invitation_id
    and status = 'pending'
    and (expires_at is null or expires_at > now());
  if not found then
    raise exception 'invitation_not_pending';
  end if;

  -- The trainer's placeholder for this invitation: same email, this trainer's
  -- roster, and no auth account behind it.
  select u.id into v_placeholder
  from public.users u
  join public.students s on s.user_id = u.id and s.trainer_id = v_inv.trainer_id
  where u.email = v_inv.email
    and u.role = 'student'
    and not exists (select 1 from auth.users au where au.id = u.id)
  limit 1;

  if v_placeholder is not null then
    if exists (select 1 from public.users where id = v_uid) then
      -- A profile for this auth user already exists (partial earlier attempt):
      -- re-point the students row and drop the placeholder.
      update public.students set user_id = v_uid where user_id = v_placeholder;
      delete from public.users where id = v_placeholder;
    else
      -- Turn the placeholder into the real profile; students.user_id cascades.
      update public.users
        set id = v_uid, email = v_email, name = p_name
        where id = v_placeholder;
    end if;
    update public.students
      set goal = p_goal
      where user_id = v_uid
      returning id into v_student_id;
  else
    -- Invitation without a placeholder: create profile + link from scratch.
    insert into public.users (id, email, role, name)
      values (v_uid, v_email, 'student', p_name)
      on conflict (id) do nothing;
    insert into public.students (trainer_id, user_id, goal, active)
      values (v_inv.trainer_id, v_uid, p_goal, true)
      returning id into v_student_id;
  end if;

  update public.invitations
    set status = 'accepted', accepted_at = now()
    where id = v_inv.id;

  return v_student_id;
end;
$$;

revoke all on function public.claim_student_invitation(uuid, text, public."Goal") from public;
grant execute on function public.claim_student_invitation(uuid, text, public."Goal") to authenticated;
