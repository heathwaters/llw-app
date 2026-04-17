import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function updateProfile(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const display_name = String(formData.get('display_name') ?? '').trim() || null;
  const handicap = formData.get('golf_handicap');
  const utr = formData.get('tennis_utr');
  const bw_unit = String(formData.get('bodyweight_unit') ?? 'lb') as 'lb' | 'kg';

  await supabase.from('profiles').update({
    display_name,
    golf_handicap: handicap ? Number(handicap) : null,
    tennis_utr: utr ? Number(utr) : null,
    bodyweight_unit: bw_unit,
  }).eq('id', user.id);

  revalidatePath('/profile');
  revalidatePath('/dashboard');
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Profile</h1>

      <form action={updateProfile} className="card space-y-4">
        <div>
          <label className="label">Display name</label>
          <input className="input" name="display_name" defaultValue={profile?.display_name ?? ''} />
        </div>

        <div>
          <label className="label">Email</label>
          <input className="input" value={user?.email ?? ''} disabled />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Golf handicap</label>
            <input className="input" name="golf_handicap" type="number" step="0.1"
              defaultValue={profile?.golf_handicap ?? ''} placeholder="e.g. 4.2" />
          </div>
          <div>
            <label className="label">Tennis UTR</label>
            <input className="input" name="tennis_utr" type="number" step="0.01"
              defaultValue={profile?.tennis_utr ?? ''} placeholder="e.g. 11.5" />
          </div>
        </div>

        <div>
          <label className="label">Bodyweight unit</label>
          <select className="input" name="bodyweight_unit" defaultValue={profile?.bodyweight_unit ?? 'lb'}>
            <option value="lb">Pounds (lb)</option>
            <option value="kg">Kilograms (kg)</option>
          </select>
        </div>

        <button type="submit" className="btn-primary w-full">Save</button>
      </form>
    </div>
  );
}
