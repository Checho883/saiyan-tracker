import { Trophy } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';

const RANK_COLORS: Record<number, string> = {
  1: 'text-yellow-400',
  2: 'text-gray-300',
  3: 'text-amber-600',
};

export function StreakRankings() {
  const habits = useHabitStore((s) => s.todayHabits);

  const ranked = habits
    .filter((h) => h.is_active !== false && h.streak_current > 0)
    .sort((a, b) => b.streak_current - a.streak_current);

  return (
    <div className="bg-space-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-saiyan-500" />
        <h3 className="text-sm font-semibold text-text-primary">Power Rankings</h3>
      </div>

      {ranked.length === 0 ? (
        <p className="text-sm text-text-muted">No active streaks yet</p>
      ) : (
        <div className="space-y-2">
          {ranked.map((habit, index) => {
            const rank = index + 1;
            const rankColor = RANK_COLORS[rank] ?? 'text-text-muted';

            return (
              <div key={habit.id} className="flex items-center gap-3">
                <span
                  data-testid="streak-rank"
                  className={`text-lg font-bold font-mono w-6 text-center ${rankColor}`}
                >
                  {rank}
                </span>
                <span className="text-base">{habit.icon_emoji}</span>
                <span
                  data-testid="streak-habit-title"
                  className="flex-1 text-sm text-text-primary truncate"
                >
                  {habit.title}
                </span>
                <span className="text-sm font-mono text-saiyan-400">
                  {habit.streak_current}d
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
