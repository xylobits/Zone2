'use client';

import { useActionState } from 'react';
import { requestVerification, type ActionState } from '../actions';

const initialState: ActionState = { error: null };

export function RequestVerificationButton({ disabled }: { disabled: boolean }) {
  const [state, formAction, pending] = useActionState(requestVerification, initialState);

  return (
    <form action={formAction} style={{ marginTop: 12 }}>
      <button className="btn btn-red btn-sm" type="submit" disabled={pending || disabled}>
        {disabled ? 'Request pending' : pending ? 'Submitting…' : 'Request verification'}
      </button>
      {state.error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>{state.error}</div>}
    </form>
  );
}
