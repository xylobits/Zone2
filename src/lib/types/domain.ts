// Hand-authored types mirroring supabase/migrations/0001_init.sql.
// Once a live Supabase project exists, `supabase gen types typescript` can generate
// src/lib/types/database.ts from the real schema; these stay as the app-level shapes
// components/actions consume.

export type ProfileRole = 'user' | 'sub_admin' | 'admin';
export type VerifiedTier = 'unverified' | 'verified';
export type IntentType = 'training_partner' | 'dating' | 'open';
export type ActivityType =
  | 'running'
  | 'lifting'
  | 'cycling'
  | 'swimming'
  | 'climbing'
  | 'hiking'
  | 'yoga'
  | 'rowing'
  | 'other';
export type WorkoutSource = 'manual' | 'seed' | 'strava' | 'apple_health' | 'garmin' | 'whoop';
export type MatchStatus = 'pending' | 'mutual' | 'declined';
export type SessionStatus = 'proposed' | 'confirmed' | 'completed' | 'cancelled';
export type CheckinOutcome = 'train_again' | 'date' | 'pass';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type AttendanceStatus = 'registered' | 'attended' | 'no_show';
export type SessionOutcomeStatus = 'awaiting_you' | 'waiting' | 'mutual_date' | 'no_match';

export interface Profile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: ProfileRole;
  club_id: string | null;
  verified_tier: VerifiedTier;
  consistency_score: number;
  primary_activities: ActivityType[];
  training_windows: Record<string, unknown>;
  intent: IntentType;
  birthdate: string | null;
  latitude: number | null;
  longitude: number | null;
  location_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfilePublic {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  verified_tier: VerifiedTier;
  consistency_score: number;
  primary_activities: ActivityType[];
  training_windows: Record<string, unknown>;
  intent: IntentType;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  age: number | null;
  created_at: string;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  logo_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ClubMember {
  id: string;
  club_id: string;
  profile_id: string;
  visible_to_club: boolean;
  joined_at: string;
}

export interface ClubEvent {
  id: string;
  club_id: string;
  title: string;
  description: string | null;
  activity_type: ActivityType | null;
  starts_at: string;
  location_text: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ClubEventAttendance {
  id: string;
  event_id: string;
  profile_id: string;
  status: AttendanceStatus;
  checked_in_at: string | null;
}

export interface Workout {
  id: string;
  profile_id: string;
  activity_type: ActivityType;
  started_at: string;
  duration_minutes: number;
  intensity: string | null;
  avg_hr: number | null;
  source: WorkoutSource;
  external_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface Match {
  id: string;
  profile_a_id: string;
  profile_b_id: string;
  compatibility_score: number;
  status: MatchStatus;
  initiated_by: string;
  created_at: string;
  responded_at: string | null;
}

export interface ScheduledSession {
  id: string;
  match_id: string;
  profile_a_id: string;
  profile_b_id: string;
  activity_type: ActivityType;
  venue_name: string;
  venue_address: string;
  scheduled_at: string;
  duration_minutes: number;
  status: SessionStatus;
  romantic_unlocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionCheckin {
  id: string;
  session_id: string;
  profile_id: string;
  outcome: CheckinOutcome;
  submitted_at: string;
}

export interface VerificationRequest {
  id: string;
  profile_id: string;
  status: VerificationStatus;
  evidence_url: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
}

export const ACTIVITY_TYPES: ActivityType[] = [
  'running',
  'lifting',
  'cycling',
  'swimming',
  'climbing',
  'hiking',
  'yoga',
  'rowing',
  'other',
];
