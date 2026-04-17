import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { deleteSession } from '../../log/actions';

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase.from('sessions').select('*').eq('id', id).single();
  if (!session) notFound();

  return (
    <div className="space-y-5">
      <Link href="/sessions" className="text-xs font-semibold text-ink-soft hover:text-ink">← All sessions</Link>

      <div className="card space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{session.session_type.replace('_',' ')}</p>
          <h1 className="text-2xl font-bold mt-1">{session.title || 'Untitled session'}</h1>
          <p className="text-sm text-ink-soft mt-1">{format(parseISO(session.session_date), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {session.duration_minutes && (
            <Stat label="Duration" value={`${session.duration_minutes} min`} />
          )}
          {session.rpe && <Stat label="RPE" value={`${session.rpe} / 10`} />}
        </div>

        {session.notes && (
          <div className="pt-2">
            <p className="label">Notes</p>
            <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{session.notes}</p>
          </div>
        )}
      </div>

      <form action={async () => { 'use server'; await deleteSession(id); }}>
        <button className="btn-secondary w-full text-red-600 hover:bg-red-50 hover:border-red-200">
          Delete this session
        </button>
      </form>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg p-3">
      <div className="text-xs text-ink-soft">{label}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}
