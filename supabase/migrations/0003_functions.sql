-- Business-logic functions and triggers.

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Reject client attempts to self-promote; only an admin (or the system trigger below) may
-- change role/club_id/verified_tier/consistency_score.
create or replace function public.prevent_profile_privilege_escalation() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role
      or new.club_id is distinct from old.club_id
      or new.verified_tier is distinct from old.verified_tier
      or new.consistency_score is distinct from old.consistency_score
    then
      raise exception 'Cannot modify system-controlled profile fields';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_before_update on public.profiles;
create trigger profiles_before_update
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();

-- Rolling 90-day consistency score, cached on the profile row.
-- Target: 3 sessions/week sustained for ~12 weeks (36 workouts) = 100.
create or replace function public.recompute_consistency_score(p_profile_id uuid) returns void
  language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  select count(*) into v_count
  from public.workouts
  where profile_id = p_profile_id and started_at >= now() - interval '90 days';

  update public.profiles
  set consistency_score = round(least(100, v_count::numeric / 36 * 100), 1)
  where id = p_profile_id;
end;
$$;

revoke execute on function public.recompute_consistency_score(uuid) from public;

create or replace function public.workouts_after_change() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    perform public.recompute_consistency_score(old.profile_id);
    return old;
  else
    perform public.recompute_consistency_score(new.profile_id);
    return new;
  end if;
end;
$$;

drop trigger if exists workouts_after_change on public.workouts;
create trigger workouts_after_change
  after insert or update or delete on public.workouts
  for each row execute function public.workouts_after_change();

-- v1 compatibility score: activity overlap + consistency parity. Deliberately simple —
-- a computable starting point, not a ranking model. Schedule-overlap scoring against
-- training_windows can be layered in later without changing the create_match() contract.
create or replace function public.compute_compatibility(a uuid, b uuid) returns numeric
  language plpgsql stable security definer set search_path = public as $$
declare
  v_a public.profiles;
  v_b public.profiles;
  v_activity_overlap int;
  v_consistency_diff numeric;
  v_score numeric;
begin
  select * into v_a from public.profiles where id = a;
  select * into v_b from public.profiles where id = b;

  select count(*) into v_activity_overlap
  from unnest(v_a.primary_activities) act
  where act = any (v_b.primary_activities);

  v_consistency_diff := abs(coalesce(v_a.consistency_score, 0) - coalesce(v_b.consistency_score, 0));

  v_score := 40 + least(30, v_activity_overlap * 15) + greatest(0, 30 - v_consistency_diff * 0.3);

  return round(least(100, greatest(0, v_score)), 1);
end;
$$;

revoke execute on function public.compute_compatibility(uuid, uuid) from public;

-- The only sanctioned way to create a match: compatibility_score is always computed
-- server-side here, never accepted from the client.
create or replace function public.create_match(target_profile_id uuid) returns public.matches
  language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  v_a uuid;
  v_b uuid;
  v_score numeric;
  v_match public.matches;
begin
  if v_me is null then
    raise exception 'Not authenticated';
  end if;
  if v_me = target_profile_id then
    raise exception 'Cannot match with yourself';
  end if;

  v_a := least(v_me, target_profile_id);
  v_b := greatest(v_me, target_profile_id);
  v_score := public.compute_compatibility(v_me, target_profile_id);

  insert into public.matches (profile_a_id, profile_b_id, compatibility_score, initiated_by, status)
  values (v_a, v_b, v_score, v_me, 'pending')
  on conflict (profile_a_id, profile_b_id) do nothing
  returning * into v_match;

  if v_match.id is null then
    select * into v_match from public.matches where profile_a_id = v_a and profile_b_id = v_b;
  end if;

  return v_match;
end;
$$;

revoke execute on function public.create_match(uuid) from public;
grant execute on function public.create_match(uuid) to authenticated;

create or replace function public.set_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists scheduled_sessions_set_updated_at on public.scheduled_sessions;
create trigger scheduled_sessions_set_updated_at
  before update on public.scheduled_sessions
  for each row execute function public.set_updated_at();

-- When both participants privately check in "date", flip a visible flag without either
-- party ever being able to read the other's raw checkin row (see RLS: checkins_select_self).
create or replace function public.session_checkins_after_insert() returns trigger
  language plpgsql security definer set search_path = public as $$
declare
  v_session public.scheduled_sessions;
  v_a_outcome public.checkin_outcome;
  v_b_outcome public.checkin_outcome;
begin
  select * into v_session from public.scheduled_sessions where id = new.session_id;

  select outcome into v_a_outcome from public.session_checkins
    where session_id = new.session_id and profile_id = v_session.profile_a_id;
  select outcome into v_b_outcome from public.session_checkins
    where session_id = new.session_id and profile_id = v_session.profile_b_id;

  if v_a_outcome = 'date' and v_b_outcome = 'date' then
    update public.scheduled_sessions set romantic_unlocked = true where id = new.session_id;
  end if;

  return new;
end;
$$;

drop trigger if exists session_checkins_after_insert on public.session_checkins;
create trigger session_checkins_after_insert
  after insert on public.session_checkins
  for each row execute function public.session_checkins_after_insert();

-- Coarse status only — never exposes the partner's raw outcome unless it's mutually "date".
create or replace function public.get_session_outcome_status(p_session_id uuid) returns text
  language plpgsql stable security definer set search_path = public as $$
declare
  v_session public.scheduled_sessions;
  v_other_id uuid;
  v_my_outcome public.checkin_outcome;
  v_other_outcome public.checkin_outcome;
begin
  select * into v_session from public.scheduled_sessions where id = p_session_id;
  if v_session.id is null then
    raise exception 'Session not found';
  end if;
  if auth.uid() not in (v_session.profile_a_id, v_session.profile_b_id) and not public.is_admin() then
    raise exception 'Not a participant';
  end if;

  v_other_id := case when v_session.profile_a_id = auth.uid() then v_session.profile_b_id else v_session.profile_a_id end;

  select outcome into v_my_outcome from public.session_checkins
    where session_id = p_session_id and profile_id = auth.uid();
  select outcome into v_other_outcome from public.session_checkins
    where session_id = p_session_id and profile_id = v_other_id;

  if v_my_outcome is null then
    return 'awaiting_you';
  elsif v_other_outcome is null then
    return 'waiting';
  elsif v_my_outcome = 'date' and v_other_outcome = 'date' then
    return 'mutual_date';
  else
    return 'no_match';
  end if;
end;
$$;

revoke execute on function public.get_session_outcome_status(uuid) from public;
grant execute on function public.get_session_outcome_status(uuid) to authenticated;
