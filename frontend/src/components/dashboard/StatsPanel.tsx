import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { usePowerStore } from '../../store/powerStore';
import { useHabitStore } from '../../store/habitStore';
import { AttributeGrid } from './AttributeGrid';
import { DragonBallTracker } from './DragonBallTracker';
import { StreakDisplay } from './StreakDisplay';

export function StatsPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const dragonBallsCollected = usePowerStore((s) => s.dragonBallsCollected);
  const todayHabits = useHabitStore((s) => s.todayHabits);

  const { currentStreak, bestStreak } = useMemo(() => {
    if (todayHabits.length === 0) return { currentStreak: 0, bestStreak: 0 };
    return {
      currentStreak: Math.max(...todayHabits.map((h) => h.streak_current)),
      bestStreak: Math.max(...todayHabits.map((h) => h.streak_best)),
    };
  }, [todayHabits]);

  return (
    <div className="bg-space-800/50 rounded-xl px-4 py-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full"
      >
        <span className="text-text-primary text-sm font-semibold">Stats</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        )}
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isExpanded ? '500px' : '0px' }}
      >
        <div className="flex flex-col gap-4 mt-3">
          <AttributeGrid />
          <DragonBallTracker collected={dragonBallsCollected} />
          <StreakDisplay currentStreak={currentStreak} bestStreak={bestStreak} />
        </div>
      </div>
    </div>
  );
}
