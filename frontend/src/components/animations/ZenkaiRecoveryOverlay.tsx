import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SPRINGS } from './springs';
import { useSkippable } from './useSkippable';

interface ZenkaiRecoveryOverlayProps {
  onComplete: () => void;
}

/**
 * Tier 1 exclusive full-screen overlay for Zenkai recovery.
 * Dramatic power-surge visual: flash -> gradient -> "ZENKAI BOOST!" -> subtitle -> welcome.
 * Auto-completes after 3s. Tap-to-skip after 1s (dramatic moment, longer guard).
 */
export function ZenkaiRecoveryOverlay({
  onComplete,
}: ZenkaiRecoveryOverlayProps) {
  const [phase, setPhase] = useState(0);
  const { skip } = useSkippable(1000, onComplete);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 900),
      setTimeout(() => setPhase(4), 1200),
      setTimeout(() => onComplete(), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={skip}
      data-testid="zenkai-recovery-overlay"
    >
      {/* Initial flash */}
      <motion.div
        className="absolute inset-0 bg-cyan-300"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Gradient background */}
      {phase >= 1 && (
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-cyan-600/80 to-blue-900/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Main text */}
        {phase >= 2 && (
          <motion.p
            className="text-4xl font-black text-white text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={SPRINGS.bouncy}
            style={{
              textShadow:
                '0 0 25px rgba(34, 211, 238, 0.8), 0 0 50px rgba(34, 211, 238, 0.4)',
            }}
            data-testid="zenkai-title"
          >
            ZENKAI BOOST!
          </motion.p>
        )}

        {/* Subtitle */}
        {phase >= 3 && (
          <motion.p
            className="text-white/80 text-sm italic text-center max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            A Saiyan grows stronger after every defeat!
          </motion.p>
        )}

        {/* Welcome back */}
        {phase >= 4 && (
          <motion.p
            className="text-white/70 text-xs text-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Welcome back, warrior
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
