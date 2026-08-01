import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { Club, Profile } from '@/lib/types/domain';
import { RoleForm, ForceVerifyForm } from './UserActions';

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: userRow }, { data: clubRows }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('clubs').select('*').order('name'),
  ]);
  if (!userRow) notFound();
  const user = userRow as Profile;
  const clubs = (clubRows ?? []) as Club[];

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>{user.display_name || 'Zone2 member'}</h1>
          <p>Joined {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Role</h3>
          <div className="metric" style={{ fontSize: 20, marginTop: 8 }}>
            {user.role}
          </div>
        </div>
        <div className="panel">
          <h3>Verified</h3>
          <div className="metric" style={{ fontSize: 20, marginTop: 8 }}>
            {user.verified_tier}
          </div>
        </div>
        <div className="panel">
          <h3>Consistency</h3>
          <div className="metric">{user.consistency_score}</div>
        </div>
      </div>

      <div className="section-title">Change role</div>
      <div className="form-card">
        <RoleForm userId={user.id} currentRole={user.role} currentClubId={user.club_id} clubs={clubs} />
      </div>

      <div className="section-title">Verification</div>
      <div className="form-card">
        <ForceVerifyForm userId={user.id} currentTier={user.verified_tier} />
      </div>
    </div>
  );
}
