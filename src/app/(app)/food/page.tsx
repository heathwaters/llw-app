import Link from 'next/link';
import { format, parseISO, addDays } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import type { FoodEntry, MealType, Profile } from '@/lib/database.types';
import { AddFoodForm } from './add-food-form';
import { DeleteEntryButton } from './delete-entry-button';

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABEL: Record<MealType, string> = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks',
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

type Totals = { calories: number; protein: number; carbs: number; fat: number; fiber: number };

function sum(entries: FoodEntry[]): Totals {
  return entries.reduce<Totals>(
    (acc, e) => {
      const mul = e.servings ?? 1;
      acc.calories += (e.calories ?? 0) * mul;
      acc.protein  += (e.protein  ?? 0) * mul;
      acc.carbs    += (e.carbs    ?? 0) * mul;
      acc.fat      += (e.fat      ?? 0) * mul;
      acc.fiber    += (e.fiber    ?? 0) * mul;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

export default async function FoodPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const date = sp.date ?? todayISO();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user!.id).single<Profile>();

  const { data: entries } = await supabase
    .from('food_entries').select('*')
    .eq('log_date', date)
    .order('created_at', { ascending: true });

  const list = (entries ?? []) as FoodEntry[];
  const totals = sum(list);
  const grouped = MEAL_ORDER.reduce<Record<MealType, FoodEntry[]>>((acc, m) => {
    acc[m] = list.filter((e) => e.meal === m);
    return acc;
  }, { breakfast: [], lunch: [], dinner: [], snack: [] });

  const prev = format(addDays(parseISO(date), -1), 'yyyy-MM-dd');
  const next = format(addDays(parseISO(date),  1), 'yyyy-MM-dd');
  const isToday = date === todayISO();

  const calTarget     = profile?.cal_target     ?? 2400;
  const proteinTarget = profile?.protein_target ?? 180;
  const carbsTarget   = profile?.carbs_target   ?? 240;
  const fatTarget     = profile?.fat_target     ?? 80;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Food</h1>
          <p className="text-sm text-ink-soft">
            {isToday ? 'Today' : format(parseISO(date), 'EEEE, MMM d')}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Link href={`/food?date=${prev}`} className="btn-secondary text-xs px-3 py-2">←</Link>
          {!isToday && (
            <Link href="/food" className="btn-secondary text-xs px-3 py-2">Today</Link>
          )}
          <Link href={`/food?date=${next}`} className="btn-secondary text-xs px-3 py-2">→</Link>
        </div>
      </div>

      <section className="card space-y-4">
        <h2 className="font-bold text-sm">Daily totals</h2>
        <MacroBar label="Calories" value={totals.calories} target={calTarget}     unit="kcal" />
        <div className="grid grid-cols-3 gap-3">
          <MacroMini label="Protein" value={totals.protein} target={proteinTarget} />
          <MacroMini label="Carbs"   value={totals.carbs}   target={carbsTarget} />
          <MacroMini label="Fat"     value={totals.fat}     target={fatTarget} />
        </div>
      </section>

      <AddFoodForm date={date} />

      <div className="space-y-5">
        {MEAL_ORDER.map((m) => {
          const items = grouped[m];
          const mealTotals = sum(items);
          return (
            <section key={m}>
              <div className="flex justify-between items-baseline mb-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted">
                  {MEAL_LABEL[m]}
                </h2>
                {items.length > 0 && (
                  <span className="text-xs text-ink-soft">
                    {Math.round(mealTotals.calories)} kcal
                  </span>
                )}
              </div>

              {items.length === 0 ? (
                <div className="card text-sm text-ink-muted text-center py-4">Nothing logged</div>
              ) : (
                <div className="space-y-2">
                  {items.map((e) => (
                    <div key={e.id} className="card flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">{e.name}</div>
                        <div className="text-xs text-ink-soft">
                          {e.servings !== 1 ? `${e.servings} × ` : ''}
                          {e.serving_size ? `${e.serving_size} · ` : ''}
                          {Math.round((e.calories ?? 0) * (e.servings ?? 1))} kcal
                          {e.protein ? ` · ${Math.round((e.protein ?? 0) * (e.servings ?? 1))}P` : ''}
                          {e.carbs   ? ` · ${Math.round((e.carbs   ?? 0) * (e.servings ?? 1))}C` : ''}
                          {e.fat     ? ` · ${Math.round((e.fat     ?? 0) * (e.servings ?? 1))}F` : ''}
                        </div>
                      </div>
                      <DeleteEntryButton id={e.id} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function MacroBar({ label, value, target, unit }: { label: string; value: number; target: number; unit: string }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  const over = value > target;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-semibold">{label}</span>
        <span className={over ? 'text-red-600 font-semibold' : 'text-ink-soft'}>
          {Math.round(value)} / {target} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full ${over ? 'bg-red-500' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MacroMini({ label, value, target }: { label: string; value: number; target: number }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div className="rounded-xl bg-bg p-3">
      <div className="text-xs text-ink-soft">{label}</div>
      <div className="font-bold text-base">
        {Math.round(value)}
        <span className="text-ink-muted font-normal text-xs"> / {target}g</span>
      </div>
      <div className="h-1 rounded-full bg-ink/[0.06] mt-2 overflow-hidden">
        <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
