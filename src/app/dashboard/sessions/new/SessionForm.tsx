'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { scheduleSession, type ActionState } from '../../actions';
import { ACTIVITY_TYPES, type Match } from '@/lib/types/domain';

const initialState: ActionState = { error: null };

export function SessionForm({ matches, defaultMatchId }: { matches: Match[]; defaultMatchId?: string }) {
  const [state, formAction, pending] = useActionState(scheduleSession, initialState);
  const router = useRouter();

  return (
    <form action={formAction} className="form-card">
      {state.error && (
        <p className="auth-error" style={{ marginBottom: 16 }}>
          {state.error}
        </p>
      )}

      <div className="field">
        <label htmlFor="match_id">Match</label>
        <select className="input" id="match_id" name="match_id" defaultValue={defaultMatchId ?? matches[0]?.id}>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              Match · {m.compatibility_score} compatibility
            </option>
          ))}
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="activity_type">Format</label>
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
          <input className="input" id="duration_minutes" name="duration_minutes" type="number" min={15} max={480} defaultValue={60} required />
        </div>
      </div>

      <div className="field">
        <label htmlFor="scheduled_at">Date &amp; time</label>
        <input className="input" id="scheduled_at" name="scheduled_at" type="datetime-local" required />
      </div>

      <div className="field">
        <label htmlFor="venue_name">Venue name</label>
        <input className="input" id="venue_name" name="venue_name" placeholder="Riverside Trailhead" required maxLength={120} />
        <span className="hint">Public venue only — this is the safety model, not a suggestion.</span>
      </div>

      <div className="field">
        <label htmlFor="venue_address">Venue address</label>
        <input className="input" id="venue_address" name="venue_address" required maxLength={200} />
      </div>

      <div className="form-actions">
        <button className="btn btn-red" type="submit" disabled={pending}>
          {pending ? 'Scheduling…' : 'Schedule session'}
        </button>
        <button className="btn btn-outline" type="button" onClick={() => router.push('/dashboard/sessions')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
