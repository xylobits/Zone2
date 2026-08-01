'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { addWorkout, type ActionState } from '../../actions';
import { ACTIVITY_TYPES } from '@/lib/types/domain';

const initialState: ActionState = { error: null };

function nowLocalInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function WorkoutForm() {
  const [state, formAction, pending] = useActionState(addWorkout, initialState);
  const router = useRouter();

  return (
    <form action={formAction} className="form-card">
      {state.error && (
        <p className="auth-error" style={{ marginBottom: 16 }}>
          {state.error}
        </p>
      )}

      <div className="field-row">
        <div className="field">
          <label htmlFor="activity_type">Activity</label>
          <select className="input" id="activity_type" name="activity_type" defaultValue="running">
            {ACTIVITY_TYPES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="duration_minutes">Duration (min)</label>
          <input className="input" id="duration_minutes" name="duration_minutes" type="number" min={1} max={1000} defaultValue={45} required />
        </div>
      </div>

      <div className="field">
        <label htmlFor="started_at">When</label>
        <input className="input" id="started_at" name="started_at" type="datetime-local" defaultValue={nowLocalInput()} required />
      </div>

      <div className="field">
        <label htmlFor="notes">Notes</label>
        <textarea className="textarea" id="notes" name="notes" maxLength={500} />
      </div>

      <div className="form-actions">
        <button className="btn btn-red" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Log workout'}
        </button>
        <button className="btn btn-outline" type="button" onClick={() => router.push('/dashboard/workouts')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
