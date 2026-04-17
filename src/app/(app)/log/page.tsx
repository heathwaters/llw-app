'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Activity, Heart, Zap, Coffee, Target } from 'lucide-react';
import { createSession } from './actions';
import type { SessionType } from '@/lib/database.types';

const types: { value: SessionType; label: string; icon: React.ReactNode; tone: string }[] = [
  { value: 'strength',        label: 'Strength',        icon: <Dumbbell className="w-5 h-5" />, tone: 'bg-accent-soft text-accent border-accent/30' },
  { value: 'power',           label: 'Power',           icon: <Zap className="w-5 h-5" />,      tone: 'bg-accent-soft text-accent border-accent/30' },
  { value: 'cardio',          label: 'Cardio',          icon: <Activity className="w-5 h-5" />, tone: 'bg-pink-50 text-pink-700 border-pink-200' },
  { value: 'agility',         label: 'Agility',         icon: <Zap className="w-5 h-5" />,      tone: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'golf_practice',   label: 'Golf practice',   icon: <Target className="w-5 h-5" />,   tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'golf_round',      label: 'Golf round',      icon: <Target className="w-5 h-5" />,   tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'tennis_practice', label: 'Tennis practice', icon: <Activity className="w-5 h-5" />, tone: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'tennis_match',    label: 'Tennis match',    icon: <Activity className="w-5 h-5" />, tone: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'recovery',        label: 'Recovery',        icon: <Heart className="w-5 h-5" />,    tone: 'bg-slate-50 text-slate-600 border-slate-200' },
  { value: 'rest',            label: 'Rest',            icon: <Coffee className="w-5 h-5" />,   tone: 'bg-slate-50 text-slate-600 border-slate-200' },
];

export default function LogPage() {
  const [type, setType] = useState<SessionType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-xs font-semibold text-ink-soft hover:text-ink">← Back</Link>
        <h1 className="text-2xl font-bold mt-3">Log a session</h1>
        <p className="text-sm text-ink-soft">What kind of training did you do?</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`p-4 rounded-2xl border-2 flex items-center gap-2.5 transition text-left
              ${type === t.value ? t.tone : 'bg-white border-ink/[0.08] text-ink hover:border-ink/20'}`}
          >
            {t.icon}
            <span className="font-semibold text-sm">{t.label}</span>
          </button>
        ))}
      </div>

      {type && (
        <form
          action={async (fd) => {
            setPending(true); setError(null);
            fd.set('session_type', type);
            const res = await createSession(fd);
            if (res?.error) { setError(res.error); setPending(false); }
          }}
          className="card space-y-4"
        >
          <div>
            <label className="label">Title <span className="text-ink-muted font-normal">(optional)</span></label>
            <input className="input" name="title" placeholder="e.g. Lower body strength" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input className="input" name="session_date" type="date" defaultValue={today} required />
            </div>
            <div>
              <label className="label">Duration (min)</label>
              <input className="input" name="duration_minutes" type="number" min={1} max={600} placeholder="60" />
            </div>
          </div>

          <div>
            <label className="label">RPE <span className="text-ink-muted font-normal">(1–10, how hard it felt)</span></label>
            <input className="input" name="rpe" type="number" min={1} max={10} placeholder="7" />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-24 resize-y" name="notes" placeholder="How did it feel? Any tweaks for next time?" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
            {pending ? 'Saving…' : 'Save session'}
          </button>
        </form>
      )}
    </div>
  );
}
