'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/marketing/Logo';
import { signup, type AuthFormState } from '../actions';

const initialState: AuthFormState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <div className="auth-shell">
      <form action={formAction} className="auth-form">
        <Logo />
        <h1>Create your account</h1>
        {state.error && <p className="auth-error">{state.error}</p>}
        {state.message && <p className="auth-error" style={{ background: 'rgba(30,140,90,.1)', borderColor: 'rgba(30,140,90,.3)', color: '#1e8c5a' }}>{state.message}</p>}
        <label>
          Name
          <input className="input" type="text" name="displayName" autoComplete="name" />
        </label>
        <label>
          Email
          <input className="input" type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input className="input" type="password" name="password" required minLength={8} autoComplete="new-password" />
          <span className="hint">At least 8 characters.</span>
        </label>
        <button className="btn btn-red" type="submit" disabled={pending}>
          {pending ? 'Creating account…' : 'Create account'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
