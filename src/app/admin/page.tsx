import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';

export default async function AdminOverviewPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ count: userCount }, { count: verifiedCount }, { count: pendingVerification }, { count: clubCount }, { count: sessionCount }] =
    await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verified_tier', 'verified'),
      supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('clubs').select('*', { count: 'exact', head: true }),
      supabase.from('scheduled_sessions').select('*', { count: 'exact', head: true }),
    ]);

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Admin overview</h1>
          <p>Platform-wide numbers.</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Total users</h3>
          <div className="metric">{userCount ?? 0}</div>
        </div>
        <div className="panel">
          <h3>Verified rate</h3>
          <div className="metric">
            {userCount ? Math.round(((verifiedCount ?? 0) / userCount) * 100) : 0}%
          </div>
        </div>
        <div className="panel">
          <h3>Pending verification</h3>
          <div className="metric">{pendingVerification ?? 0}</div>
          <div className="metric-label">
            <Link href="/admin/verification">Review queue →</Link>
          </div>
        </div>
        <div className="panel">
          <h3>Clubs</h3>
          <div className="metric">{clubCount ?? 0}</div>
        </div>
        <div className="panel">
          <h3>Scheduled sessions</h3>
          <div className="metric">{sessionCount ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
