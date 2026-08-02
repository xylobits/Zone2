'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { login, type AuthFormState } from '../actions';

const initialState: AuthFormState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <AuthShell
      title="Log in"
      subtitle="Pick up where you left off."
      footer={
        <>
          New to Zone2? <Link href="/signup">Create an account</Link>
        </>
      }
    >
      <form action={formAction}>
        {state.error && <p className="auth-error">{state.error}</p>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input className="input" id="email" type="email" name="email" required autoComplete="email" />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <PasswordInput id="password" name="password" required autoComplete="current-password" />
        </div>

        <button className="btn btn-red" type="submit" disabled={pending}>
          {pending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  );
}
