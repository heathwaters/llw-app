import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-ink-soft mb-3">
          Personal training journal
        </p>
        <h1 className="text-4xl font-bold leading-tight mb-4">
          Train like the athlete<br />
          <span className="text-accent">you're becoming.</span>
        </h1>
        <p className="text-ink-soft mb-8 leading-relaxed">
          A log built for golf, tennis, and the strength work that makes both better.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/signup" className="btn-primary">Get started</Link>
          <Link href="/login" className="btn-secondary">Log in</Link>
        </div>
      </div>
    </main>
  );
}
