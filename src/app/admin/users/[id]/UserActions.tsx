'use client';

import { useActionState, useState } from 'react';
import { setUserRole, forceVerify, type ActionState } from '../../actions';
import type { Club, ProfileRole, VerifiedTier } from '@/lib/types/domain';

const initialState: ActionState = { error: null };

export function RoleForm({
  userId,
  currentRole,
  currentClubId,
  clubs,
}: {
  userId: string;
  currentRole: ProfileRole;
  currentClubId: string | null;
  clubs: Club[];
}) {
  const [state, formAction, pending] = useActionState(setUserRole, initialState);
  const [role, setRole] = useState<ProfileRole>(currentRole);

  return (
    <form action={formAction}>
      {state.error && (
        <p className="auth-error" style={{ marginBottom: 16 }}>
          {state.error}
        </p>
      )}
      <input type="hidden" name="user_id" value={userId} />
      <div className="field-row">
        <div className="field">
          <label htmlFor="role">Role</label>
          <select
            className="input"
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as ProfileRole)}
          >
            <option value="user">user</option>
            <option value="sub_admin">sub_admin</option>
            <option value="admin">admin</option>
          </select>
        </div>
        {role === 'sub_admin' && (
          <div className="field">
            <label htmlFor="club_id">Club</label>
            <select className="input" id="club_id" name="club_id" defaultValue={currentClubId ?? ''}>
              <option value="" disabled>
                Select a club
              </option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <button className="btn btn-red btn-sm" type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Update role'}
      </button>
    </form>
  );
}

export function ForceVerifyForm({ userId, currentTier }: { userId: string; currentTier: VerifiedTier }) {
  const [state, formAction, pending] = useActionState(forceVerify, initialState);
  const nextTier = currentTier === 'verified' ? 'unverified' : 'verified';

  return (
    <form action={formAction}>
      {state.error && (
        <p className="auth-error" style={{ marginBottom: 16 }}>
          {state.error}
        </p>
      )}
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="tier" value={nextTier} />
      <button className="btn btn-outline btn-sm" type="submit" disabled={pending}>
        {pending ? 'Saving…' : nextTier === 'verified' ? 'Force verify' : 'Revoke verification'}
      </button>
    </form>
  );
}
