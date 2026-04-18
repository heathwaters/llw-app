'use client';

import { useState, useTransition } from 'react';
import { Plus, X } from 'lucide-react';
import { addSet, removeSet, removeSessionExercise } from './actions';
import type { ExerciseSet } from '@/lib/database.types';

type Props = {
  sessionId: string;
  sessionExerciseId: string;
  exerciseName: string;
  category: string;
  sets: ExerciseSet[];
  defaultWeightUnit: 'lb' | 'kg';
};

export function SetsEditor({
  sessionId,
  sessionExerciseId,
  exerciseName,
  category,
  sets,
  defaultWeightUnit,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const isCardio = category === 'cardio';

  async function submit(fd: FormData) {
    setPending(true); setError(null);
    fd.set('session_id', sessionId);
    fd.set('session_exercise_id', sessionExerciseId);
    const res = await addSet(fd);
    setPending(false);
    if (res?.error) setError(res.error);
    else {
      (document.getElementById(`set-form-${sessionExerciseId}`) as HTMLFormElement | null)?.reset();
    }
  }

  return (
    <div className="card space-y-3">
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <div className="font-bold">{exerciseName}</div>
          <div className="text-xs text-ink-soft capitalize">{category}</div>
        </div>
        <button
          type="button"
          onClick={() =>
            startTransition(async () => { await removeSessionExercise(sessionExerciseId, sessionId); })
          }
          className="text-xs text-ink-muted hover:text-red-600"
          aria-label="Remove exercise"
        >
          Remove
        </button>
      </div>

      {sets.length > 0 && (
        <div className="space-y-1">
          {sets.map((s) => (
            <div
              key={s.id}
              className="flex justify-between items-center text-sm py-1.5 px-3 bg-bg rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-ink-muted w-6">
                  {s.is_warmup ? 'W' : s.set_number}
                </span>
                <span>
                  {isCardio ? formatCardio(s) : formatStrength(s)}
                  {s.rpe ? <span className="text-ink-muted"> · RPE {s.rpe}</span> : null}
                </span>
              </div>
              <button
                onClick={() => startTransition(async () => { await removeSet(s.id, sessionId); })}
                className="text-ink-muted hover:text-red-600"
                aria-label="Delete set"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <form
          id={`set-form-${sessionExerciseId}`}
          action={submit}
          className="space-y-2 pt-2 border-t border-ink/[0.06]"
        >
          {isCardio ? (
            <div className="grid grid-cols-3 gap-2">
              <LabeledInput name="duration_seconds" type="number" label="Seconds" placeholder="600" />
              <LabeledInput name="distance_meters" type="number" step="1" label="Meters" placeholder="1000" />
              <LabeledInput name="rpe" type="number" min="1" max="10" label="RPE" placeholder="7" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              <LabeledInput name="weight" type="number" step="0.5" label="Weight" placeholder="135" />
              <div>
                <label className="label">Unit</label>
                <select name="weight_unit" defaultValue={defaultWeightUnit} className="input">
                  <option value="lb">lb</option>
                  <option value="kg">kg</option>
                </select>
              </div>
              <LabeledInput name="reps" type="number" label="Reps" placeholder="8" />
              <LabeledInput name="rpe" type="number" min="1" max="10" label="RPE" placeholder="7" />
            </div>
          )}

          <label className="flex items-center gap-2 text-xs text-ink-soft">
            <input type="checkbox" name="is_warmup" className="rounded" />
            Warm-up set
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setAdding(false); setError(null); }}
              className="btn-secondary flex-1 text-xs py-2"
              disabled={pending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 text-xs py-2 disabled:opacity-50"
              disabled={pending}
            >
              {pending ? 'Saving…' : 'Add set'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-ink/15 text-sm font-semibold text-ink-soft hover:text-ink hover:border-ink/30"
        >
          <Plus className="w-4 h-4" />
          Add set
        </button>
      )}
    </div>
  );
}

function LabeledInput({
  label, ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" {...props} />
    </div>
  );
}

function formatStrength(s: ExerciseSet): string {
  const parts: string[] = [];
  if (s.weight != null) parts.push(`${s.weight}${s.weight_unit}`);
  if (s.reps != null) parts.push(`× ${s.reps}`);
  return parts.length ? parts.join(' ') : '—';
}

function formatCardio(s: ExerciseSet): string {
  const parts: string[] = [];
  if (s.duration_seconds != null) {
    const m = Math.floor(s.duration_seconds / 60);
    const sec = s.duration_seconds % 60;
    parts.push(`${m}:${String(sec).padStart(2, '0')}`);
  }
  if (s.distance_meters != null) parts.push(`${s.distance_meters}m`);
  return parts.length ? parts.join(' · ') : '—';
}
