import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface Props {
  streak: number;
  bestStreak?: number;
}

export default function StreakDisplay({ streak, bestStreak }: Props) {
  const isHot = streak >= 7;
  const isOnFire = streak >= 30;

  return (
    <motion.div
      className={`bg-saiyan-card border rounded-xl p-4 text-center ${
        isOnFire ? 'border-saiyan-orange animate-power-pulse' : isHot ? 'border-yellow-500/40' : 'border-saiyan-border'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <motion.div
          animate={isHot ? { rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Flame
            size={24}
            className={isOnFire ? 'text-saiyan-orange' : isHot ? 'text-yellow-400' : 'text-saiyan-muted'}
          />
        </motion.div>
        <motion.span
          className="text-3xl font-bold"
          style={{ fontFamily: 'Orbitron, sans-serif', color: isOnFire ? '#FF6B00' : isHot ? '#FBBF24' : '#888899' }}
          key={streak}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
        >
          {streak}
        </motion.span>
      </div>
      <p className="text-sm text-saiyan-muted">Day Streak</p>
      {bestStreak !== undefined && bestStreak > 0 && (
        <p className="text-xs text-saiyan-muted mt-1">Best: {bestStreak} days</p>
      )}
    </motion.div>
  );
}
