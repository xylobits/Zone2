-- Row Level Security: the actual authorization boundary (holds even if a request bypasses Next.js).
-- Helper functions are SECURITY DEFINER so a policy reading `profiles` to check the caller's own
-- role does not recursively re-trigger RLS on that same lookup.

create or replace function public.current_role() returns public.profile_role
  language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_club_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select club_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

revoke execute on function public.current_role() from public;
revoke execute on function public.current_club_id() from public;
revoke execute on function public.is_admin() from public;
grant execute on function public.current_role() to authenticated;
grant execute on function public.current_club_id() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------------- profiles ----------------
alter table public.profiles enable row level security;

create policy profiles_select_self on public.profiles
  for select using (id = auth.uid());
create policy profiles_select_admin on public.profiles
  for select using (public.is_admin());
create policy profiles_select_subadmin_club on public.profiles
  for select using (public.current_role() = 'sub_admin' and club_id = public.current_club_id());

create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

create policy profiles_delete_self on public.profiles
  for delete using (id = auth.uid());
create policy profiles_delete_admin on public.profiles
  for delete using (public.is_admin());
-- No INSERT policy: rows are created only by the handle_new_user trigger (SECURITY DEFINER).

-- ---------------- clubs ----------------
alter table public.clubs enable row level security;

create policy clubs_select_all on public.clubs
  for select to authenticated using (true);
create policy clubs_write_admin on public.clubs
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------- club_members ----------------
alter table public.club_members enable row level security;

create policy club_members_select on public.club_members
  for select using (
    profile_id = auth.uid()
    or public.is_admin()
    or (public.current_role() = 'sub_admin' and club_id = public.current_club_id())
    or (
      visible_to_club = true
      and exists (
        select 1 from public.club_members me
        where me.profile_id = auth.uid() and me.club_id = club_members.club_id
      )
    )
  );
create policy club_members_insert on public.club_members
  for insert with check (
    profile_id = auth.uid()
    or public.is_admin()
    or (public.current_role() = 'sub_admin' and club_id = public.current_club_id())
  );
create policy club_members_update on public.club_members
  for update using (
    profile_id = auth.uid()
    or public.is_admin()
    or (public.current_role() = 'sub_admin' and club_id = public.current_club_id())
  );
create policy club_members_delete on public.club_members
  for delete using (
    profile_id = auth.uid()
    or public.is_admin()
    or (public.current_role() = 'sub_admin' and club_id = public.current_club_id())
  );

-- ---------------- club_events ----------------
alter table public.club_events enable row level security;

create policy club_events_select_all on public.club_events
  for select to authenticated using (true);
create policy club_events_write on public.club_events
  for all using (
    public.is_admin() or (public.current_role() = 'sub_admin' and club_id = public.current_club_id())
  ) with check (
    public.is_admin() or (public.current_role() = 'sub_admin' and club_id = public.current_club_id())
  );

-- ---------------- club_event_attendance ----------------
alter table public.club_event_attendance enable row level security;

create policy attendance_select on public.club_event_attendance
  for select using (
    profile_id = auth.uid()
    or public.is_admin()
    or (
      public.current_role() = 'sub_admin'
      and exists (select 1 from public.club_events e where e.id = event_id and e.club_id = public.current_club_id())
    )
  );
create policy attendance_insert on public.club_event_attendance
  for insert with check (
    profile_id = auth.uid()
    or public.is_admin()
    or (
      public.current_role() = 'sub_admin'
      and exists (select 1 from public.club_events e where e.id = event_id and e.club_id = public.current_club_id())
    )
  );
create policy attendance_update on public.club_event_attendance
  for update using (
    profile_id = auth.uid()
    or public.is_admin()
    or (
      public.current_role() = 'sub_admin'
      and exists (select 1 from public.club_events e where e.id = event_id and e.club_id = public.current_club_id())
    )
  );
create policy attendance_delete on public.club_event_attendance
  for delete using (
    profile_id = auth.uid()
    or public.is_admin()
    or (
      public.current_role() = 'sub_admin'
      and exists (select 1 from public.club_events e where e.id = event_id and e.club_id = public.current_club_id())
    )
  );

-- ---------------- workouts ----------------
alter table public.workouts enable row level security;

create policy workouts_owner_all on public.workouts
  for all using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- ---------------- matches ----------------
alter table public.matches enable row level security;

create policy matches_select on public.matches
  for select using (profile_a_id = auth.uid() or profile_b_id = auth.uid() or public.is_admin());
create policy matches_insert_admin on public.matches
  for insert with check (public.is_admin());
  -- Regular users create matches only via the create_match() SECURITY DEFINER RPC.
create policy matches_update on public.matches
  for update using (
    public.is_admin()
    or ((profile_a_id = auth.uid() or profile_b_id = auth.uid()) and initiated_by <> auth.uid())
  ) with check (
    public.is_admin() or status in ('mutual', 'declined')
  );
create policy matches_delete_admin on public.matches
  for delete using (public.is_admin());

-- ---------------- scheduled_sessions ----------------
alter table public.scheduled_sessions enable row level security;

create policy sessions_select on public.scheduled_sessions
  for select using (profile_a_id = auth.uid() or profile_b_id = auth.uid() or public.is_admin());
create policy sessions_insert on public.scheduled_sessions
  for insert with check (
    (profile_a_id = auth.uid() or profile_b_id = auth.uid())
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.status = 'mutual'
        and least(m.profile_a_id, m.profile_b_id) = least(scheduled_sessions.profile_a_id, scheduled_sessions.profile_b_id)
        and greatest(m.profile_a_id, m.profile_b_id) = greatest(scheduled_sessions.profile_a_id, scheduled_sessions.profile_b_id)
    )
  );
create policy sessions_update on public.scheduled_sessions
  for update using (profile_a_id = auth.uid() or profile_b_id = auth.uid() or public.is_admin());
create policy sessions_delete_admin on public.scheduled_sessions
  for delete using (public.is_admin());
  -- No plain-user DELETE: cancellation is a status update, per spec.

-- ---------------- session_checkins ----------------
alter table public.session_checkins enable row level security;

create policy checkins_select_self on public.session_checkins
  for select using (profile_id = auth.uid() or public.is_admin());
  -- Deliberately no policy lets a user read their partner's row; see get_session_outcome_status().
create policy checkins_insert on public.session_checkins
  for insert with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.scheduled_sessions s
      where s.id = session_id and (s.profile_a_id = auth.uid() or s.profile_b_id = auth.uid())
    )
  );
create policy checkins_delete_admin on public.session_checkins
  for delete using (public.is_admin());
  -- No UPDATE policy: check-ins are immutable once submitted.

-- ---------------- verification_requests ----------------
alter table public.verification_requests enable row level security;

create policy vr_select on public.verification_requests
  for select using (profile_id = auth.uid() or public.is_admin());
create policy vr_insert on public.verification_requests
  for insert with check (profile_id = auth.uid());
create policy vr_update_admin on public.verification_requests
  for update using (public.is_admin()) with check (public.is_admin());
create policy vr_delete_admin on public.verification_requests
  for delete using (public.is_admin());
