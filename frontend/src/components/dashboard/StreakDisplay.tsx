interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
}

export function StreakDisplay({ currentStreak, bestStreak }: StreakDisplayProps) {
  const isNewBest = currentStreak > 0 && currentStreak >= bestStreak;

  return (
    <div className="flex items-center gap-3">
      <span className="text-lg font-bold text-saiyan-500">
        🔥 {currentStreak}
      </span>
      <span className="text-sm text-text-secondary">
        Best: {bestStreak}
      </span>
      {isNewBest && (
        <span className="text-xs text-success font-semibold">NEW BEST!</span>
      )}
    </div>
  );
}
