import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { deleteSession } from '../../log/actions';
import { AddExerciseForm } from './add-exercise-form';
import { SetsEditor } from './sets-editor';
import { GolfRoundForm } from './golf-round-form';
import type { Exercise, ExerciseSet, Profile, SessionExercise } from '@/lib/database.types';

const STRENGTH_TYPES = new Set(['strength', 'power', 'cardio', 'agility']);

type SessionExerciseWithRelations = SessionExercise & {
  exercises: Pick<Exercise, 'id' | 'name' | 'category' | 'primary_muscle'>;
  exercise_sets: ExerciseSet[];
};

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('sessions').select('*').eq('id', id).single();
  if (!session) notFound();

  const { data: profile } = await supabase
    .from('profiles').select('bodyweight_unit').eq('id', session.user_id).single<Pick<Profile, 'bodyweight_unit'>>();

  const showExercises = STRENGTH_TYPES.has(session.session_type);
  const isGolfRound = session.session_type === 'golf_round';

  const [sessionExercisesResult, libraryResult, golfResult] = await Promise.all([
    showExercises
      ? supabase
          .from('session_exercises')
          .select('*, exercises(id,name,category,primary_muscle), exercise_sets(*)')
          .eq('session_id', id)
          .order('sort_order', { ascending: true })
      : Promise.resolve({ data: null }),
    showExercises
      ? supabase
          .from('exercises')
          .select('id,name,category,primary_muscle')
          .order('name', { ascending: true })
      : Promise.resolve({ data: null }),
    isGolfRound
      ? supabase.from('golf_rounds').select('*').eq('session_id', id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const sessionExercises =
    (sessionExercisesResult.data as SessionExerciseWithRelations[] | null) ?? [];
  const exerciseLibrary =
    (libraryResult.data as Pick<Exercise, 'id' | 'name' | 'category' | 'primary_muscle'>[] | null) ?? [];
  const golfRound = golfResult.data as Parameters<typeof GolfRoundForm>[0]['round'] | null;

  return (
    <div className="space-y-5">
      <Link href="/sessions" className="text-xs font-semibold text-ink-soft hover:text-ink">← All sessions</Link>

      <div className="card space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            {session.session_type.replace('_', ' ')}
          </p>
          <h1 className="text-2xl font-bold mt-1">{session.title || 'Untitled session'}</h1>
          <p className="text-sm text-ink-soft mt-1">
            {format(parseISO(session.session_date), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {session.duration_minutes && (
            <Stat label="Duration" value={`${session.duration_minutes} min`} />
          )}
          {session.rpe && <Stat label="RPE" value={`${session.rpe} / 10`} />}
        </div>

        {session.notes && (
          <div className="pt-2">
            <p className="label">Notes</p>
            <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{session.notes}</p>
          </div>
        )}
      </div>

      {showExercises && (
        <section className="space-y-3">
          <h2 className="font-bold text-lg">Exercises</h2>

          {sessionExercises.length === 0 ? (
            <p className="text-sm text-ink-soft">No exercises yet — add one below.</p>
          ) : (
            sessionExercises.map((se) => {
              const sortedSets = [...(se.exercise_sets ?? [])].sort(
                (a, b) => a.set_number - b.set_number,
              );
              return (
                <SetsEditor
                  key={se.id}
                  sessionId={id}
                  sessionExerciseId={se.id}
                  exerciseName={se.exercises.name}
                  category={se.exercises.category}
                  sets={sortedSets}
                  defaultWeightUnit={profile?.bodyweight_unit ?? 'lb'}
                />
              );
            })
          )}

          <AddExerciseForm sessionId={id} exercises={exerciseLibrary} />
        </section>
      )}

      {isGolfRound && <GolfRoundForm sessionId={id} round={golfRound} />}

      <form action={async () => { 'use server'; await deleteSession(id); }}>
        <button className="btn-secondary w-full text-red-600 hover:bg-red-50 hover:border-red-200">
          Delete this session
        </button>
      </form>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg p-3">
      <div className="text-xs text-ink-soft">{label}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}
