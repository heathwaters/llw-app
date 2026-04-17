import { createClient } from '@/lib/supabase/server';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

export default async function StatsPage() {
  const supabase = await createClient();

  const since = format(subDays(new Date(), 28), 'yyyy-MM-dd');
  const { data: sessions } = await supabase
    .from('sessions').select('session_type, session_date, duration_minutes')
    .gte('session_date', since);

  const total = sessions?.length ?? 0;
  const totalMins = sessions?.reduce((s, x) => s + (x.duration_minutes ?? 0), 0) ?? 0;

  // Counts by type
  const byType: Record<string, number> = {};
  sessions?.forEach((s) => { byType[s.session_type] = (byType[s.session_type] ?? 0) + 1; });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Stats</h1>

      <div className="card">
        <p className="label">Last 28 days</p>
        <div className="flex gap-6 mt-2">
          <div>
            <div className="text-3xl font-bold">{total}</div>
            <div className="text-xs text-ink-soft">Sessions</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{totalMins}</div>
            <div className="text-xs text-ink-soft">Total minutes</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{Math.round(total / 4)}</div>
            <div className="text-xs text-ink-soft">Avg / week</div>
          </div>
        </div>
      </div>

      {Object.keys(byType).length > 0 && (
        <div className="card">
          <p className="label">By type</p>
          <div className="space-y-2 mt-3">
            {Object.entries(byType).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <div className="text-sm font-semibold capitalize w-32">{type.replace('_', ' ')}</div>
                <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full"
                    style={{ width: `${(count / total) * 100}%` }} />
                </div>
                <div className="text-xs font-semibold text-ink-soft w-8 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card text-center py-8 text-sm text-ink-soft">
        Charts (volume trends, PR tracking, handicap progression) coming next.
      </div>
    </div>
  );
}
