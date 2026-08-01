import { requireUser } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { VerificationRequest } from '@/lib/types/domain';
import { RequestVerificationButton } from './VerificationActions';

export default async function VerificationPage() {
  const { user, profile } = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });
  const requests = (data ?? []) as VerificationRequest[];
  const hasPending = requests.some((r) => r.status === 'pending');

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Verification</h1>
          <p>Verified profiles rank higher and unlock matching.</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 480, marginBottom: 24 }}>
        <h3>Current status</h3>
        <p style={{ marginTop: 8 }}>
          <span className={`badge ${profile.verified_tier === 'verified' ? 'badge-green' : 'badge-mute'}`}>
            {profile.verified_tier}
          </span>
        </p>
        {profile.verified_tier !== 'verified' && <RequestVerificationButton disabled={hasPending} />}
      </div>

      <div className="section-title">History</div>
      {requests.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">No verification requests yet.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requested</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`badge ${r.status === 'approved' ? 'badge-green' : r.status === 'rejected' ? 'badge-red' : 'badge-mute'}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
