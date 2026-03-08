import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import type { ContributionDay } from '../../types';
import { habitsApi } from '../../services/api';
import { ContributionGrid } from './ContributionGrid';

interface HabitDetailSheetProps {
  habitId: string;
  habitTitle: string;
  habitEmoji: string;
  streakCurrent: number;
  streakBest: number;
  onClose: () => void;
}

export function HabitDetailSheet({
  habitId,
  habitTitle,
  habitEmoji,
  streakCurrent,
  streakBest,
  onClose,
}: HabitDetailSheetProps) {
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    habitsApi
      .contributionGraph(habitId, 90)
      .then((data) => {
        if (!cancelled) {
          setDays(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [habitId]);

  const totalCompletions = days.filter((d) => d.completed).length;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/60 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-space-800 rounded-t-2xl p-5 z-50 max-h-[85vh] overflow-y-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{habitEmoji}</span>
            <h3 className="text-lg font-semibold text-text-primary">{habitTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-space-700 transition-colors"
            aria-label="Close detail sheet"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <div className="bg-space-700 rounded-lg px-3 py-2 flex-1 text-center">
            <p className="text-text-muted text-xs">Current Streak</p>
            <p className="text-text-primary font-bold text-lg">{streakCurrent}</p>
          </div>
          <div className="bg-space-700 rounded-lg px-3 py-2 flex-1 text-center">
            <p className="text-text-muted text-xs">Best Streak</p>
            <p className="text-text-primary font-bold text-lg">{streakBest}</p>
          </div>
          <div className="bg-space-700 rounded-lg px-3 py-2 flex-1 text-center">
            <p className="text-text-muted text-xs">Completions</p>
            <p className="text-text-primary font-bold text-lg">
              {isLoading ? '...' : totalCompletions}
            </p>
          </div>
        </div>

        {/* Contribution grid */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-text-secondary mb-3">Last 90 Days</h4>
          {isLoading ? (
            <div className="text-text-muted text-sm text-center py-4">Loading...</div>
          ) : (
            <ContributionGrid days={days} />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-space-700" />
            <span>Missed</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
