'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { MealType } from '@/lib/database.types';

const VALID_MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

function num(v: FormDataEntryValue | null, fallback: number | null = null): number | null {
  if (v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function addFoodEntry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const meal = String(formData.get('meal') ?? '') as MealType;
  if (!VALID_MEALS.includes(meal)) return { error: 'Invalid meal' };

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Name is required' };

  const log_date = String(formData.get('log_date') ?? new Date().toISOString().slice(0, 10));
  const serving_size = String(formData.get('serving_size') ?? '').trim() || null;
  const servings = num(formData.get('servings'), 1) ?? 1;
  const calories = num(formData.get('calories'), 0) ?? 0;
  const protein = num(formData.get('protein'), 0);
  const carbs = num(formData.get('carbs'), 0);
  const fat = num(formData.get('fat'), 0);
  const fiber = num(formData.get('fiber'), 0);

  const { error } = await supabase.from('food_entries').insert({
    user_id: user.id,
    log_date, meal, name, serving_size, servings,
    calories, protein, carbs, fat, fiber,
  });

  if (error) return { error: error.message };

  revalidatePath('/food');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function deleteFoodEntry(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('food_entries').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/food');
  revalidatePath('/dashboard');
}
