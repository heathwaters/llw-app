import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Dumbbell, Activity, Heart, Zap, Coffee } from 'lucide-react';
import type { SessionType } from '@/lib/database.types';

const sessionMeta: Record<SessionType, { label: string; icon: React.ReactNode; tone: string }> = {
  strength:        { label: 'Strength',        icon: <Dumbbell className="w-4 h-4" />, tone: 'bg-accent-soft text-accent' },
  power:           { label: 'Power',           icon: <Zap className="w-4 h-4" />,      tone: 'bg-accent-soft text-accent' },
  cardio:          { label: 'Cardio',          icon: <Activity className="w-4 h-4" />, tone: 'bg-pink-100 text-pink-700' },
  agility:         { label: 'Agility',         icon: <Zap className="w-4 h-4" />,      tone: 'bg-orange-100 text-orange-700' },
  golf_practice:   { label: 'Golf practice',   icon: <Activity className="w-4 h-4" />, tone: 'bg-emerald-100 text-emerald-700' },
  golf_round:      { label: 'Golf round',      icon: <Activity className="w-4 h-4" />, tone: 'bg-emerald-100 text-emerald-700' },
  tennis_practice: { label: 'Tennis practice', icon: <Activity className="w-4 h-4" />, tone: 'bg-orange-100 text-orange-700' },
  tennis_match:    { label: 'Tennis match',    icon: <Activity className="w-4 h-4" />, tone: 'bg-orange-100 text-orange-700' },
  recovery:        { label: 'Recovery',        icon: <Heart className="w-4 h-4" />,    tone: 'bg-slate-100 text-slate-600' },
  rest:            { label: 'Rest',            icon: <Coffee className="w-4 h-4" />,   tone: 'bg-slate-100 text-slate-600' },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd   = format(endOfWeek(new Date(),   { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data: weekSessions } = await supabase
    .from('sessions').select('*')
    .gte('session_date', weekStart).lte('session_date', weekEnd)
    .order('session_date', { ascending: false });

  const { data: recent } = await supabase
    .from('sessions').select('*')
    .order('session_date', { ascending: false }).order('created_at', { ascending: false })
    .limit(8);

  const sessionCount = weekSessions?.length ?? 0;
  const totalMinutes = weekSessions?.reduce((s, x) => s + (x.duration_minutes ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-accent to-[#9589F8] text-white p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <p className="text-xs font-semibold tracking-widest uppercase opacity-80 mb-1">Welcome back</p>
        <h1 className="text-2xl font-bold mb-4">{profile?.display_name ?? 'LLW'}</h1>
        <div className="flex gap-4 relative">
          <div>
            <div className="text-2xl font-bold">{sessionCount}</div>
            <div className="text-xs opacity-80">Sessions this week</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalMinutes}</div>
            <div className="text-xs opacity-80">Total minutes</div>
          </div>
          {profile?.golf_handicap !== null && (
            <div>
              <div className="text-2xl font-bold">{profile.golf_handicap}</div>
              <div className="text-xs opacity-80">Handicap</div>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Recent sessions</h2>
          <Link href="/log" className="text-sm font-semibold text-accent">Log new →</Link>
        </div>

        {recent && recent.length > 0 ? (
          <div className="space-y-2">
            {recent.map((s) => {
              const meta = sessionMeta[s.session_type];
              return (
                <Link key={s.id} href={`/sessions/${s.id}`}
                  className="card flex items-center gap-3 hover:border-ink/20 transition">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.tone}`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{s.title || meta.label}</div>
                    <div className="text-xs text-ink-soft">
                      {format(new Date(s.session_date), 'EEE, MMM d')}
                      {s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}
                      {s.rpe ? ` · RPE ${s.rpe}` : ''}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-10">
            <p className="text-ink-soft mb-4">No sessions yet. Let's log your first one.</p>
            <Link href="/log" className="btn-primary">Log a session</Link>
          </div>
        )}
      </section>
    </div>
  );
}
