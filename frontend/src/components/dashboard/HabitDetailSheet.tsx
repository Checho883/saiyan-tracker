import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import type {
  ContributionDay,
  HabitTodayResponse,
  HabitStatsResponse,
  HabitCalendarDay,
  Attribute,
} from '../../types';
import { habitsApi } from '../../services/api';
import { ContributionGrid } from './ContributionGrid';
import { ProgressRing } from './ProgressRing';
import { CalendarGrid } from './CalendarGrid';

const attrColorVar: Record<Attribute, string> = {
  str: 'var(--color-attr-str)',
  vit: 'var(--color-attr-vit)',
  int: 'var(--color-attr-int)',
  ki: 'var(--color-attr-ki)',
};

const attrBadgeClass: Record<Attribute, string> = {
  str: 'text-attr-str bg-attr-str/10',
  vit: 'text-attr-vit bg-attr-vit/10',
  int: 'text-attr-int bg-attr-int/10',
  ki: 'text-attr-ki bg-attr-ki/10',
};

const importanceDotClass: Record<string, string> = {
  critical: 'bg-danger',
  important: 'bg-warning',
  normal: 'bg-text-muted',
};

const importanceLabelMap: Record<string, string> = {
  critical: 'Critical',
  important: 'Important',
  normal: 'Normal',
};

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface HabitDetailSheetProps {
  habit: HabitTodayResponse;
  onClose: () => void;
}

export function HabitDetailSheet({ habit, onClose }: HabitDetailSheetProps) {
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [stats, setStats] = useState<HabitStatsResponse | null>(null);
  const [calendarDays, setCalendarDays] = useState<HabitCalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grid' | 'calendar'>('grid');
  const [calendarLoaded, setCalendarLoaded] = useState(false);

  // Fetch contribution graph and stats on mount
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      habitsApi.contributionGraph(habit.id, 90),
      habitsApi.stats(habit.id),
    ])
      .then(([graphData, statsData]) => {
        if (!cancelled) {
          setDays(graphData);
          setStats(statsData);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [habit.id]);

  // Lazy-fetch calendar data when user switches to calendar tab
  useEffect(() => {
    if (activeTab !== 'calendar' || calendarLoaded) return;
    let cancelled = false;

    habitsApi
      .calendar(habit.id)
      .then((data) => {
        if (!cancelled) {
          setCalendarDays(data);
          setCalendarLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setCalendarLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, calendarLoaded, habit.id]);

  const attrColor = attrColorVar[habit.attribute];

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
        {/* Aura glow gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-24 rounded-t-2xl pointer-events-none opacity-20"
          style={{
            background: `linear-gradient(to bottom, ${attrColor}, transparent)`,
          }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{habit.icon_emoji}</span>
            <h3 className="text-lg font-semibold text-text-primary">
              {habit.title}
            </h3>
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
        <div className="relative flex flex-wrap items-center gap-4 mb-5">
          <div className="bg-space-700 rounded-lg px-3 py-2 flex-1 text-center">
            <p className="text-text-muted text-xs">Current Streak</p>
            <p className="text-text-primary font-bold text-lg">
              {habit.streak_current}
            </p>
          </div>
          <div className="bg-space-700 rounded-lg px-3 py-2 flex-1 text-center">
            <p className="text-text-muted text-xs">Best Streak</p>
            <p className="text-text-primary font-bold text-lg">
              {habit.streak_best}
            </p>
          </div>
          <div className="bg-space-700 rounded-lg px-3 py-2 flex-1 text-center">
            <p className="text-text-muted text-xs">Completions</p>
            <p className="text-text-primary font-bold text-lg">
              {isLoading ? '...' : (stats?.total_completions ?? 0)}
            </p>
          </div>
        </div>

        {/* Progress rings + XP section */}
        <div className="relative flex items-center justify-center gap-6 mb-5">
          <ProgressRing
            percentage={stats?.completion_rate_7d ?? 0}
            color={attrColor}
            label="7-day"
          />
          <ProgressRing
            percentage={stats?.completion_rate_30d ?? 0}
            color={attrColor}
            label="30-day"
          />
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-2xl font-bold"
              style={{ color: attrColor }}
            >
              {stats ? stats.total_xp_earned.toLocaleString() : '...'}
            </span>
            <span className="text-xs text-text-muted">
              {habit.attribute.toUpperCase()} XP
            </span>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="relative grid grid-cols-2 gap-3 mb-5">
          <div className="bg-space-700 rounded-lg px-3 py-2">
            <p className="text-text-muted text-xs">Target Time</p>
            <p className="text-text-primary text-sm">
              {habit.target_time ?? 'Any time'}
            </p>
          </div>
          <div className="bg-space-700 rounded-lg px-3 py-2">
            <p className="text-text-muted text-xs">Importance</p>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${importanceDotClass[habit.importance]}`}
              />
              <p className="text-text-primary text-sm">
                {importanceLabelMap[habit.importance]}
              </p>
            </div>
          </div>
          <div className="bg-space-700 rounded-lg px-3 py-2">
            <p className="text-text-muted text-xs">Created</p>
            <p className="text-text-primary text-sm">
              {formatDate(habit.created_at)}
            </p>
            <p className="text-text-muted text-xs">
              ({relativeTime(habit.created_at)})
            </p>
          </div>
          <div className="bg-space-700 rounded-lg px-3 py-2">
            <p className="text-text-muted text-xs">Attribute</p>
            <span
              className={`inline-block text-xs font-bold uppercase px-1.5 py-0.5 rounded ${attrBadgeClass[habit.attribute]}`}
            >
              {habit.attribute.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Tabbed history section */}
        <div className="relative">
          {/* Tab buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'grid'
                  ? 'bg-space-600 text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-space-600 text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Calendar
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'grid' && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-text-secondary mb-3">
                Last 90 Days
              </h4>
              {isLoading ? (
                <div className="text-text-muted text-sm text-center py-4">
                  Loading...
                </div>
              ) : (
                <ContributionGrid days={days} />
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="mb-4">
              {!calendarLoaded ? (
                <div className="text-text-muted text-sm text-center py-4">
                  Loading calendar...
                </div>
              ) : (
                <CalendarGrid days={calendarDays} color={attrColor} />
              )}
            </div>
          )}
        </div>

        {/* Legend (only for Grid tab) */}
        {activeTab === 'grid' && (
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
        )}
      </motion.div>
    </>
  );
}
