import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useStatusStore } from '../../store/statusStore';
import { useAudio } from '../../audio/useAudio';

/**
 * Dismissible streak-break acknowledgment card.
 * Shows when StatusResponse has streak_breaks with entries.
 * Zenkai theme (orange border) with encouraging Saiyan message.
 */
export function StreakBreakCard() {
  const status = useStatusStore((s) => s.status);
  const isLoaded = useStatusStore((s) => s.isLoaded);
  const [dismissed, setDismissed] = useState(false);
  const { play } = useAudio();

  // Play power_up sound when card first appears
  useEffect(() => {
    if (isLoaded && status?.streak_breaks?.length) {
      play('power_up');
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded || !status?.streak_breaks?.length || dismissed) {
    return null;
  }

  const breakCount = status.streak_breaks.length;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className="mx-4 mt-2 mb-2 rounded-xl border border-orange-500/50 bg-space-800 p-4 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, marginTop: 0, padding: 0 }}
          transition={{ duration: 0.3 }}
          data-testid="streak-break-card"
        >
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <p className="text-text-primary text-sm font-semibold mb-1">
            {breakCount} streak{breakCount !== 1 ? 's' : ''} broken
          </p>

          {/* Encouraging quote */}
          <p className="text-text-secondary text-xs italic mb-3">
            &ldquo;A Saiyan grows stronger after every defeat.&rdquo;
          </p>

          {/* Break details */}
          <ul className="space-y-1 mb-3">
            {status.streak_breaks.map((b) => (
              <li key={b.habit_id} className="text-text-secondary text-xs">
                {b.habit_title}: {b.old_streak} day streak &rarr; {b.halved_value} (Zenkai)
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={() => setDismissed(true)}
            className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
          >
            Get Back Up
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
