import { redirect } from 'next/navigation';
import { requireSubAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { ClubMember, Profile } from '@/lib/types/domain';
import { RemoveMemberButton } from './RosterActions';

export default async function RosterPage() {
  const { profile } = await requireSubAdmin();
  if (!profile.club_id) redirect('/sub-admin/pending');

  const supabase = await createClient();
  const { data: memberRows } = await supabase
    .from('club_members')
    .select('*')
    .eq('club_id', profile.club_id)
    .order('joined_at', { ascending: false });
  const members = (memberRows ?? []) as ClubMember[];

  const profileIds = members.map((m) => m.profile_id);
  const { data: profileRows } = profileIds.length
    ? await supabase.from('profiles').select('*').in('id', profileIds)
    : { data: [] as Profile[] };
  const profilesById = new Map(((profileRows ?? []) as Profile[]).map((p) => [p.id, p]));

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Roster</h1>
          <p>{members.length} members in your club.</p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">No members yet.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Consistency</th>
                <th>Visible to club</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const p = profilesById.get(m.profile_id);
                return (
                  <tr key={m.id}>
                    <td>{p?.display_name || 'Zone2 member'}</td>
                    <td>{p?.consistency_score ?? '—'}</td>
                    <td>
                      <span className={`badge ${m.visible_to_club ? 'badge-green' : 'badge-mute'}`}>
                        {m.visible_to_club ? 'visible' : 'hidden'}
                      </span>
                    </td>
                    <td>{new Date(m.joined_at).toLocaleDateString()}</td>
                    <td>
                      <RemoveMemberButton memberId={m.id} />
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
