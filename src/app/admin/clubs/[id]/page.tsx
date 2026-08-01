import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { Club, ClubMember, Profile } from '@/lib/types/domain';
import { ClubForm } from '../ClubForm';

export default async function AdminClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: clubRow }, { data: memberRows }, { data: subAdminRows }] = await Promise.all([
    supabase.from('clubs').select('*').eq('id', id).single(),
    supabase.from('club_members').select('*').eq('club_id', id),
    supabase.from('profiles').select('*').eq('club_id', id).eq('role', 'sub_admin'),
  ]);
  if (!clubRow) notFound();
  const club = clubRow as Club;
  const members = (memberRows ?? []) as ClubMember[];
  const subAdmins = (subAdminRows ?? []) as Profile[];

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>{club.name}</h1>
          <p>{members.length} members</p>
        </div>
      </div>

      <div className="section-title">Sub-admins</div>
      {subAdmins.length === 0 ? (
        <div className="table-wrap" style={{ marginBottom: 8 }}>
          <div className="empty-state">
            No sub-admin assigned. Promote a member to <code>sub_admin</code> from the Users page.
          </div>
        </div>
      ) : (
        <div className="table-wrap" style={{ marginBottom: 8 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {subAdmins.map((s) => (
                <tr key={s.id}>
                  <td>{s.display_name || s.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="section-title">Club details</div>
      <ClubForm club={club} />
    </div>
  );
}
