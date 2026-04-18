'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function assertOwnsSession(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: 'Not signed in' as const };
  const { data: session } = await supabase
    .from('sessions').select('id,user_id').eq('id', sessionId).single();
  if (!session || session.user_id !== user.id) {
    return { supabase, error: 'Not found' as const };
  }
  return { supabase, user, session };
}

function num(v: FormDataEntryValue | null): number | null {
  if (v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function addExerciseToSession(formData: FormData) {
  const sessionId = String(formData.get('session_id') ?? '');
  const exerciseId = String(formData.get('exercise_id') ?? '');
  if (!sessionId || !exerciseId) return { error: 'Missing fields' };

  const ctx = await assertOwnsSession(sessionId);
  if (ctx.error) return { error: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('session_exercises')
    .select('sort_order')
    .eq('session_id', sessionId)
    .order('sort_order', { ascending: false })
    .limit(1);
  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await ctx.supabase.from('session_exercises').insert({
    session_id: sessionId,
    exercise_id: exerciseId,
    sort_order: nextOrder,
  });
  if (error) return { error: error.message };

  revalidatePath(`/sessions/${sessionId}`);
  return { ok: true };
}

export async function removeSessionExercise(id: string, sessionId: string) {
  const ctx = await assertOwnsSession(sessionId);
  if (ctx.error) return { error: ctx.error };
  const { error } = await ctx.supabase.from('session_exercises').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/sessions/${sessionId}`);
}

export async function addSet(formData: FormData) {
  const sessionExerciseId = String(formData.get('session_exercise_id') ?? '');
  const sessionId = String(formData.get('session_id') ?? '');
  if (!sessionExerciseId || !sessionId) return { error: 'Missing fields' };

  const ctx = await assertOwnsSession(sessionId);
  if (ctx.error) return { error: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('exercise_sets').select('set_number')
    .eq('session_exercise_id', sessionExerciseId)
    .order('set_number', { ascending: false })
    .limit(1);
  const setNumber = (existing?.[0]?.set_number ?? 0) + 1;

  const weight_unit = (String(formData.get('weight_unit') ?? 'lb') as 'lb' | 'kg');
  const { error } = await ctx.supabase.from('exercise_sets').insert({
    session_exercise_id: sessionExerciseId,
    set_number: setNumber,
    weight: num(formData.get('weight')),
    weight_unit,
    reps: num(formData.get('reps')),
    duration_seconds: num(formData.get('duration_seconds')),
    distance_meters: num(formData.get('distance_meters')),
    rpe: num(formData.get('rpe')),
    is_warmup: formData.get('is_warmup') === 'on',
  });
  if (error) return { error: error.message };

  revalidatePath(`/sessions/${sessionId}`);
  return { ok: true };
}

export async function removeSet(id: string, sessionId: string) {
  const ctx = await assertOwnsSession(sessionId);
  if (ctx.error) return { error: ctx.error };
  const { error } = await ctx.supabase.from('exercise_sets').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/sessions/${sessionId}`);
}

export async function upsertGolfRound(formData: FormData) {
  const sessionId = String(formData.get('session_id') ?? '');
  if (!sessionId) return { error: 'Missing session' };

  const ctx = await assertOwnsSession(sessionId);
  if (ctx.error) return { error: ctx.error };

  const payload = {
    session_id: sessionId,
    course_name: (String(formData.get('course_name') ?? '').trim() || null),
    tees: (String(formData.get('tees') ?? '').trim() || null),
    course_rating: num(formData.get('course_rating')),
    slope_rating: num(formData.get('slope_rating')),
    holes_played: num(formData.get('holes_played')) ?? 18,
    total_score: num(formData.get('total_score')),
    total_putts: num(formData.get('total_putts')),
    fairways_hit: num(formData.get('fairways_hit')),
    fairways_possible: num(formData.get('fairways_possible')),
    greens_in_regulation: num(formData.get('greens_in_regulation')),
    weather: (String(formData.get('weather') ?? '').trim() || null),
    conditions_notes: (String(formData.get('conditions_notes') ?? '').trim() || null),
  };

  const { error } = await ctx.supabase
    .from('golf_rounds')
    .upsert(payload, { onConflict: 'session_id' });
  if (error) return { error: error.message };

  revalidatePath(`/sessions/${sessionId}`);
  return { ok: true };
}
