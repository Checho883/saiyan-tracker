import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { TRANSFORMATION_COLORS } from '@/types';
import type { PowerLevel } from '@/types';

interface Props {
  power: PowerLevel;
}

export default function PowerLevelBar({ power }: Props) {
  const color = TRANSFORMATION_COLORS[power.transformation_level] || '#FF6B00';
  const dailyProgress = Math.min((power.daily_points_today / power.daily_minimum) * 100, 100);

  return (
    <div className={`scouter-display p-5 aura-${power.transformation_level}`}>
      {/* Main Power Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${color}30, ${color}10)`,
              border: `2px solid ${color}`,
              boxShadow: `0 0 15px ${color}40`,
            }}
            animate={{ boxShadow: [`0 0 10px ${color}30`, `0 0 25px ${color}50`, `0 0 10px ${color}30`] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap size={22} style={{ color }} />
          </motion.div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Power Level
            </span>
            <motion.div
              className="text-3xl font-black font-power tracking-wide"
              style={{ color }}
              key={power.total_power_points}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {power.total_power_points.toLocaleString()}
            </motion.div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-bold" style={{ color }}>
            {power.transformation_name}
          </div>
          {power.next_transformation_name && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {power.points_to_next?.toLocaleString()} to {power.next_transformation_name}
            </p>
          )}
        </div>
      </div>

      {/* Transformation Progress */}
      <div className="mb-3">
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
          <motion.div
            className="h-full rounded-full relative"
            style={{
              background: `linear-gradient(90deg, ${color}, ${color}CC)`,
              boxShadow: `0 0 8px ${color}60`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${power.progress_percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
          {power.progress_percentage.toFixed(1)}%
        </p>
      </div>

      {/* Daily Progress */}
      <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Today's Power</span>
          <span className={`text-xs font-bold ${power.daily_minimum_met ? 'text-green-400' : 'text-saiyan-orange'}`}>
            {power.daily_points_today} / {power.daily_minimum}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
          <motion.div
            className={`h-full rounded-full ${power.daily_minimum_met ? 'bg-green-400' : 'bg-saiyan-orange'}`}
            initial={{ width: 0 }}
            animate={{ width: `${dailyProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
