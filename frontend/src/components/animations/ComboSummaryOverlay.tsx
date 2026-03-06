import { useEffect } from 'react';
import { motion } from 'motion/react';
import { SPRINGS } from './springs';
import type { AnimationEvent } from '../../store/uiStore';

interface ComboSummaryOverlayProps {
  events: AnimationEvent[];
  totalCount: number; // Total combo count (including the one that played individually)
  onComplete: () => void;
}

/** Format event for display in combo summary */
function eventLabel(event: AnimationEvent): string {
  switch (event.type) {
    case 'perfect_day':
      return 'Perfect Day!';
    case 'capsule_drop':
      return `Capsule Drop: ${event.rewardTitle}`;
    case 'tier_change':
      return `Tier Up: ${event.tier.replace(/_/g, ' ')}`;
    default:
      return event.type.replace(/_/g, ' ');
  }
}

/**
 * Combo Summary Overlay — shown when 3+ banner-tier events fire simultaneously.
 * The highest-priority banner event plays its full overlay first, then this
 * component shows the remaining batched events as a list.
 * Auto-dismisses after ~3 seconds.
 */
export function ComboSummaryOverlay({
  events,
  totalCount,
  onComplete,
}: ComboSummaryOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      data-testid="combo-summary-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-space-900/95"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={SPRINGS.bouncy}
    >
      <div className="text-center space-y-4 px-6">
        {/* Header with energy burst styling */}
        <motion.h2
          className="text-4xl font-black text-saiyan-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...SPRINGS.bouncy, delay: 0.1 }}
        >
          COMBO x{totalCount}!
        </motion.h2>

        {/* Energy burst ring */}
        <motion.div
          className="w-24 h-24 mx-auto rounded-full border-2 border-aura-500/50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1], opacity: [0, 0.8, 0.3] }}
          transition={{ duration: 0.6, delay: 0.15 }}
        />

        {/* Batched event list */}
        <div className="space-y-2">
          {events.map((event, idx) => (
            <motion.div
              key={`${event.type}-${idx}`}
              className="text-sm text-text-secondary"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
            >
              {eventLabel(event)}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
