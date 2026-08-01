import { requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { Profile, VerificationRequest } from '@/lib/types/domain';
import { ReviewButtons } from './VerificationQueueActions';

export default async function AdminVerificationPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: requestRows } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  const requests = (requestRows ?? []) as VerificationRequest[];

  const profileIds = requests.map((r) => r.profile_id);
  const { data: profileRows } = profileIds.length
    ? await supabase.from('profiles').select('*').in('id', profileIds)
    : { data: [] as Profile[] };
  const profilesById = new Map(((profileRows ?? []) as Profile[]).map((p) => [p.id, p]));

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Verification queue</h1>
          <p>{requests.length} pending.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">Nothing to review.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requested</th>
                <th>Member</th>
                <th>Consistency</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const profile = profilesById.get(r.profile_id);
                return (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>{profile?.display_name || 'Zone2 member'}</td>
                    <td>{profile?.consistency_score ?? '—'}</td>
                    <td>
                      <ReviewButtons requestId={r.id} profileId={r.profile_id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
