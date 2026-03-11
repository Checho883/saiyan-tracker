import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useSkippable } from './useSkippable';
import { ScreenShake } from './ScreenShake';
import { useAudio } from '../../audio/useAudio';

interface PowerMilestoneOverlayProps {
  milestone: number;
  onComplete: () => void;
}

function formatMilestone(n: number): string {
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

export function getEscalationTier(milestone: number): 'standard' | 'shake' | 'epic' | 'legendary' {
  if (milestone >= 100000) return 'legendary';
  if (milestone >= 25000) return 'epic';
  if (milestone >= 5000) return 'shake';
  return 'standard';
}

const subtitleMap: Record<ReturnType<typeof getEscalationTier>, string> = {
  standard: 'Milestone reached!',
  shake: 'Power surging!',
  epic: 'INCREDIBLE POWER!',
  legendary: 'OVER 100,000!!!',
};

/**
 * Full-screen overlay celebrating a power level milestone crossing.
 * Tier 1 exclusive animation — plays through the animation queue.
 * Escalating intensity: standard < shake < epic < legendary.
 */
export function PowerMilestoneOverlay({
  milestone,
  onComplete,
}: PowerMilestoneOverlayProps) {
  const tier = getEscalationTier(milestone);
  const { play } = useAudio();

  // Epic/legendary get longer display time
  const duration = tier === 'epic' || tier === 'legendary' ? 4000 : 3000;

  const { skip } = useSkippable(800, onComplete);

  // Auto-complete after duration
  useEffect(() => {
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  // Play thunder_roar for legendary tier (overrides default explosion from EVENT_SOUND_MAP)
  useEffect(() => {
    if (tier === 'legendary') {
      play('thunder_roar');
    }
  }, [tier, play]);

  const isLegendary = tier === 'legendary';
  const textColorClass = isLegendary ? 'text-yellow-400' : 'text-saiyan-500';
  const glowStyle = isLegendary
    ? '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)'
    : '0 0 20px rgba(255, 183, 0, 0.6), 0 0 40px rgba(255, 183, 0, 0.3)';

  const content = (
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
          className={`${textColorClass} text-6xl font-black`}
          initial={{ scale: 0.5 }}
          animate={{ scale: [0.5, 1.2, 1] }}
          transition={{ duration: 0.6, times: [0, 0.6, 1] }}
          style={{ textShadow: glowStyle }}
          data-testid="milestone-number"
        >
          {formatMilestone(milestone)}
        </motion.p>
        <motion.p
          className="text-white/70 text-sm mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          data-testid="milestone-subtitle"
        >
          {subtitleMap[tier]}
        </motion.p>
      </motion.div>
    </div>
  );

  // Wrap in ScreenShake for shake/epic/legendary tiers
  if (tier !== 'standard') {
    return <ScreenShake trigger={true}>{content}</ScreenShake>;
  }

  return content;
}
