import Link from 'next/link';
import { requireUser } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { Workout } from '@/lib/types/domain';

export default async function WorkoutsPage() {
  const { user } = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from('workouts')
    .select('*')
    .eq('profile_id', user.id)
    .order('started_at', { ascending: false })
    .limit(50);
  const workouts = (data ?? []) as Workout[];

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Workouts</h1>
          <p>Logged sessions feed your 90-day consistency score.</p>
        </div>
        <Link className="btn btn-red btn-sm" href="/dashboard/workouts/new">
          Log a workout
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">No workouts logged yet.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Duration</th>
                <th>Source</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((w) => (
                <tr key={w.id}>
                  <td>{new Date(w.started_at).toLocaleDateString()}</td>
                  <td>{w.activity_type}</td>
                  <td>{w.duration_minutes} min</td>
                  <td>
                    <span className="badge">{w.source}</span>
                  </td>
                  <td>{w.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
