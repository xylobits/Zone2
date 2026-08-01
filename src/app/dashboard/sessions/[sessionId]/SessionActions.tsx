'use client';

import { useActionState } from 'react';
import { updateSessionStatus, submitCheckin, type ActionState } from '../../actions';
import type { SessionOutcomeStatus, SessionStatus } from '@/lib/types/domain';

const initialState: ActionState = { error: null };

export function StatusButtons({ sessionId, status }: { sessionId: string; status: SessionStatus }) {
  const [state, formAction, pending] = useActionState(updateSessionStatus, initialState);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        {status === 'proposed' && (
          <form action={formAction}>
            <input type="hidden" name="session_id" value={sessionId} />
            <input type="hidden" name="status" value="confirmed" />
            <button className="btn btn-red btn-sm" type="submit" disabled={pending}>
              Confirm
            </button>
          </form>
        )}
        <form action={formAction}>
          <input type="hidden" name="session_id" value={sessionId} />
          <input type="hidden" name="status" value="completed" />
          <button className="btn btn-outline btn-sm" type="submit" disabled={pending}>
            Mark completed
          </button>
        </form>
        <form action={formAction}>
          <input type="hidden" name="session_id" value={sessionId} />
          <input type="hidden" name="status" value="cancelled" />
          <button className="btn btn-outline btn-sm" type="submit" disabled={pending}>
            Cancel
          </button>
        </form>
      </div>
      {state.error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>{state.error}</div>}
    </div>
  );
}

const OUTCOME_COPY: Record<SessionOutcomeStatus, string> = {
  awaiting_you: 'How did it go?',
  waiting: 'Submitted — waiting on your partner to check in too.',
  mutual_date: 'You both said "date" — the romantic lane just unlocked.',
  no_match: 'Check-in complete.',
};

export function CheckinForm({
  sessionId,
  outcomeStatus,
}: {
  sessionId: string;
  outcomeStatus: SessionOutcomeStatus;
}) {
  const [state, formAction, pending] = useActionState(submitCheckin, initialState);

  if (outcomeStatus !== 'awaiting_you') {
    return <div className="panel" style={{ maxWidth: 420 }}>{OUTCOME_COPY[outcomeStatus]}</div>;
  }

  return (
    <div className="panel" style={{ maxWidth: 420 }}>
      <p style={{ marginBottom: 12 }}>{OUTCOME_COPY.awaiting_you}</p>
      <form action={formAction} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input type="hidden" name="session_id" value={sessionId} />
        <button className="btn btn-outline btn-sm" name="outcome" value="train_again" type="submit" disabled={pending}>
          Train again
        </button>
        <button className="btn btn-outline btn-sm" name="outcome" value="date" type="submit" disabled={pending}>
          Date
        </button>
        <button className="btn btn-outline btn-sm" name="outcome" value="pass" type="submit" disabled={pending}>
          Pass
        </button>
      </form>
      {state.error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>{state.error}</div>}
    </div>
  );
}
