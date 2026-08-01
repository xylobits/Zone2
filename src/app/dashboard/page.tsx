import Link from 'next/link';
import { requireUser } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { Match, ScheduledSession } from '@/lib/types/domain';

export default async function DashboardOverviewPage() {
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const [{ data: pendingMatches }, { data: nextSessions }] = await Promise.all([
    supabase
      .from('matches')
      .select('*')
      .eq('status', 'pending')
      .neq('initiated_by', user.id)
      .or(`profile_a_id.eq.${user.id},profile_b_id.eq.${user.id}`),
    supabase
      .from('scheduled_sessions')
      .select('*')
      .or(`profile_a_id.eq.${user.id},profile_b_id.eq.${user.id}`)
      .in('status', ['proposed', 'confirmed'])
      .order('scheduled_at', { ascending: true })
      .limit(1),
  ]);

  const invites = (pendingMatches ?? []) as Match[];
  const nextSession = ((nextSessions ?? []) as ScheduledSession[])[0];

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Welcome back{profile.display_name ? `, ${profile.display_name}` : ''}</h1>
          <p>Here&apos;s where things stand.</p>
        </div>
      </div>

      {profile.verified_tier === 'unverified' && (
        <div className="banner banner-warn">
          Your profile is unverified. <Link href="/dashboard/verification">Request verification</Link> to unlock
          matching.
        </div>
      )}

      <div className="panel-grid">
        <div className="panel">
          <h3>Consistency score</h3>
          <div className="metric">{profile.consistency_score}</div>
          <div className="metric-label">Trailing 90 days</div>
        </div>
        <div className="panel">
          <h3>Intent</h3>
          <div className="metric" style={{ fontSize: 20, marginTop: 12 }}>
            {profile.intent === 'training_partner'
              ? 'Training partner'
              : profile.intent === 'dating'
                ? 'Dating'
                : 'Open'}
          </div>
        </div>
        <div className="panel">
          <h3>Pending invites</h3>
          <div className="metric">{invites.length}</div>
          <div className="metric-label">
            <Link href="/dashboard/matches">Review matches →</Link>
          </div>
        </div>
        <div className="panel">
          <h3>Next session</h3>
          {nextSession ? (
            <>
              <div className="metric" style={{ fontSize: 20, marginTop: 12 }}>
                {new Date(nextSession.scheduled_at).toLocaleString()}
              </div>
              <div className="metric-label">{nextSession.venue_name}</div>
            </>
          ) : (
            <div className="metric-label" style={{ marginTop: 12 }}>
              Nothing scheduled yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
