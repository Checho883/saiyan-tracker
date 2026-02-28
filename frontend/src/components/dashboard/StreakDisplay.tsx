import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';

interface Props {
  streak: number;
  bestStreak?: number;
}

export default function StreakDisplay({ streak, bestStreak }: Props) {
  const isHot = streak >= 7;
  const isOnFire = streak >= 30;

  return (
    <div
      className="card-base p-4"
      style={isOnFire ? { borderColor: '#FF6B00', boxShadow: '0 0 15px rgba(255, 107, 0, 0.2)' } : isHot ? { borderColor: 'rgba(255, 215, 0, 0.3)' } : {}}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={isHot ? { rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Flame
              size={20}
              className={isOnFire ? 'text-saiyan-orange' : isHot ? 'text-saiyan-gold' : ''}
              style={!isHot ? { color: 'var(--text-muted)' } : {}}
            />
          </motion.div>
          <div>
            <motion.span
              className="text-2xl font-black font-power"
              style={{ color: isOnFire ? '#FF6B00' : isHot ? '#FFD700' : 'var(--text-primary)' }}
              key={streak}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
            >
              {streak}
            </motion.span>
            <span className="text-xs ml-1.5" style={{ color: 'var(--text-muted)' }}>day streak</span>
          </div>
        </div>
        {bestStreak !== undefined && bestStreak > 0 && (
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Trophy size={12} />
            <span>Best: {bestStreak}</span>
          </div>
        )}
      </div>
    </div>
  );
}
