'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/marketing/Logo';
import { login, type AuthFormState } from '../actions';

const initialState: AuthFormState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="auth-shell">
      <form action={formAction} className="auth-form">
        <Logo />
        <h1>Log in</h1>
        {state.error && <p className="auth-error">{state.error}</p>}
        <label>
          Email
          <input className="input" type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input className="input" type="password" name="password" required autoComplete="current-password" />
        </label>
        <button className="btn btn-red" type="submit" disabled={pending}>
          {pending ? 'Logging in…' : 'Log in'}
        </button>
        <p className="auth-switch">
          New to Zone2? <Link href="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
