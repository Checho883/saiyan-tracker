import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for tap-to-skip behavior with minimum duration guard.
 * Prevents accidental skips during the first `minDurationMs` of an animation.
 */
export function useSkippable(minDurationMs: number, onSkip: () => void) {
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), minDurationMs);
    return () => clearTimeout(timer);
  }, [minDurationMs]);

  const skip = useCallback(() => {
    if (canSkip) onSkip();
  }, [canSkip, onSkip]);

  return { canSkip, skip: canSkip ? skip : undefined };
}
