'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { SessionType } from '@/lib/database.types';

export async function createSession(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const session_type = String(formData.get('session_type') ?? '') as SessionType;
  const session_date = String(formData.get('session_date') ?? new Date().toISOString().slice(0,10));
  const title = (String(formData.get('title') ?? '').trim() || null);
  const duration_minutes = formData.get('duration_minutes') ? Number(formData.get('duration_minutes')) : null;
  const rpe = formData.get('rpe') ? Number(formData.get('rpe')) : null;
  const notes = (String(formData.get('notes') ?? '').trim() || null);

  const { data, error } = await supabase
    .from('sessions')
    .insert({ user_id: user.id, session_type, session_date, title, duration_minutes, rpe, notes })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message ?? 'Failed to create session' };

  revalidatePath('/dashboard');
  revalidatePath('/sessions');
  redirect(`/sessions/${data.id}`);
}

export async function deleteSession(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/sessions');
  redirect('/sessions');
}
