import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import { isPastDate } from '@/lib/time';
import type { ScheduledSession, SessionOutcomeStatus } from '@/lib/types/domain';
import { StatusButtons, CheckinForm } from './SessionActions';

export default async function SessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  await requireUser();
  const supabase = await createClient();

  const { data: sessionRow } = await supabase.from('scheduled_sessions').select('*').eq('id', sessionId).single();
  if (!sessionRow) notFound();
  const session = sessionRow as ScheduledSession;

  const { data: outcomeStatus } = await supabase.rpc('get_session_outcome_status', { p_session_id: sessionId });

  const isPast = isPastDate(session.scheduled_at);

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>{session.activity_type} session</h1>
          <p>{new Date(session.scheduled_at).toLocaleString()}</p>
        </div>
        <span
          className={`badge ${session.status === 'completed' ? 'badge-green' : session.status === 'cancelled' ? 'badge-mute' : 'badge-red'}`}
        >
          {session.status}
        </span>
      </div>

      <div className="panel" style={{ maxWidth: 560, marginBottom: 24 }}>
        <h3>{session.venue_name}</h3>
        <p style={{ marginTop: 6, color: 'var(--mute)' }}>{session.venue_address}</p>
        <p style={{ marginTop: 6, color: 'var(--mute)' }}>{session.duration_minutes} minutes</p>
        {session.romantic_unlocked && (
          <p style={{ marginTop: 12 }}>
            <span className="badge badge-red">Mutual date match</span>
          </p>
        )}
      </div>

      {session.status !== 'cancelled' && session.status !== 'completed' && (
        <>
          <div className="section-title">Status</div>
          <StatusButtons sessionId={session.id} status={session.status} />
        </>
      )}

      {isPast && session.status !== 'cancelled' && (
        <>
          <div className="section-title">Post-session check-in</div>
          <CheckinForm sessionId={session.id} outcomeStatus={(outcomeStatus as SessionOutcomeStatus) ?? 'awaiting_you'} />
        </>
      )}
    </div>
  );
}
