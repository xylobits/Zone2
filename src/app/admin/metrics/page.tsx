import { requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { Club, Match, ScheduledSession } from '@/lib/types/domain';

export default async function AdminMetricsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: matchRows }, { data: sessionRows }, { data: clubRows }, { count: verifiedCount }, { count: userCount }] =
    await Promise.all([
      supabase.from('matches').select('*'),
      supabase.from('scheduled_sessions').select('*'),
      supabase.from('clubs').select('*'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verified_tier', 'verified'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]);

  const matches = (matchRows ?? []) as Match[];
  const sessions = (sessionRows ?? []) as ScheduledSession[];
  const clubs = (clubRows ?? []) as Club[];

  const mutualMatches = matches.filter((m) => m.status === 'mutual');
  const matchesWithSession = new Set(sessions.map((s) => s.match_id));
  const firstMeetConversion = mutualMatches.length
    ? Math.round((mutualMatches.filter((m) => matchesWithSession.has(m.id)).length / mutualMatches.length) * 100)
    : 0;

  const completedByMatch = new Map<string, number>();
  sessions
    .filter((s) => s.status === 'completed')
    .forEach((s) => completedByMatch.set(s.match_id, (completedByMatch.get(s.match_id) ?? 0) + 1));
  const pairsWithSecondSession = [...completedByMatch.values()].filter((count) => count >= 2).length;

  const clubsByCity = new Map<string, number>();
  clubs.forEach((c) => {
    const city = c.city || 'Unspecified';
    clubsByCity.set(city, (clubsByCity.get(city) ?? 0) + 1);
  });

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Metrics</h1>
          <p>Engagement (swipes, session length) is deliberately not tracked as success.</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>North star</h3>
          <div className="metric">{pairsWithSecondSession}</div>
          <div className="metric-label">pairs with a 2nd completed session</div>
        </div>
        <div className="panel">
          <h3>Verified-profile rate</h3>
          <div className="metric">{userCount ? Math.round(((verifiedCount ?? 0) / userCount) * 100) : 0}%</div>
          <div className="metric-label">target &gt;70%</div>
        </div>
        <div className="panel">
          <h3>First-meet conversion</h3>
          <div className="metric">{firstMeetConversion}%</div>
          <div className="metric-label">mutual match → scheduled session</div>
        </div>
        <div className="panel">
          <h3>Mutual matches</h3>
          <div className="metric">{mutualMatches.length}</div>
        </div>
      </div>

      <div className="section-title">Club density by city</div>
      {clubsByCity.size === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">No clubs yet.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Clubs</th>
              </tr>
            </thead>
            <tbody>
              {[...clubsByCity.entries()].map(([city, count]) => (
                <tr key={city}>
                  <td>{city}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
