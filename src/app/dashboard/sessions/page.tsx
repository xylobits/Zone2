import Link from 'next/link';
import { requireUser } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { ScheduledSession } from '@/lib/types/domain';

export default async function SessionsPage() {
  const { user } = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from('scheduled_sessions')
    .select('*')
    .or(`profile_a_id.eq.${user.id},profile_b_id.eq.${user.id}`)
    .order('scheduled_at', { ascending: false });
  const sessions = (data ?? []) as ScheduledSession[];

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Sessions</h1>
          <p>Structured first meets — public venues, in daylight.</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            No sessions yet. Schedule one from a mutual match on the{' '}
            <Link href="/dashboard/matches">Matches</Link> page.
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Activity</th>
                <th>Venue</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.scheduled_at).toLocaleString()}</td>
                  <td>{s.activity_type}</td>
                  <td>{s.venue_name}</td>
                  <td>
                    <span
                      className={`badge ${s.status === 'completed' ? 'badge-green' : s.status === 'cancelled' ? 'badge-mute' : 'badge-red'}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <Link className="btn btn-outline btn-sm" href={`/dashboard/sessions/${s.id}`}>
                      Details
                    </Link>
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
