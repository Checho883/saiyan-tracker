import { motion } from 'framer-motion';
import { TRANSFORMATION_COLORS } from '@/types';
import type { PowerLevel } from '@/types';

interface Props {
  power: PowerLevel;
}

export default function PowerLevelBar({ power }: Props) {
  const color = TRANSFORMATION_COLORS[power.transformation_level] || '#FF6B00';
  const dailyProgress = Math.min((power.daily_points_today / power.daily_minimum) * 100, 100);

  return (
    <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-5">
      {/* Total Power Level */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-saiyan-muted text-sm uppercase tracking-wider">Power Level</span>
          <motion.h2
            className="text-3xl font-bold"
            style={{ color, fontFamily: 'Orbitron, sans-serif' }}
            key={power.total_power_points}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {power.total_power_points.toLocaleString()}
          </motion.h2>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold" style={{ color }}>
            {power.transformation_name}
          </span>
          {power.next_transformation_name && (
            <p className="text-xs text-saiyan-muted">
              {power.points_to_next?.toLocaleString()} to {power.next_transformation_name}
            </p>
          )}
        </div>
      </div>

      {/* Transformation Progress Bar */}
      <div className="mb-4">
        <div className="h-3 bg-saiyan-darker rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${power.progress_percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-saiyan-muted mt-1 text-right">
          {power.progress_percentage.toFixed(1)}% to next form
        </p>
      </div>

      {/* Daily Progress */}
      <div className="border-t border-saiyan-border pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-saiyan-muted">Today's Power</span>
          <span className={`text-sm font-bold ${power.daily_minimum_met ? 'text-green-400' : 'text-saiyan-orange'}`}>
            {power.daily_points_today} / {power.daily_minimum}
          </span>
        </div>
        <div className="h-2 bg-saiyan-darker rounded-full overflow-hidden">
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
