import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SPRINGS } from './springs';
import { ScreenShake } from './ScreenShake';
import { ParticleBurst } from './ParticleBurst';
import { useSkippable } from './useSkippable';

interface PerfectDayOverlayProps {
  onComplete: () => void;
}

/**
 * Full-screen Perfect Day (100%) celebration sequence (~2.5s).
 * Choreography: overlay -> shake -> particles -> "100% COMPLETE" -> XP counter -> quote -> fadeout
 * Tap-to-skip after 1s.
 */
export function PerfectDayOverlay({ onComplete }: PerfectDayOverlayProps) {
  const [phase, setPhase] = useState(0);
  const { skip } = useSkippable(1000, onComplete);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),   // shake
      setTimeout(() => setPhase(2), 500),   // particles
      setTimeout(() => setPhase(3), 700),   // text
      setTimeout(() => setPhase(4), 1200),  // XP counter
      setTimeout(() => setPhase(5), 1800),  // quote
      setTimeout(() => onComplete(), 2500), // auto-complete
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={skip}
      data-testid="perfect-day-overlay"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80" />

      <ScreenShake trigger={phase >= 1}>
        <div className="relative z-10 flex flex-col items-center gap-4">
          {/* Particles */}
          {phase >= 2 && (
            <ParticleBurst
              count={20}
              origin={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
              color="bg-warning"
            />
          )}

          {/* 100% COMPLETE text */}
          {phase >= 3 && (
            <motion.div
              className="text-4xl font-black text-warning drop-shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={SPRINGS.bouncy}
              data-testid="perfect-day-title"
            >
              100% COMPLETE
            </motion.div>
          )}

          {/* XP counter */}
          {phase >= 4 && (
            <motion.div
              className="text-lg font-bold text-text-secondary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              PERFECT DAY BONUS!
            </motion.div>
          )}

          {/* Character quote */}
          {phase >= 5 && (
            <motion.div
              className="text-lg text-text-secondary italic mt-4 max-w-xs text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              data-testid="perfect-day-quote"
            >
              &ldquo;Power comes in response to a need, not a desire.&rdquo;
            </motion.div>
          )}
        </div>
      </ScreenShake>
    </motion.div>
  );
}
