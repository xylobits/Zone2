'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireSubAdmin } from '@/lib/auth/roles';
import { ACTIVITY_TYPES } from '@/lib/types/domain';

export interface ActionState {
  error: string | null;
}

export async function removeMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireSubAdmin();
  const memberId = String(formData.get('member_id') ?? '');
  if (!memberId) return { error: 'Missing member.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('id', memberId)
    .eq('club_id', profile.club_id as string);
  if (error) return { error: error.message };

  revalidatePath('/sub-admin/roster');
  return { error: null };
}

const eventSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: z.string().trim().max(500).optional(),
  activity_type: z.enum(ACTIVITY_TYPES as [string, ...string[]]).optional(),
  starts_at: z.string().min(1, 'Date/time is required'),
  location_text: z.string().trim().max(200).optional(),
});

export async function createEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, profile } = await requireSubAdmin();
  if (!profile.club_id) return { error: 'You are not assigned to a club yet.' };

  const parsed = eventSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') ?? undefined,
    activity_type: formData.get('activity_type') || undefined,
    starts_at: formData.get('starts_at'),
    location_text: formData.get('location_text') ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid event.' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('club_events')
    .insert({
      club_id: profile.club_id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      activity_type: parsed.data.activity_type || null,
      starts_at: new Date(parsed.data.starts_at).toISOString(),
      location_text: parsed.data.location_text || null,
      created_by: user.id,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };

  revalidatePath('/sub-admin/events');
  redirect(`/sub-admin/events/${data.id}`);
}

export async function markAttendance(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireSubAdmin();
  const eventId = String(formData.get('event_id') ?? '');
  const profileId = String(formData.get('profile_id') ?? '');
  const status = String(formData.get('status') ?? 'attended');
  if (!eventId || !profileId) return { error: 'Missing attendee.' };

  const supabase = await createClient();
  const { error } = await supabase.from('club_event_attendance').upsert(
    {
      event_id: eventId,
      profile_id: profileId,
      status,
      checked_in_at: status === 'attended' ? new Date().toISOString() : null,
    },
    { onConflict: 'event_id,profile_id' },
  );
  if (error) return { error: error.message };

  revalidatePath(`/sub-admin/events/${eventId}`);
  return { error: null };
}
