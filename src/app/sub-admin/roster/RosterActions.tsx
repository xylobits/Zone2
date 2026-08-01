'use client';

import { useActionState } from 'react';
import { removeMember, type ActionState } from '../actions';

const initialState: ActionState = { error: null };

export function RemoveMemberButton({ memberId }: { memberId: string }) {
  const [state, formAction, pending] = useActionState(removeMember, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="member_id" value={memberId} />
      <button className="btn btn-outline btn-sm" type="submit" disabled={pending}>
        {pending ? 'Removing…' : 'Remove'}
      </button>
      {state.error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{state.error}</div>}
    </form>
  );
}
