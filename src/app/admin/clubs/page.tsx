import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { Club } from '@/lib/types/domain';

export default async function AdminClubsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from('clubs').select('*').order('name');
  const clubs = (data ?? []) as Club[];

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Clubs</h1>
          <p>Partner gyms, run clubs, and studios.</p>
        </div>
        <Link className="btn btn-red btn-sm" href="/admin/clubs/new">
          New club
        </Link>
      </div>

      {clubs.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">No clubs yet.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Slug</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.city || '—'}</td>
                  <td>{c.slug}</td>
                  <td>
                    <Link className="btn btn-outline btn-sm" href={`/admin/clubs/${c.id}`}>
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
