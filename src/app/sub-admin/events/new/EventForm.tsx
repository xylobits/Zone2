'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent, type ActionState } from '../../actions';
import { ACTIVITY_TYPES } from '@/lib/types/domain';

const initialState: ActionState = { error: null };

export function EventForm() {
  const [state, formAction, pending] = useActionState(createEvent, initialState);
  const router = useRouter();

  return (
    <form action={formAction} className="form-card">
      {state.error && (
        <p className="auth-error" style={{ marginBottom: 16 }}>
          {state.error}
        </p>
      )}

      <div className="field">
        <label htmlFor="title">Title</label>
        <input className="input" id="title" name="title" required maxLength={120} placeholder="Saturday long run" />
      </div>

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
          <label htmlFor="starts_at">Starts</label>
          <input className="input" id="starts_at" name="starts_at" type="datetime-local" required />
        </div>
      </div>

      <div className="field">
        <label htmlFor="location_text">Location</label>
        <input className="input" id="location_text" name="location_text" maxLength={200} />
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea className="textarea" id="description" name="description" maxLength={500} />
      </div>

      <div className="form-actions">
        <button className="btn btn-red" type="submit" disabled={pending}>
          {pending ? 'Creating…' : 'Create event'}
        </button>
        <button className="btn btn-outline" type="button" onClick={() => router.push('/sub-admin/events')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
