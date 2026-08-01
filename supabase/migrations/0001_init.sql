-- Zone2 schema: profiles, clubs, workouts, matches, scheduled sessions, check-ins, verification.
create extension if not exists "pgcrypto";

create type public.profile_role as enum ('user', 'sub_admin', 'admin');
create type public.verified_tier as enum ('unverified', 'verified');
create type public.intent_type as enum ('training_partner', 'dating', 'open');
create type public.activity_type as enum (
  'running', 'lifting', 'cycling', 'swimming', 'climbing', 'hiking', 'yoga', 'rowing', 'other'
);
create type public.workout_source as enum ('manual', 'seed', 'strava', 'apple_health', 'garmin', 'whoop');
create type public.match_status as enum ('pending', 'mutual', 'declined');
create type public.session_status as enum ('proposed', 'confirmed', 'completed', 'cancelled');
create type public.checkin_outcome as enum ('train_again', 'date', 'pass');
create type public.verification_status as enum ('pending', 'approved', 'rejected');
create type public.attendance_status as enum ('registered', 'attended', 'no_show');

-- profiles: 1:1 with auth.users. club_id FK to clubs is added after clubs exists (see below).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  role public.profile_role not null default 'user',
  club_id uuid,
  verified_tier public.verified_tier not null default 'unverified',
  consistency_score numeric not null default 0,
  primary_activities public.activity_type[] not null default '{}',
  training_windows jsonb not null default '{}'::jsonb,
  intent public.intent_type not null default 'open',
  birthdate date,
  latitude numeric,
  longitude numeric,
  location_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  city text,
  logo_url text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_club_id_fkey foreign key (club_id) references public.clubs (id);

create index profiles_club_id_idx on public.profiles (club_id);

create table public.club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  visible_to_club boolean not null default true,
  joined_at timestamptz not null default now(),
  unique (club_id, profile_id)
);
create index club_members_club_id_idx on public.club_members (club_id);
create index club_members_profile_id_idx on public.club_members (profile_id);

create table public.club_events (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  title text not null,
  description text,
  activity_type public.activity_type,
  starts_at timestamptz not null,
  location_text text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);
create index club_events_club_id_idx on public.club_events (club_id);

create table public.club_event_attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.club_events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status public.attendance_status not null default 'registered',
  checked_in_at timestamptz,
  unique (event_id, profile_id)
);
create index club_event_attendance_event_id_idx on public.club_event_attendance (event_id);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  activity_type public.activity_type not null,
  started_at timestamptz not null,
  duration_minutes int not null check (duration_minutes > 0),
  intensity text,
  avg_hr int,
  source public.workout_source not null default 'manual',
  external_id text,
  notes text,
  created_at timestamptz not null default now()
);
create index workouts_profile_id_started_at_idx on public.workouts (profile_id, started_at desc);
create unique index workouts_source_external_id_idx on public.workouts (source, external_id) where external_id is not null;

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  profile_a_id uuid not null references public.profiles (id) on delete cascade,
  profile_b_id uuid not null references public.profiles (id) on delete cascade,
  compatibility_score numeric not null,
  status public.match_status not null default 'pending',
  initiated_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint matches_ordered_pair check (profile_a_id < profile_b_id),
  unique (profile_a_id, profile_b_id)
);
create index matches_profile_a_id_idx on public.matches (profile_a_id);
create index matches_profile_b_id_idx on public.matches (profile_b_id);

create table public.scheduled_sessions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  profile_a_id uuid not null references public.profiles (id),
  profile_b_id uuid not null references public.profiles (id),
  activity_type public.activity_type not null,
  venue_name text not null,
  venue_address text not null,
  scheduled_at timestamptz not null,
  duration_minutes int not null default 60,
  status public.session_status not null default 'proposed',
  romantic_unlocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index scheduled_sessions_profile_a_id_idx on public.scheduled_sessions (profile_a_id);
create index scheduled_sessions_profile_b_id_idx on public.scheduled_sessions (profile_b_id);
create index scheduled_sessions_match_id_idx on public.scheduled_sessions (match_id);

create table public.session_checkins (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.scheduled_sessions (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  outcome public.checkin_outcome not null,
  submitted_at timestamptz not null default now(),
  unique (session_id, profile_id)
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status public.verification_status not null default 'pending',
  evidence_url text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index verification_requests_status_idx on public.verification_requests (status);

-- Safe columns for browsing/matching: exposes all profiles (not just self) but never
-- birthdate, role, club_id, or anything not needed to evaluate a potential match.
create view public.profiles_public
  with (security_invoker = false) as
  select
    id,
    display_name,
    avatar_url,
    bio,
    verified_tier,
    consistency_score,
    primary_activities,
    training_windows,
    intent,
    location_text,
    latitude,
    longitude,
    extract(year from age(birthdate))::int as age,
    created_at
  from public.profiles;

revoke all on public.profiles_public from anon, public;
grant select on public.profiles_public to authenticated;
