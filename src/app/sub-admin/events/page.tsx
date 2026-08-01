import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSubAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { ClubEvent } from '@/lib/types/domain';

export default async function EventsPage() {
  const { profile } = await requireSubAdmin();
  if (!profile.club_id) redirect('/sub-admin/pending');

  const supabase = await createClient();
  const { data } = await supabase
    .from('club_events')
    .select('*')
    .eq('club_id', profile.club_id)
    .order('starts_at', { ascending: false });
  const events = (data ?? []) as ClubEvent[];

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Events</h1>
          <p>Group sessions for your club.</p>
        </div>
        <Link className="btn btn-red btn-sm" href="/sub-admin/events/new">
          New event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">No events yet.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>When</th>
                <th>Activity</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td>{new Date(e.starts_at).toLocaleString()}</td>
                  <td>{e.activity_type || '—'}</td>
                  <td>
                    <Link className="btn btn-outline btn-sm" href={`/sub-admin/events/${e.id}`}>
                      Manage
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
