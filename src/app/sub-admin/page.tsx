import { redirect } from 'next/navigation';
import { requireSubAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';

export default async function SubAdminOverviewPage() {
  const { profile } = await requireSubAdmin();
  if (!profile.club_id) redirect('/sub-admin/pending');

  const supabase = await createClient();
  const [{ count: memberCount }, { count: eventCount }, { data: club }] = await Promise.all([
    supabase.from('club_members').select('*', { count: 'exact', head: true }).eq('club_id', profile.club_id),
    supabase.from('club_events').select('*', { count: 'exact', head: true }).eq('club_id', profile.club_id),
    supabase.from('clubs').select('*').eq('id', profile.club_id).single(),
  ]);

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>{club?.name ?? 'Your club'}</h1>
          <p>{club?.city}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Members</h3>
          <div className="metric">{memberCount ?? 0}</div>
        </div>
        <div className="panel">
          <h3>Events</h3>
          <div className="metric">{eventCount ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
