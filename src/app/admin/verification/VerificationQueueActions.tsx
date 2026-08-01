'use client';

import { useActionState } from 'react';
import { reviewVerificationRequest, type ActionState } from '../actions';

const initialState: ActionState = { error: null };

export function ReviewButtons({ requestId, profileId }: { requestId: string; profileId: string }) {
  const [state, formAction, pending] = useActionState(reviewVerificationRequest, initialState);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <form action={formAction}>
          <input type="hidden" name="request_id" value={requestId} />
          <input type="hidden" name="profile_id" value={profileId} />
          <button className="btn btn-red btn-sm" name="decision" value="approved" type="submit" disabled={pending}>
            Approve
          </button>
        </form>
        <form action={formAction}>
          <input type="hidden" name="request_id" value={requestId} />
          <input type="hidden" name="profile_id" value={profileId} />
          <button className="btn btn-outline btn-sm" name="decision" value="rejected" type="submit" disabled={pending}>
            Reject
          </button>
        </form>
      </div>
      {state.error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{state.error}</div>}
    </div>
  );
}
