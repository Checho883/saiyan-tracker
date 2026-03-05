interface DragonBallTrackerProps {
  collected: number;
}

export function DragonBallTracker({ collected }: DragonBallTrackerProps) {
  return (
    <div className="flex items-center justify-center gap-2" data-testid="dragon-ball-tracker">
      {Array.from({ length: 7 }, (_, i) => {
        const isFilled = i < collected;
        return (
          <div
            key={i}
            data-testid="dragon-ball"
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
              isFilled
                ? 'bg-warning border-warning text-space-900'
                : 'border-space-600 text-space-600'
            }`}
            style={
              isFilled
                ? { boxShadow: '0 0 8px var(--color-warning)' }
                : undefined
            }
          >
            {i + 1}★
          </div>
        );
      })}
    </div>
  );
}
