'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signUp } from '../actions';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <Link href="/" className="text-xs font-semibold text-ink-soft hover:text-ink">← Back</Link>
        <h1 className="text-2xl font-bold mt-6 mb-1">Create your account</h1>
        <p className="text-sm text-ink-soft mb-6">Start logging your training in 30 seconds.</p>

        <form
          action={async (fd) => {
            setPending(true); setError(null);
            const res = await signUp(fd);
            if (res?.error) { setError(res.error); setPending(false); }
          }}
          className="space-y-4"
        >
          <div>
            <label className="label">Display name</label>
            <input className="input" name="display_name" required placeholder="Your name" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" name="password" type="password" required minLength={8} autoComplete="new-password" />
            <p className="text-[11px] text-ink-muted mt-1">8+ characters</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
            {pending ? 'Creating…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-ink-soft">
            Already have an account? <Link href="/login" className="text-accent font-semibold">Log in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
