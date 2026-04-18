// Hand-written to match supabase/migrations/0001_init.sql and 0002_food_log.sql.
// Regenerate with: supabase gen types typescript --project-id YOUR_REF > src/lib/database.types.ts

export type SessionType =
  | 'strength' | 'cardio' | 'power' | 'agility'
  | 'golf_practice' | 'golf_round'
  | 'tennis_practice' | 'tennis_match'
  | 'recovery' | 'rest';

export type ExerciseCategory =
  | 'strength' | 'power' | 'cardio' | 'mobility' | 'agility' | 'plyometric';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Profile = {
  id: string;
  display_name: string | null;
  bodyweight_unit: 'lb' | 'kg';
  golf_handicap: number | null;
  tennis_utr: number | null;
  cal_target: number | null;
  protein_target: number | null;
  carbs_target: number | null;
  fat_target: number | null;
  bodyweight_goal: number | null;
  created_at: string;
};

export type Exercise = {
  id: string;
  owner_id: string | null;
  name: string;
  category: ExerciseCategory;
  primary_muscle: string | null;
  is_unilateral: boolean;
  is_rotational: boolean;
  notes: string | null;
  created_at: string;
};

export type Session = {
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
};

export type SessionExercise = {
  id: string;
  session_id: string;
  exercise_id: string;
  sort_order: number;
  notes: string | null;
};

export type ExerciseSet = {
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
};

export type DailyMetric = {
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
  water_l: number | null;
  mobility: string | null;
  notes: string | null;
};

export type FoodEntry = {
  id: string;
  user_id: string;
  log_date: string;
  meal: MealType;
  name: string;
  serving_size: string | null;
  servings: number;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  is_custom: boolean;
  created_at: string;
};

export type GolfRound = {
  id: string;
  session_id: string;
  course_name: string | null;
  tees: string | null;
  course_rating: number | null;
  slope_rating: number | null;
  holes_played: number | null;
  total_score: number | null;
  total_putts: number | null;
  fairways_hit: number | null;
  fairways_possible: number | null;
  greens_in_regulation: number | null;
  weather: string | null;
  conditions_notes: string | null;
};

export type TennisSession = {
  id: string;
  session_id: string;
  is_match: boolean;
  opponent_name: string | null;
  opponent_utr: number | null;
  surface: 'hard' | 'clay' | 'grass' | 'indoor' | null;
  score: string | null;
  result: 'win' | 'loss' | 'draw' | null;
  serve_speed_max_mph: number | null;
  notes: string | null;
};

type Table<Row, RequiredInsertKeys extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, RequiredInsertKeys>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      profiles: Table<Profile, 'id'>;
      exercises: Table<Exercise, 'name' | 'category'>;
      sessions: Table<Session, 'user_id' | 'session_type'>;
      session_exercises: Table<SessionExercise, 'session_id' | 'exercise_id'>;
      exercise_sets: Table<ExerciseSet, 'session_exercise_id' | 'set_number'>;
      daily_metrics: Table<DailyMetric, 'user_id' | 'metric_date'>;
      food_entries: Table<FoodEntry, 'user_id' | 'meal' | 'name' | 'calories'>;
      golf_rounds: Table<GolfRound, 'session_id'>;
      tennis_sessions: Table<TennisSession, 'session_id'>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
