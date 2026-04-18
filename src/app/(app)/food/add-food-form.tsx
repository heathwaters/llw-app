'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { addFoodEntry } from './actions';
import type { MealType } from '@/lib/database.types';

const MEALS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch',     label: 'Lunch' },
  { value: 'dinner',    label: 'Dinner' },
  { value: 'snack',     label: 'Snack' },
];

function guessMealFromClock(): MealType {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

export function AddFoodForm({ date }: { date: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meal, setMeal] = useState<MealType>(guessMealFromClock());

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full card flex items-center justify-center gap-2 text-accent font-semibold hover:border-accent/40 transition"
      >
        <Plus className="w-5 h-5" />
        Add food
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        setPending(true); setError(null);
        fd.set('meal', meal);
        fd.set('log_date', date);
        const res = await addFoodEntry(fd);
        setPending(false);
        if (res?.error) setError(res.error);
        else {
          (document.getElementById('food-form') as HTMLFormElement | null)?.reset();
          setOpen(false);
        }
      }}
      id="food-form"
      className="card space-y-3"
    >
      <div className="flex flex-wrap gap-1.5">
        {MEALS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMeal(m.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition
              ${meal === m.value
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-ink-soft border-ink/10 hover:border-ink/20'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div>
        <label className="label">Food</label>
        <input className="input" name="name" placeholder="e.g. Chicken breast" required autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Serving size <span className="text-ink-muted font-normal">(optional)</span></label>
          <input className="input" name="serving_size" placeholder="100g, 1 cup…" />
        </div>
        <div>
          <label className="label">Servings</label>
          <input className="input" name="servings" type="number" step="0.1" min="0.1" defaultValue={1} />
        </div>
      </div>

      <div>
        <label className="label">Calories</label>
        <input className="input" name="calories" type="number" step="1" min="0" placeholder="250" required />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Protein (g)</label>
          <input className="input" name="protein" type="number" step="0.1" min="0" placeholder="30" />
        </div>
        <div>
          <label className="label">Carbs (g)</label>
          <input className="input" name="carbs" type="number" step="0.1" min="0" placeholder="40" />
        </div>
        <div>
          <label className="label">Fat (g)</label>
          <input className="input" name="fat" type="number" step="0.1" min="0" placeholder="10" />
        </div>
      </div>

      <div>
        <label className="label">Fiber (g) <span className="text-ink-muted font-normal">(optional)</span></label>
        <input className="input" name="fiber" type="number" step="0.1" min="0" placeholder="5" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-secondary flex-1"
          disabled={pending}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1 disabled:opacity-50" disabled={pending}>
          {pending ? 'Saving…' : 'Add'}
        </button>
      </div>
    </form>
  );
}
