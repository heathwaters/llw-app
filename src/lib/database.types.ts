// Auto-generated from schema. Re-generate with: supabase gen types typescript
// For now this is hand-written to match supabase/migrations/0001_init.sql

export type SessionType =
  | 'strength' | 'cardio' | 'power' | 'agility'
  | 'golf_practice' | 'golf_round'
  | 'tennis_practice' | 'tennis_match'
  | 'recovery' | 'rest';

export type ExerciseCategory =
  | 'strength' | 'power' | 'cardio' | 'mobility' | 'agility' | 'plyometric';

export interface Profile {
  id: string;
  display_name: string | null;
  bodyweight_unit: 'lb' | 'kg';
  golf_handicap: number | null;
  tennis_utr: number | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  owner_id: string | null;
  name: string;
  category: ExerciseCategory;
  primary_muscle: string | null;
  is_unilateral: boolean;
  is_rotational: boolean;
  notes: string | null;
}

export interface Session {
  id: string;
  user_id: string;
  session_date: string;
  session_type: SessionType;
  title: string | null;
  duration_minutes: number | null;
  rpe: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  sort_order: number;
  notes: string | null;
}

export interface ExerciseSet {
  id: string;
  session_exercise_id: string;
  set_number: number;
  weight: number | null;
  weight_unit: 'lb' | 'kg';
  reps: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  rpe: number | null;
  is_warmup: boolean;
}

export interface DailyMetric {
  id: string;
  user_id: string;
  metric_date: string;
  bodyweight: number | null;
  sleep_hours: number | null;
  hrv_ms: number | null;
  resting_hr: number | null;
  soreness: number | null;
  energy: number | null;
  stress: number | null;
  notes: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      exercises: { Row: Exercise; Insert: Partial<Exercise> & { name: string; category: ExerciseCategory }; Update: Partial<Exercise> };
      sessions: { Row: Session; Insert: Partial<Session> & { user_id: string; session_type: SessionType }; Update: Partial<Session> };
      session_exercises: { Row: SessionExercise; Insert: Omit<SessionExercise, 'id'>; Update: Partial<SessionExercise> };
      exercise_sets: { Row: ExerciseSet; Insert: Omit<ExerciseSet, 'id'>; Update: Partial<ExerciseSet> };
      daily_metrics: { Row: DailyMetric; Insert: Partial<DailyMetric> & { user_id: string }; Update: Partial<DailyMetric> };
    };
  };
}
