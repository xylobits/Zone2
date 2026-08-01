'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/roles';

export interface ActionState {
  error: string | null;
}

export async function setUserRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const userId = String(formData.get('user_id') ?? '');
  const role = String(formData.get('role') ?? '');
  const clubId = String(formData.get('club_id') ?? '') || null;

  if (!userId || !['user', 'sub_admin', 'admin'].includes(role)) {
    return { error: 'Invalid role change.' };
  }
  if (role === 'sub_admin' && !clubId) {
    return { error: 'Pick a club for a sub-admin.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ role, club_id: role === 'sub_admin' ? clubId : null })
    .eq('id', userId);
  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { error: null };
}

export async function forceVerify(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const userId = String(formData.get('user_id') ?? '');
  const tier = String(formData.get('tier') ?? 'verified');
  if (!userId) return { error: 'Missing user.' };

  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ verified_tier: tier }).eq('id', userId);
  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { error: null };
}

export async function reviewVerificationRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireAdmin();
  const requestId = String(formData.get('request_id') ?? '');
  const decision = String(formData.get('decision') ?? '');
  const profileId = String(formData.get('profile_id') ?? '');

  if (!requestId || (decision !== 'approved' && decision !== 'rejected')) {
    return { error: 'Invalid review.' };
  }

  const supabase = await createClient();
  const { error: reqError } = await supabase
    .from('verification_requests')
    .update({ status: decision, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq('id', requestId);
  if (reqError) return { error: reqError.message };

  if (decision === 'approved' && profileId) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ verified_tier: 'verified' })
      .eq('id', profileId);
    if (profileError) return { error: profileError.message };
  }

  revalidatePath('/admin/verification');
  return { error: null };
}

const clubSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and dashes only'),
  city: z.string().trim().max(80).optional(),
  description: z.string().trim().max(500).optional(),
});

export async function createClub(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireAdmin();
  const parsed = clubSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    city: formData.get('city') ?? undefined,
    description: formData.get('description') ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid club.' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clubs')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      city: parsed.data.city || null,
      description: parsed.data.description || null,
      created_by: user.id,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };

  revalidatePath('/admin/clubs');
  redirect(`/admin/clubs/${data.id}`);
}

export async function updateClub(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const clubId = String(formData.get('club_id') ?? '');
  const parsed = clubSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    city: formData.get('city') ?? undefined,
    description: formData.get('description') ?? undefined,
  });
  if (!clubId) return { error: 'Missing club.' };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid club.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('clubs')
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      city: parsed.data.city || null,
      description: parsed.data.description || null,
    })
    .eq('id', clubId);
  if (error) return { error: error.message };

  revalidatePath('/admin/clubs');
  revalidatePath(`/admin/clubs/${clubId}`);
  return { error: null };
}
