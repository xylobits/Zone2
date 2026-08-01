'use client';

import { useActionState } from 'react';
import { createMatch, respondToMatch, type ActionState } from '../actions';

const initialState: ActionState = { error: null };

export function CreateMatchButton({ targetProfileId }: { targetProfileId: string }) {
  const [state, formAction, pending] = useActionState(createMatch, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="target_profile_id" value={targetProfileId} />
      <button className="btn btn-red btn-sm" type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Match'}
      </button>
      {state.error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{state.error}</div>}
    </form>
  );
}

export function RespondButtons({ matchId }: { matchId: string }) {
  const [acceptState, acceptAction, acceptPending] = useActionState(respondToMatch, initialState);
  const [declineState, declineAction, declinePending] = useActionState(respondToMatch, initialState);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <form action={acceptAction}>
        <input type="hidden" name="match_id" value={matchId} />
        <input type="hidden" name="decision" value="mutual" />
        <button className="btn btn-red btn-sm" type="submit" disabled={acceptPending}>
          Accept
        </button>
      </form>
      <form action={declineAction}>
        <input type="hidden" name="match_id" value={matchId} />
        <input type="hidden" name="decision" value="declined" />
        <button className="btn btn-outline btn-sm" type="submit" disabled={declinePending}>
          Decline
        </button>
      </form>
      {(acceptState.error || declineState.error) && (
        <div style={{ color: 'var(--red)', fontSize: 12 }}>{acceptState.error || declineState.error}</div>
      )}
    </div>
  );
}
