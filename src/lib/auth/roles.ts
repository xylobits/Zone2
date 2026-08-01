import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/domain';

export interface CurrentActor {
  user: User;
  profile: Profile;
}

/** Data Access Layer entry point: the one place session + profile get read together.
 * Wrapped in React's `cache()` so layout + page both calling this within one request
 * only hits Supabase once. */
export const getCurrentActor = cache(async (): Promise<CurrentActor | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) return null;

  return { user, profile: profile as Profile };
});

/** Redirects to /login if not authenticated. Re-verify in every Server Action too — a
 * page-level check does not extend to actions defined within it. */
export async function requireUser(): Promise<CurrentActor> {
  const actor = await getCurrentActor();
  if (!actor) redirect('/login');
  return actor;
}

export async function requireAdmin(): Promise<CurrentActor> {
  const actor = await requireUser();
  if (actor.profile.role !== 'admin') redirect('/dashboard');
  return actor;
}

export async function requireSubAdmin(): Promise<CurrentActor> {
  const actor = await requireUser();
  if (actor.profile.role !== 'sub_admin') redirect('/dashboard');
  return actor;
}
