'use client';

import { useState } from 'react';
import { upsertGolfRound } from './actions';

type GolfRound = {
  course_name: string | null;
  tees: string | null;
  course_rating: number | null;
  slope_rating: number | null;
  holes_played: number | null;
  total_score: number | null;
  total_putts: number | null;
  fairways_hit: number | null;
  fairways_possible: number | null;
  greens_in_regulation: number | null;
  weather: string | null;
  conditions_notes: string | null;
};

export function GolfRoundForm({
  sessionId,
  round,
}: {
  sessionId: string;
  round: GolfRound | null;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(fd: FormData) {
    setPending(true); setError(null); setSaved(false);
    fd.set('session_id', sessionId);
    const res = await upsertGolfRound(fd);
    setPending(false);
    if (res?.error) setError(res.error);
    else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  return (
    <form action={submit} className="card space-y-4">
      <h2 className="font-bold">Scorecard</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Course</label>
          <input className="input" name="course_name"
            defaultValue={round?.course_name ?? ''} placeholder="Pebble Beach" />
        </div>
        <div>
          <label className="label">Tees</label>
          <input className="input" name="tees"
            defaultValue={round?.tees ?? ''} placeholder="Blue" />
        </div>
        <div>
          <label className="label">Holes</label>
          <input className="input" name="holes_played" type="number" min="1" max="36"
            defaultValue={round?.holes_played ?? 18} />
        </div>
        <div>
          <label className="label">Course rating</label>
          <input className="input" name="course_rating" type="number" step="0.1"
            defaultValue={round?.course_rating ?? ''} placeholder="72.4" />
        </div>
        <div>
          <label className="label">Slope</label>
          <input className="input" name="slope_rating" type="number"
            defaultValue={round?.slope_rating ?? ''} placeholder="135" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-ink/[0.06]">
        <div>
          <label className="label">Total score</label>
          <input className="input" name="total_score" type="number"
            defaultValue={round?.total_score ?? ''} placeholder="78" />
        </div>
        <div>
          <label className="label">Total putts</label>
          <input className="input" name="total_putts" type="number"
            defaultValue={round?.total_putts ?? ''} placeholder="31" />
        </div>
        <div>
          <label className="label">Fairways hit</label>
          <input className="input" name="fairways_hit" type="number"
            defaultValue={round?.fairways_hit ?? ''} placeholder="9" />
        </div>
        <div>
          <label className="label">Fairways possible</label>
          <input className="input" name="fairways_possible" type="number"
            defaultValue={round?.fairways_possible ?? ''} placeholder="14" />
        </div>
        <div className="col-span-2">
          <label className="label">Greens in regulation</label>
          <input className="input" name="greens_in_regulation" type="number"
            defaultValue={round?.greens_in_regulation ?? ''} placeholder="11" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-ink/[0.06]">
        <div>
          <label className="label">Weather</label>
          <input className="input" name="weather"
            defaultValue={round?.weather ?? ''} placeholder="Sunny, windy" />
        </div>
        <div>
          <label className="label">Conditions</label>
          <input className="input" name="conditions_notes"
            defaultValue={round?.conditions_notes ?? ''} placeholder="Firm greens" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">Saved ✓</p>}

      <button type="submit" className="btn-primary w-full disabled:opacity-50" disabled={pending}>
        {pending ? 'Saving…' : round ? 'Update scorecard' : 'Save scorecard'}
      </button>
    </form>
  );
}
