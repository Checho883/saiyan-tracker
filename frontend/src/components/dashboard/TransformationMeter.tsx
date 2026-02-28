import { motion } from 'framer-motion';
import type { TransformationInfo } from '@/types';
import { TRANSFORMATION_COLORS } from '@/types';
import type { TransformationLevel } from '@/types';

interface Props {
  transformations: TransformationInfo[];
  currentLevel: TransformationLevel;
  totalPoints: number;
}

export default function TransformationMeter({ transformations, currentLevel, totalPoints }: Props) {
  return (
    <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-5">
      <h3 className="text-sm text-saiyan-muted uppercase tracking-wider mb-4">Transformation Path</h3>
      <div className="space-y-3">
        {transformations.map((t, i) => {
          const isUnlocked = t.unlocked;
          const isCurrent = t.level === currentLevel;
          const color = TRANSFORMATION_COLORS[t.level as TransformationLevel];
          const nextThreshold = transformations[i + 1]?.threshold;
          const progress = isUnlocked && nextThreshold
            ? Math.min(((totalPoints - t.threshold) / (nextThreshold - t.threshold)) * 100, 100)
            : isUnlocked ? 100 : 0;

          return (
            <motion.div
              key={t.level}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 ${!isUnlocked ? 'opacity-40' : ''}`}
            >
              {/* Level dot */}
              <div
                className={`w-4 h-4 rounded-full flex-shrink-0 ${isCurrent ? 'animate-glow' : ''}`}
                style={{
                  backgroundColor: isUnlocked ? color : '#333',
                  boxShadow: isCurrent ? `0 0 12px ${color}` : 'none',
                }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isCurrent ? '' : 'text-saiyan-muted'}`}
                        style={isCurrent ? { color } : {}}>
                    {t.name}
                  </span>
                  <span className="text-xs text-saiyan-muted">
                    {t.threshold.toLocaleString()} PL
                  </span>
                </div>

                {/* Progress bar for current level */}
                {isCurrent && nextThreshold && (
                  <div className="h-1.5 bg-saiyan-darker rounded-full mt-1 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                )}
              </div>

              {/* Lock/Unlock indicator */}
              {isUnlocked ? (
                <span className="text-green-400 text-xs">✓</span>
              ) : (
                <span className="text-saiyan-muted text-xs">🔒</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
