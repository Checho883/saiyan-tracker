import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useSkippable } from './useSkippable';

interface PowerMilestoneOverlayProps {
  milestone: number;
  onComplete: () => void;
}

function formatMilestone(n: number): string {
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

/**
 * Full-screen overlay celebrating a power level milestone crossing.
 * Tier 1 exclusive animation — plays through the animation queue.
 */
export function PowerMilestoneOverlay({
  milestone,
  onComplete,
}: PowerMilestoneOverlayProps) {
  const { skip } = useSkippable(800, onComplete);

  // Auto-complete after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80"
      onClick={skip}
      data-testid="power-milestone-overlay"
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <p className="text-white text-sm font-medium uppercase tracking-widest mb-2">
          Power Level
        </p>
        <motion.p
          className="text-saiyan-500 text-6xl font-black"
          initial={{ scale: 0.5 }}
          animate={{ scale: [0.5, 1.2, 1] }}
          transition={{ duration: 0.6, times: [0, 0.6, 1] }}
          style={{
            textShadow:
              '0 0 20px rgba(255, 183, 0, 0.6), 0 0 40px rgba(255, 183, 0, 0.3)',
          }}
          data-testid="milestone-number"
        >
          {formatMilestone(milestone)}
        </motion.p>
        <motion.p
          className="text-white/70 text-sm mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Milestone reached!
        </motion.p>
      </motion.div>
    </div>
  );
}
