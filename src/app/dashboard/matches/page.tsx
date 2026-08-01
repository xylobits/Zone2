import { requireUser } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { Match, ProfilePublic } from '@/lib/types/domain';
import { CreateMatchButton, RespondButtons } from './MatchActions';

export default async function MatchesPage() {
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: matchRows } = await supabase
    .from('matches')
    .select('*')
    .or(`profile_a_id.eq.${user.id},profile_b_id.eq.${user.id}`)
    .order('created_at', { ascending: false });
  const matches = (matchRows ?? []) as Match[];

  const matchedIds = new Set<string>([user.id]);
  matches.forEach((m) => {
    matchedIds.add(m.profile_a_id);
    matchedIds.add(m.profile_b_id);
  });

  const { data: candidateRows } = await supabase
    .from('profiles_public')
    .select('*')
    .order('consistency_score', { ascending: false })
    .limit(30);
  const candidates = ((candidateRows ?? []) as ProfilePublic[]).filter((c) => !matchedIds.has(c.id));

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Matches</h1>
          <p>Compatibility is computed from activity overlap and consistency parity.</p>
        </div>
      </div>

      {profile.verified_tier === 'unverified' && (
        <div className="banner banner-warn">Get verified to start matching with confidence.</div>
      )}

      <div className="section-title">Your matches</div>
      {matches.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">No matches yet — browse candidates below.</div>
        </div>
      ) : (
        <div className="table-wrap" style={{ marginBottom: 8 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Score</th>
                <th>Status</th>
                <th>Started</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => {
                const canRespond = m.status === 'pending' && m.initiated_by !== user.id;
                return (
                  <tr key={m.id}>
                    <td>{m.compatibility_score}</td>
                    <td>
                      <span
                        className={`badge ${m.status === 'mutual' ? 'badge-green' : m.status === 'declined' ? 'badge-mute' : 'badge-red'}`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td>{new Date(m.created_at).toLocaleDateString()}</td>
                    <td>
                      {canRespond ? (
                        <RespondButtons matchId={m.id} />
                      ) : m.status === 'mutual' ? (
                        <a className="btn btn-outline btn-sm" href={`/dashboard/sessions/new?match=${m.id}`}>
                          Schedule session
                        </a>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="section-title">Browse candidates</div>
      {candidates.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">No new candidates right now.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Consistency</th>
                <th>Activities</th>
                <th>Intent</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id}>
                  <td>{c.display_name || 'Zone2 member'}</td>
                  <td>{c.consistency_score}</td>
                  <td>{c.primary_activities.join(', ') || '—'}</td>
                  <td>{c.intent.replace('_', ' ')}</td>
                  <td>
                    <CreateMatchButton targetProfileId={c.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
