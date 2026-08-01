import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/domain';

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
  const users = (data ?? []) as Profile[];

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Users</h1>
          <p>{users.length} accounts.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Consistency</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.display_name || '—'}</td>
                <td>
                  <span className={`badge ${u.role !== 'user' ? 'badge-red' : 'badge-mute'}`}>{u.role}</span>
                </td>
                <td>
                  <span className={`badge ${u.verified_tier === 'verified' ? 'badge-green' : 'badge-mute'}`}>
                    {u.verified_tier}
                  </span>
                </td>
                <td>{u.consistency_score}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <Link className="btn btn-outline btn-sm" href={`/admin/users/${u.id}`}>
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
