import { motion } from 'motion/react';

interface DragonBallTrajectoryProps {
  count: number;
  onComplete: () => void;
}

/**
 * Dragon Ball earned animation: golden ball arcs from center
 * upward toward the tracker position.
 */
export function DragonBallTrajectory({
  count,
  onComplete,
}: DragonBallTrajectoryProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      data-testid="dragon-ball-trajectory"
    >
      <motion.div
        className="absolute w-10 h-10 rounded-full bg-warning border-2 border-yellow-300 flex items-center justify-center text-xs font-bold text-space-900"
        style={{
          left: '50%',
          top: '50%',
          marginLeft: -20,
          marginTop: -20,
          boxShadow: '0 0 12px var(--color-warning)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          x: [0, -30, -20, 0],
          y: [0, -80, -150, -200],
          scale: [0, 1.2, 1, 0.8],
          opacity: [0, 1, 1, 0.6],
        }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        onAnimationComplete={onComplete}
        data-testid="dragon-ball"
      >
        {count}★
      </motion.div>
    </motion.div>
  );
}
