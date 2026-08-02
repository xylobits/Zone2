'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { signup, type AuthFormState } from '../actions';

const initialState: AuthFormState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Find someone who shows up."
      footer={
        <>
          Already have an account? <Link href="/login">Log in</Link>
        </>
      }
    >
      <form action={formAction}>
        {state.error && <p className="auth-error">{state.error}</p>}
        {state.message && <p className="auth-success">{state.message}</p>}

        <div className="field">
          <label htmlFor="displayName">Name</label>
          <input className="input" id="displayName" type="text" name="displayName" autoComplete="name" />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input className="input" id="email" type="email" name="email" required autoComplete="email" />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <PasswordInput id="password" name="password" required minLength={8} autoComplete="new-password" />
          <span className="hint">At least 8 characters.</span>
        </div>

        <button className="btn btn-red" type="submit" disabled={pending}>
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
