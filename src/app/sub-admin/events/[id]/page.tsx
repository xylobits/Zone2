import { notFound, redirect } from 'next/navigation';
import { requireSubAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import type { ClubEvent, ClubEventAttendance, ClubMember, Profile } from '@/lib/types/domain';
import { AttendanceButtons } from './EventActions';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { profile } = await requireSubAdmin();
  if (!profile.club_id) redirect('/sub-admin/pending');
  const { id } = await params;
  const supabase = await createClient();

  const { data: eventRow } = await supabase.from('club_events').select('*').eq('id', id).single();
  if (!eventRow) notFound();
  const event = eventRow as ClubEvent;
  if (event.club_id !== profile.club_id) notFound();

  const [{ data: memberRows }, { data: attendanceRows }] = await Promise.all([
    supabase.from('club_members').select('*').eq('club_id', profile.club_id),
    supabase.from('club_event_attendance').select('*').eq('event_id', id),
  ]);
  const members = (memberRows ?? []) as ClubMember[];
  const attendance = (attendanceRows ?? []) as ClubEventAttendance[];
  const attendanceByProfile = new Map(attendance.map((a) => [a.profile_id, a]));

  const profileIds = members.map((m) => m.profile_id);
  const { data: profileRows } = profileIds.length
    ? await supabase.from('profiles').select('*').in('id', profileIds)
    : { data: [] as Profile[] };
  const profilesById = new Map(((profileRows ?? []) as Profile[]).map((p) => [p.id, p]));

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>{event.title}</h1>
          <p>
            {new Date(event.starts_at).toLocaleString()} · {event.location_text || 'No location set'}
          </p>
        </div>
      </div>

      <div className="section-title">Attendance</div>
      {members.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">No roster members to mark attendance for yet.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const p = profilesById.get(m.profile_id);
                const record = attendanceByProfile.get(m.profile_id);
                return (
                  <tr key={m.id}>
                    <td>{p?.display_name || 'Zone2 member'}</td>
                    <td>
                      <span
                        className={`badge ${record?.status === 'attended' ? 'badge-green' : record?.status === 'no_show' ? 'badge-red' : 'badge-mute'}`}
                      >
                        {record?.status ?? 'not marked'}
                      </span>
                    </td>
                    <td>
                      <AttendanceButtons eventId={event.id} profileId={m.profile_id} />
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
