'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createClub, updateClub, type ActionState } from '../actions';
import type { Club } from '@/lib/types/domain';

const initialState: ActionState = { error: null };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function ClubForm({ club }: { club?: Club }) {
  const action = club ? updateClub : createClub;
  const [state, formAction, pending] = useActionState(action, initialState);
  const router = useRouter();

  return (
    <form action={formAction} className="form-card">
      {state.error && (
        <p className="auth-error" style={{ marginBottom: 16 }}>
          {state.error}
        </p>
      )}
      {club && <input type="hidden" name="club_id" value={club.id} />}

      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          className="input"
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={club?.name}
          onChange={(e) => {
            if (club) return;
            const slugInput = document.getElementById('slug') as HTMLInputElement | null;
            if (slugInput && !slugInput.dataset.touched) slugInput.value = slugify(e.target.value);
          }}
        />
      </div>

      <div className="field">
        <label htmlFor="slug">Slug</label>
        <input
          className="input"
          id="slug"
          name="slug"
          required
          maxLength={80}
          defaultValue={club?.slug}
          onChange={(e) => {
            e.target.dataset.touched = 'true';
          }}
        />
        <span className="hint">Lowercase letters, numbers, and dashes.</span>
      </div>

      <div className="field">
        <label htmlFor="city">City</label>
        <input className="input" id="city" name="city" maxLength={80} defaultValue={club?.city ?? ''} />
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea className="textarea" id="description" name="description" maxLength={500} defaultValue={club?.description ?? ''} />
      </div>

      <div className="form-actions">
        <button className="btn btn-red" type="submit" disabled={pending}>
          {pending ? 'Saving…' : club ? 'Save changes' : 'Create club'}
        </button>
        <button className="btn btn-outline" type="button" onClick={() => router.push('/admin/clubs')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
