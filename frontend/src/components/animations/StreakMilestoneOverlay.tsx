import { useEffect } from 'react';
import { motion } from 'motion/react';
import { SPRINGS } from './springs';
import { useSkippable } from './useSkippable';

interface StreakMilestoneOverlayProps {
  tier: number;
  streak: number;
  scope: string;
  badgeName: string;
  onComplete: () => void;
}

/**
 * Tier 2 banner overlay for streak milestones.
 * Shows badge name, streak count, and scope.
 * Auto-completes after 2.5s. Tap-to-skip after 800ms.
 */
export function StreakMilestoneOverlay({
  tier,
  streak,
  scope,
  badgeName,
  onComplete,
}: StreakMilestoneOverlayProps) {
  const { skip } = useSkippable(800, onComplete);

  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70"
      onClick={skip}
      data-testid="streak-milestone-overlay"
      data-tier={tier}
    >
      {/* Badge name */}
      <motion.p
        className="text-saiyan-500 text-2xl font-black"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={SPRINGS.bouncy}
        style={{
          textShadow:
            '0 0 15px rgba(255, 183, 0, 0.5), 0 0 30px rgba(255, 183, 0, 0.2)',
        }}
        data-testid="badge-name"
      >
        {badgeName}
      </motion.p>

      {/* Streak count */}
      <motion.div
        className="flex items-center gap-2 mt-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <span className="text-4xl">{'🔥'}</span>
        <p className="text-white text-3xl font-bold">{streak}</p>
        <span className="text-4xl">{'🔥'}</span>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        className="text-white/70 text-sm mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        {streak} Day {scope === 'habit' ? 'Habit ' : ''}Streak!
      </motion.p>
    </div>
  );
}
