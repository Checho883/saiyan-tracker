import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SPRINGS } from './springs';

const tierDisplayMap: Record<string, { text: string; colorClass: string }> = {
  kaioken_x3: { text: 'Kaio-ken x3!', colorClass: 'text-saiyan-500' },
  kaioken_x10: { text: 'Kaio-ken x10!', colorClass: 'text-aura-500' },
};

interface TierChangeBannerProps {
  tier: string;
  onDismiss?: () => void;
}

/**
 * Inline tier change banner that shows at 50%/80% thresholds.
 * NOT queued — renders directly on HeroSection area.
 * Auto-dismisses after 1.5s.
 */
export function TierChangeBanner({ tier, onDismiss }: TierChangeBannerProps) {
  const [visible, setVisible] = useState(false);
  const display = tierDisplayMap[tier];

  useEffect(() => {
    if (!display) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [tier, display, onDismiss]);

  if (!display) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-testid="tier-change-banner"
          className={`absolute top-2 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full bg-space-800/90 font-bold text-sm ${display.colorClass}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={SPRINGS.bouncy}
        >
          {display.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
