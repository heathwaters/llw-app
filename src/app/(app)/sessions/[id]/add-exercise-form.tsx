'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { addExerciseToSession } from './actions';
import type { Exercise } from '@/lib/database.types';

export function AddExerciseForm({
  sessionId,
  exercises,
}: {
  sessionId: string;
  exercises: Pick<Exercise, 'id' | 'name' | 'category' | 'primary_muscle'>[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full card flex items-center justify-center gap-2 text-accent font-semibold hover:border-accent/40 transition"
      >
        <Plus className="w-4 h-4" />
        Add exercise
      </button>
    );
  }

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase()) ||
    (e.primary_muscle ?? '').toLowerCase().includes(query.toLowerCase()),
  );

  async function pick(id: string) {
    setPending(true); setError(null);
    const fd = new FormData();
    fd.set('session_id', sessionId);
    fd.set('exercise_id', id);
    const res = await addExerciseToSession(fd);
    setPending(false);
    if (res?.error) setError(res.error);
    else { setOpen(false); setQuery(''); }
  }

  return (
    <div className="card space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm">Pick an exercise</h3>
        <button
          onClick={() => { setOpen(false); setQuery(''); }}
          className="text-xs text-ink-soft hover:text-ink"
          disabled={pending}
        >
          Cancel
        </button>
      </div>

      <input
        className="input"
        placeholder="Search exercises…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      <div className="max-h-80 overflow-y-auto -mx-1 space-y-1">
        {filtered.length === 0 && (
          <p className="text-sm text-ink-muted text-center py-6">No matches</p>
        )}
        {filtered.map((e) => (
          <button
            key={e.id}
            disabled={pending}
            onClick={() => pick(e.id)}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-bg disabled:opacity-50 transition"
          >
            <div className="font-semibold text-sm">{e.name}</div>
            <div className="text-xs text-ink-soft capitalize">
              {e.category}
              {e.primary_muscle ? ` · ${e.primary_muscle}` : ''}
            </div>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
