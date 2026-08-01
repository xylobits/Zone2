'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile, type ActionState } from '../../actions';
import { ACTIVITY_TYPES, type Profile } from '@/lib/types/domain';

const initialState: ActionState = { error: null };

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  const [activities, setActivities] = useState<string[]>(profile.primary_activities);
  const router = useRouter();

  return (
    <form action={formAction} className="form-card">
      {state.error && <p className="auth-error" style={{ marginBottom: 16 }}>{state.error}</p>}

      <div className="field">
        <label htmlFor="display_name">Display name</label>
        <input
          className="input"
          id="display_name"
          name="display_name"
          defaultValue={profile.display_name ?? ''}
          required
          maxLength={60}
        />
      </div>

      <div className="field">
        <label htmlFor="bio">Bio</label>
        <textarea className="textarea" id="bio" name="bio" defaultValue={profile.bio ?? ''} maxLength={500} />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="intent">Intent</label>
          <select className="input" id="intent" name="intent" defaultValue={profile.intent}>
            <option value="training_partner">Training partner</option>
            <option value="dating">Dating</option>
            <option value="open">Open</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="birthdate">Birthdate</label>
          <input className="input" id="birthdate" name="birthdate" type="date" defaultValue={profile.birthdate ?? ''} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="location_text">Location</label>
        <input
          className="input"
          id="location_text"
          name="location_text"
          defaultValue={profile.location_text ?? ''}
          placeholder="Austin, TX"
          maxLength={120}
        />
      </div>

      <div className="field">
        <label>Primary activities</label>
        <div className="checkbox-row">
          {ACTIVITY_TYPES.map((activity) => (
            <label key={activity} className="checkbox-pill">
              <input
                type="checkbox"
                name="primary_activities"
                value={activity}
                checked={activities.includes(activity)}
                onChange={(e) => {
                  setActivities((prev) =>
                    e.target.checked ? [...prev, activity] : prev.filter((a) => a !== activity),
                  );
                }}
              />
              {activity}
            </label>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-red" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save profile'}
        </button>
        <button className="btn btn-outline" type="button" onClick={() => router.push('/dashboard/profile')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
