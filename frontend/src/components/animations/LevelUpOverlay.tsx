import { useEffect } from 'react';
import { motion } from 'motion/react';
import { SPRINGS } from './springs';
import { useSkippable } from './useSkippable';

const ATTRIBUTE_COLORS: Record<string, string> = {
  str: 'text-red-400',
  vit: 'text-green-400',
  int: 'text-blue-400',
  ki: 'text-yellow-400',
};

const ATTRIBUTE_GLOWS: Record<string, string> = {
  str: 'rgba(248, 113, 113, 0.6)',
  vit: 'rgba(74, 222, 128, 0.6)',
  int: 'rgba(96, 165, 250, 0.6)',
  ki: 'rgba(250, 204, 21, 0.6)',
};

interface LevelUpOverlayProps {
  attribute: string;
  oldLevel: number;
  newLevel: number;
  title: string | null;
  onComplete: () => void;
}

/**
 * Tier 2 banner overlay for attribute level-ups.
 * Shows attribute name, new level, and DBZ-themed title.
 * Auto-completes after 2.5s. Tap-to-skip after 800ms.
 */
export function LevelUpOverlay({
  attribute,
  newLevel,
  title,
  onComplete,
}: LevelUpOverlayProps) {
  const { skip } = useSkippable(800, onComplete);
  const colorClass = ATTRIBUTE_COLORS[attribute] ?? 'text-saiyan-500';
  const glowColor = ATTRIBUTE_GLOWS[attribute] ?? 'rgba(255, 183, 0, 0.6)';

  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70"
      onClick={skip}
      data-testid="level-up-overlay"
      data-attribute={attribute}
    >
      {/* Attribute name */}
      <motion.p
        className={`text-sm font-bold uppercase tracking-widest ${colorClass}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {attribute.toUpperCase()} Level Up!
      </motion.p>

      {/* Level number */}
      <motion.p
        className={`text-6xl font-black mt-2 ${colorClass}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={SPRINGS.bouncy}
        style={{
          textShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
        }}
        data-testid="level-number"
      >
        {newLevel}
      </motion.p>

      {/* Title */}
      {title && (
        <motion.p
          className="text-white text-lg font-semibold mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          data-testid="level-title"
        >
          {title}
        </motion.p>
      )}

      {/* Motivational quote */}
      <motion.p
        className="text-white/50 text-xs mt-4 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      >
        A Saiyan always breaks their limits!
      </motion.p>
    </div>
  );
}
