'use client';

import { useActionState } from 'react';
import { markAttendance, type ActionState } from '../../actions';

const initialState: ActionState = { error: null };

export function AttendanceButtons({ eventId, profileId }: { eventId: string; profileId: string }) {
  const [state, formAction, pending] = useActionState(markAttendance, initialState);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <form action={formAction}>
        <input type="hidden" name="event_id" value={eventId} />
        <input type="hidden" name="profile_id" value={profileId} />
        <button className="btn btn-red btn-sm" name="status" value="attended" type="submit" disabled={pending}>
          Attended
        </button>
      </form>
      <form action={formAction}>
        <input type="hidden" name="event_id" value={eventId} />
        <input type="hidden" name="profile_id" value={profileId} />
        <button className="btn btn-outline btn-sm" name="status" value="no_show" type="submit" disabled={pending}>
          No-show
        </button>
      </form>
      {state.error && <div style={{ color: 'var(--red)', fontSize: 12 }}>{state.error}</div>}
    </div>
  );
}
