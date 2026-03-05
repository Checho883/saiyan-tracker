import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SPRINGS } from './springs';

const rarityGlow: Record<string, string> = {
  common: '0 0 12px 4px rgba(255, 255, 255, 0.4)',
  rare: '0 0 16px 6px rgba(59, 130, 246, 0.6)',
  epic: '0 0 20px 8px rgba(168, 85, 247, 0.7)',
};

const rarityColor: Record<string, string> = {
  common: 'border-gray-300 text-gray-300',
  rare: 'border-blue-400 text-blue-400',
  epic: 'border-purple-400 text-purple-400',
};

interface CapsuleDropOverlayProps {
  rewardTitle: string;
  rarity: string;
  onComplete: () => void;
}

/**
 * Capsule drop overlay: bounces in center-screen, pulses invitingly,
 * tap triggers 3D card flip (rotateY) revealing reward with rarity glow.
 * Auto-dismiss 4s after reveal or tap after 1.5s minimum display.
 */
export function CapsuleDropOverlay({
  rewardTitle,
  rarity,
  onComplete,
}: CapsuleDropOverlayProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [canDismiss, setCanDismiss] = useState(false);

  // Auto-dismiss 4s after reveal
  useEffect(() => {
    if (!isRevealed) return;
    const dismissTimer = setTimeout(() => setCanDismiss(true), 1500);
    const autoTimer = setTimeout(onComplete, 4000);
    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(autoTimer);
    };
  }, [isRevealed, onComplete]);

  const handleTap = () => {
    if (!isRevealed) {
      setIsRevealed(true);
    } else if (canDismiss) {
      onComplete();
    }
  };

  const glowStyle = rarityGlow[rarity] || rarityGlow.common;
  const colorClass = rarityColor[rarity] || rarityColor.common;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      onClick={handleTap}
      data-testid="capsule-drop-overlay"
    >
      <div style={{ perspective: 800 }}>
        <motion.div
          className="relative w-32 h-40"
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          transition={SPRINGS.snappy}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front face — Capsule */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-b from-space-600 to-space-800 border-2 border-saiyan-500 flex items-center justify-center"
            style={{ backfaceVisibility: 'hidden' }}
            data-testid="capsule-front"
          >
            <AnimatePresence>
              {!isRevealed && (
                <motion.div
                  className="text-4xl font-black text-saiyan-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ?
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Back face — Reward */}
          <div
            className={`absolute inset-0 rounded-2xl bg-space-800 border-2 ${colorClass} flex flex-col items-center justify-center p-4`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow: isRevealed ? glowStyle : 'none',
            }}
            data-testid="capsule-back"
            data-rarity={rarity}
          >
            <motion.div
              className="text-lg font-bold text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {rewardTitle}
            </motion.div>
            <div className="text-xs uppercase mt-2 opacity-70">{rarity}</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
