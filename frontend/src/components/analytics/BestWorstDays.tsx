import { ArrowUp, ArrowDown } from 'lucide-react';
import type { CalendarDay } from '../../types';

interface BestWorstDaysProps {
  calendarDays: CalendarDay[];
}

const TIER_COLORS: Record<string, string> = {
  gold: 'text-yellow-400',
  silver: 'text-gray-300',
  bronze: 'text-amber-600',
  base: 'text-text-muted',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface DayRowProps {
  day: CalendarDay;
}

function DayRow({ day }: DayRowProps) {
  const tierColor = TIER_COLORS[day.completion_tier] ?? TIER_COLORS.base;

  return (
    <div data-testid="day-entry" className="flex items-center gap-2 py-1">
      <span className="text-xs text-text-muted w-14">{formatDate(day.date)}</span>
      <span className="text-sm font-mono text-saiyan-400 w-16 text-right">
        {day.xp_earned} XP
      </span>
      <span className={`text-xs capitalize ${tierColor}`}>
        {day.completion_tier}
      </span>
    </div>
  );
}

export function BestWorstDays({ calendarDays }: BestWorstDaysProps) {
  const validDays = calendarDays.filter((d) => !d.is_off_day && d.xp_earned > 0);
  const sorted = [...validDays].sort((a, b) => b.xp_earned - a.xp_earned);
  const best = sorted.slice(0, 3);
  const worst = sorted.length > 3 ? sorted.slice(-3).reverse() : [];

  return (
    <div className="bg-space-800 rounded-xl p-4">
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-sm font-semibold text-text-primary">Best & Worst Days</h3>
        <span className="text-xs text-text-muted">This Month</span>
      </div>

      {validDays.length === 0 ? (
        <p className="text-sm text-text-muted">No data yet</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1 mb-2">
              <ArrowUp className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-semibold text-green-400 uppercase">Best</span>
            </div>
            {best.map((day) => (
              <DayRow key={day.date} day={day} />
            ))}
          </div>

          {worst.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <ArrowDown className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-semibold text-red-400 uppercase">Worst</span>
              </div>
              {worst.map((day) => (
                <DayRow key={day.date} day={day} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
