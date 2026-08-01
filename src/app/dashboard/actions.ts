'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/roles';
import { ACTIVITY_TYPES, type CheckinOutcome } from '@/lib/types/domain';

export interface ActionState {
  error: string | null;
}

const profileSchema = z.object({
  display_name: z.string().trim().min(1, 'Name is required').max(60),
  bio: z.string().trim().max(500).optional(),
  intent: z.enum(['training_partner', 'dating', 'open']),
  location_text: z.string().trim().max(120).optional(),
  birthdate: z.string().optional(),
  primary_activities: z.array(z.enum(ACTIVITY_TYPES as [string, ...string[]])).max(9),
});

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireUser();

  const parsed = profileSchema.safeParse({
    display_name: formData.get('display_name'),
    bio: formData.get('bio') ?? undefined,
    intent: formData.get('intent'),
    location_text: formData.get('location_text') ?? undefined,
    birthdate: formData.get('birthdate') ?? undefined,
    primary_activities: formData.getAll('primary_activities'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid profile data.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.display_name,
      bio: parsed.data.bio || null,
      intent: parsed.data.intent,
      location_text: parsed.data.location_text || null,
      birthdate: parsed.data.birthdate || null,
      primary_activities: parsed.data.primary_activities,
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard');
  redirect('/dashboard/profile');
}

const workoutSchema = z.object({
  activity_type: z.enum(ACTIVITY_TYPES as [string, ...string[]]),
  started_at: z.string().min(1, 'Date is required'),
  duration_minutes: z.coerce.number().int().min(1).max(1000),
  notes: z.string().trim().max(500).optional(),
});

export async function addWorkout(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireUser();

  const parsed = workoutSchema.safeParse({
    activity_type: formData.get('activity_type'),
    started_at: formData.get('started_at'),
    duration_minutes: formData.get('duration_minutes'),
    notes: formData.get('notes') ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid workout.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('workouts').insert({
    profile_id: user.id,
    activity_type: parsed.data.activity_type,
    started_at: new Date(parsed.data.started_at).toISOString(),
    duration_minutes: parsed.data.duration_minutes,
    notes: parsed.data.notes || null,
    source: 'manual',
  });

  if (error) return { error: error.message };

  revalidatePath('/dashboard/workouts');
  revalidatePath('/dashboard');
  redirect('/dashboard/workouts');
}

export async function requestVerification(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  const { user } = await requireUser();

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('verification_requests')
    .select('id')
    .eq('profile_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();
  if (existing) {
    return { error: 'You already have a pending verification request.' };
  }

  const { error } = await supabase.from('verification_requests').insert({ profile_id: user.id });
  if (error) return { error: error.message };

  revalidatePath('/dashboard/verification');
  return { error: null };
}

export async function createMatch(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const targetId = String(formData.get('target_profile_id') ?? '');
  if (!targetId) return { error: 'Missing target profile.' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_match', { target_profile_id: targetId });
  if (error) return { error: error.message };

  revalidatePath('/dashboard/matches');
  return { error: null };
}

export async function respondToMatch(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireUser();
  const matchId = String(formData.get('match_id') ?? '');
  const decision = String(formData.get('decision') ?? '');
  if (!matchId || (decision !== 'mutual' && decision !== 'declined')) {
    return { error: 'Invalid response.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('matches')
    .update({ status: decision, responded_at: new Date().toISOString() })
    .eq('id', matchId)
    .neq('initiated_by', user.id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/matches');
  return { error: null };
}

const sessionSchema = z.object({
  match_id: z.string().uuid(),
  activity_type: z.enum(ACTIVITY_TYPES as [string, ...string[]]),
  venue_name: z.string().trim().min(1, 'Venue name is required').max(120),
  venue_address: z.string().trim().min(1, 'Venue address is required').max(200),
  scheduled_at: z.string().min(1, 'Date/time is required'),
  duration_minutes: z.coerce.number().int().min(15).max(480),
});

export async function scheduleSession(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireUser();

  const parsed = sessionSchema.safeParse({
    match_id: formData.get('match_id'),
    activity_type: formData.get('activity_type'),
    venue_name: formData.get('venue_name'),
    venue_address: formData.get('venue_address'),
    scheduled_at: formData.get('scheduled_at'),
    duration_minutes: formData.get('duration_minutes'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid session details.' };
  }

  const supabase = await createClient();
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id, profile_a_id, profile_b_id, status')
    .eq('id', parsed.data.match_id)
    .single();
  if (matchError || !match) return { error: 'Match not found.' };
  if (match.status !== 'mutual') return { error: 'You can only schedule a session for a mutual match.' };
  if (match.profile_a_id !== user.id && match.profile_b_id !== user.id) return { error: 'Not your match.' };

  const { error } = await supabase.from('scheduled_sessions').insert({
    match_id: match.id,
    profile_a_id: match.profile_a_id,
    profile_b_id: match.profile_b_id,
    activity_type: parsed.data.activity_type,
    venue_name: parsed.data.venue_name,
    venue_address: parsed.data.venue_address,
    scheduled_at: new Date(parsed.data.scheduled_at).toISOString(),
    duration_minutes: parsed.data.duration_minutes,
    status: 'proposed',
  });

  if (error) return { error: error.message };

  revalidatePath('/dashboard/sessions');
  redirect('/dashboard/sessions');
}

export async function updateSessionStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const sessionId = String(formData.get('session_id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!sessionId || !['confirmed', 'completed', 'cancelled'].includes(status)) {
    return { error: 'Invalid status.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('scheduled_sessions').update({ status }).eq('id', sessionId);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/sessions');
  revalidatePath(`/dashboard/sessions/${sessionId}`);
  return { error: null };
}

export async function submitCheckin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireUser();
  const sessionId = String(formData.get('session_id') ?? '');
  const outcome = String(formData.get('outcome') ?? '') as CheckinOutcome;
  if (!sessionId || !['train_again', 'date', 'pass'].includes(outcome)) {
    return { error: 'Invalid check-in.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('session_checkins').insert({
    session_id: sessionId,
    profile_id: user.id,
    outcome,
  });
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  return { error: null };
}
