import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { SPRINGS } from './springs';
import { ParticleBurst } from './ParticleBurst';
import { useSkippable } from './useSkippable';
import { useRewardStore } from '../../store/rewardStore';

interface ShenronCeremonyProps {
  onComplete: () => void;
}

/**
 * Shenron summoning ceremony (~4.5s).
 * Sky darkens -> lightning -> Shenron scales up -> wish text -> balls scatter -> reset.
 * Enforces minimum 1 active wish before allowing ceremony (ANIM-09).
 */
export function ShenronCeremony({ onComplete }: ShenronCeremonyProps) {
  const wishes = useRewardStore(useShallow((s) => s.wishes));
  const activeWishes = wishes.filter((w) => w.is_active);
  const [phase, setPhase] = useState(0);
  const { skip } = useSkippable(1000, onComplete);

  useEffect(() => {
    // Don't start ceremony if no active wishes
    if (activeWishes.length === 0) return;

    const timers = [
      setTimeout(() => setPhase(1), 400),   // lightning
      setTimeout(() => setPhase(2), 1000),  // shenron
      setTimeout(() => setPhase(3), 1500),  // wish text
      setTimeout(() => setPhase(4), 2500),  // particles
      setTimeout(() => setPhase(5), 3500),  // scatter
      setTimeout(() => onComplete(), 4500), // auto-complete
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete, activeWishes.length]);

  // ANIM-09: No active wishes — show warning
  if (activeWishes.length === 0) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        data-testid="shenron-no-wishes"
      >
        <div className="flex flex-col items-center gap-4 p-6">
          <div className="text-xl font-bold text-warning">No Active Wishes!</div>
          <div className="text-text-secondary text-center max-w-xs">
            Set an active wish in Settings first before summoning Shenron.
          </div>
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-saiyan-500 text-white rounded-lg hover:bg-saiyan-600 transition-colors"
            data-testid="shenron-dismiss"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={skip}
      data-testid="shenron-ceremony"
    >
      {/* Sky darkens */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/95 to-black/95"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Lightning flashes */}
      {phase >= 1 && phase < 3 && (
        <motion.div
          className="absolute inset-0 bg-white"
          animate={{ opacity: [0, 1, 0, 0.8, 0, 0.6, 0] }}
          transition={{ duration: 0.6 }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Shenron */}
        {phase >= 2 && (
          <motion.div
            className="text-6xl"
            initial={{ y: 200, scale: 0.5, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={SPRINGS.gentle}
            data-testid="shenron-dragon"
          >
            🐉
          </motion.div>
        )}

        {/* Wish granted text */}
        {phase >= 3 && (
          <motion.div
            className="text-xl font-bold text-warning text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            data-testid="shenron-wish-text"
          >
            Your wish has been granted!
          </motion.div>
        )}

        {/* Particles */}
        {phase >= 4 && (
          <ParticleBurst
            count={15}
            origin={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
            color="bg-warning"
          />
        )}

        {/* Dragon Balls scatter */}
        {phase >= 5 && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 7 }, (_, i) => {
              const angle = (Math.PI * 2 * i) / 7;
              const distance = 150 + Math.random() * 100;
              return (
                <motion.div
                  key={i}
                  className="absolute w-6 h-6 rounded-full bg-warning border border-yellow-300 flex items-center justify-center text-xs font-bold text-space-900"
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: -12,
                    marginTop: -12,
                  }}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  {i + 1}★
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
