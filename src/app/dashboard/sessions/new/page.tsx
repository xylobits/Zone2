import { requireUser } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { Match } from '@/lib/types/domain';
import { SessionForm } from './SessionForm';

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ match?: string }>;
}) {
  const { user } = await requireUser();
  const { match } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'mutual')
    .or(`profile_a_id.eq.${user.id},profile_b_id.eq.${user.id}`);
  const mutualMatches = (data ?? []) as Match[];

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Schedule a session</h1>
          <p>Public venue, daylight, in-app scheduling — this is the first date.</p>
        </div>
      </div>

      {mutualMatches.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">You need a mutual match before scheduling a session.</div>
        </div>
      ) : (
        <SessionForm matches={mutualMatches} defaultMatchId={match} />
      )}
    </div>
  );
}
