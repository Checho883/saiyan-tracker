import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CompletionTrend } from '../../types';

interface CompletionTrendCardsProps {
  data: CompletionTrend | null;
}

const clipPath = 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))';

function LoadingSkeleton() {
  return (
    <div
      className="bg-space-800 border border-space-600 p-3 overflow-hidden"
      style={{ clipPath }}
    >
      <div className="w-16 h-3 bg-space-700 rounded animate-pulse mb-2" />
      <div className="w-24 h-7 bg-space-700 rounded animate-pulse" />
    </div>
  );
}

interface TrendCardProps {
  label: string;
  rate: number;
  delta: number;
  completed: number;
  due: number;
}

function TrendCard({ label, rate, delta, completed, due }: TrendCardProps) {
  const deltaRounded = Math.round(delta * 100);
  const deltaPrefix = deltaRounded > 0 ? '+' : '';
  const deltaColor = deltaRounded > 0 ? 'text-green-400' : deltaRounded < 0 ? 'text-red-400' : 'text-text-muted';
  const TrendIcon = deltaRounded > 0 ? TrendingUp : deltaRounded < 0 ? TrendingDown : Minus;

  return (
    <div
      className="relative bg-space-800 border border-saiyan-500/30 p-3 overflow-hidden"
      style={{ clipPath }}
    >
      <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-mono font-bold text-saiyan-400 tabular-nums">
          {Math.round(rate * 100)}%
        </p>
        <div className={`flex items-center gap-0.5 ${deltaColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">{deltaPrefix}{deltaRounded}pp</span>
        </div>
      </div>
      <p className="text-xs text-text-muted mt-1">{completed}/{due} habits</p>
    </div>
  );
}

export function CompletionTrendCards({ data }: CompletionTrendCardsProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-3">Completion Trends</h3>
      {!data ? (
        <div className="grid grid-cols-2 gap-3">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <TrendCard
            label="This Week"
            rate={data.weekly_rate}
            delta={data.weekly_delta}
            completed={data.weekly_habits_completed}
            due={data.weekly_habits_due}
          />
          <TrendCard
            label="This Month"
            rate={data.monthly_rate}
            delta={data.monthly_delta}
            completed={data.monthly_habits_completed}
            due={data.monthly_habits_due}
          />
        </div>
      )}
    </div>
  );
}
