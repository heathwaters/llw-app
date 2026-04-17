import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import type { SessionType } from '@/lib/database.types';

const typeLabel: Record<SessionType, string> = {
  strength: 'Strength', power: 'Power', cardio: 'Cardio', agility: 'Agility',
  golf_practice: 'Golf practice', golf_round: 'Golf round',
  tennis_practice: 'Tennis practice', tennis_match: 'Tennis match',
  recovery: 'Recovery', rest: 'Rest',
};

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from('sessions').select('*')
    .order('session_date', { ascending: false }).order('created_at', { ascending: false })
    .limit(100);

  // Group by date
  const grouped = (sessions ?? []).reduce<Record<string, typeof sessions>>((acc, s) => {
    (acc[s.session_date] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All sessions</h1>
        <Link href="/log" className="btn-primary text-xs px-3 py-2">+ New</Link>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-ink-soft mb-4">No sessions yet.</p>
          <Link href="/log" className="btn-primary">Log your first</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-2">
                {format(parseISO(date), 'EEEE, MMM d')}
              </h2>
              <div className="space-y-2">
                {items!.map((s) => (
                  <Link key={s.id} href={`/sessions/${s.id}`}
                    className="card flex justify-between items-center hover:border-ink/20 transition">
                    <div>
                      <div className="font-semibold text-sm">{s.title || typeLabel[s.session_type]}</div>
                      <div className="text-xs text-ink-soft">
                        {typeLabel[s.session_type]}
                        {s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}
                        {s.rpe ? ` · RPE ${s.rpe}` : ''}
                      </div>
                    </div>
                    <span className="text-ink-muted">→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
