'use client';

import { useState } from 'react';
import Link from 'next/link';
import { logIn } from '../actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <Link href="/" className="text-xs font-semibold text-ink-soft hover:text-ink">← Back</Link>
        <h1 className="text-2xl font-bold mt-6 mb-1">Welcome back</h1>
        <p className="text-sm text-ink-soft mb-6">Log in to your training journal.</p>

        <form
          action={async (fd) => {
            setPending(true); setError(null);
            const res = await logIn(fd);
            if (res?.error) { setError(res.error); setPending(false); }
          }}
          className="space-y-4"
        >
          <div>
            <label className="label">Email</label>
            <input className="input" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" name="password" type="password" required autoComplete="current-password" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
            {pending ? 'Logging in…' : 'Log in'}
          </button>

          <p className="text-center text-sm text-ink-soft">
            New here? <Link href="/signup" className="text-accent font-semibold">Create an account</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
