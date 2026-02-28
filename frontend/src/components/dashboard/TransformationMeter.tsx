import { motion } from 'framer-motion';
import type { TransformationInfo, TransformationLevel } from '@/types';
import { TRANSFORMATION_COLORS } from '@/types';

interface Props {
  transformations: TransformationInfo[];
  currentLevel: TransformationLevel;
  totalPoints: number;
}

export default function TransformationMeter({ transformations, currentLevel, totalPoints }: Props) {
  return (
    <div className="card-base p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Transformation Path</h3>
      <div className="space-y-2.5">
        {transformations.map((t, i) => {
          const isUnlocked = t.unlocked;
          const isCurrent = t.level === currentLevel;
          const color = TRANSFORMATION_COLORS[t.level as TransformationLevel];
          const nextThreshold = transformations[i + 1]?.threshold;
          const progress = isUnlocked && nextThreshold
            ? Math.min(((totalPoints - t.threshold) / (nextThreshold - t.threshold)) * 100, 100)
            : isUnlocked ? 100 : 0;

          return (
            <motion.div key={t.level} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }} className={`flex items-center gap-3 ${!isUnlocked ? 'opacity-30' : ''}`}>
              <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${isCurrent ? 'animate-glow' : ''}`}
                style={{ backgroundColor: isUnlocked ? color : 'var(--border-color)', boxShadow: isCurrent ? `0 0 12px ${color}` : 'none' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: isCurrent ? color : 'var(--text-muted)' }}>{t.name}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.threshold.toLocaleString()}</span>
                </div>
                {isCurrent && nextThreshold && (
                  <div className="h-1 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                      initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} />
                  </div>
                )}
              </div>
              {isUnlocked ? <span className="text-green-400 text-xs">✓</span> : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>🔒</span>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
