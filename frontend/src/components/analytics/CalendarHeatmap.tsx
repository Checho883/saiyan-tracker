import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarDay } from '../../types';

interface CalendarHeatmapProps {
  days: CalendarDay[];
  month: string; // "YYYY-MM"
  onPrev: () => void;
  onNext: () => void;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function colorForTier(tier: string | undefined): string {
  switch (tier) {
    case 'gold':
      return 'bg-yellow-500';
    case 'silver':
      return 'bg-blue-500';
    case 'bronze':
      return 'bg-red-500';
    default:
      return 'bg-gray-600';
  }
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function CalendarHeatmap({ days, month, onPrev, onNext }: CalendarHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr);
  const monthNum = Number(monthStr);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const firstDayOfWeek = new Date(year, monthNum - 1, 1).getDay();

  const dayMap = new Map(days.map((d) => [Number(d.date.slice(8, 10)), d]));

  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => (
    <div key={`empty-${i}`} className="w-9 h-9" />
  ));

  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const day = dayMap.get(dayNum);
    const tier = day?.completion_tier;
    const isOffDay = day?.is_off_day ?? false;

    return (
      <button
        key={dayNum}
        onClick={() => setSelectedDay(selectedDay?.date === day?.date ? null : day ?? null)}
        className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-medium transition-colors
          ${day ? colorForTier(tier) : 'bg-space-700'}
          ${isOffDay ? 'ring-2 ring-blue-500' : ''}
          ${day ? 'text-white' : 'text-text-muted'}
          hover:opacity-80`}
        aria-label={`Day ${dayNum}${day ? `, ${tier} tier` : ''}${isOffDay ? ', off day' : ''}`}
      >
        {dayNum}
      </button>
    );
  });

  return (
    <div className="bg-space-800 rounded-xl p-4">
      {/* Month navigation header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrev}
          className="p-1 rounded-lg hover:bg-space-700 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <h3 className="text-base font-semibold text-text-primary">{formatMonthLabel(month)}</h3>
        <button
          onClick={onNext}
          className="p-1 rounded-lg hover:bg-space-700 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="w-9 h-6 flex items-center justify-center text-xs text-text-muted">
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyCells}
        {dayCells}
      </div>

      {/* Tooltip popover */}
      {selectedDay && (
        <div className="mt-3 bg-space-700 rounded-lg p-3 text-sm">
          <p className="text-text-primary font-medium">{selectedDay.date}</p>
          <p className="text-text-secondary mt-1">
            Tier: <span className="capitalize">{selectedDay.completion_tier}</span>
          </p>
          <p className="text-text-secondary">XP earned: {selectedDay.xp_earned}</p>
          {selectedDay.is_off_day && (
            <p className="text-blue-400 mt-1">Off day</p>
          )}
          {selectedDay.is_perfect_day && (
            <p className="text-yellow-400 mt-1">Perfect day!</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-yellow-500" />
          <span>100%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span>75-99%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span>50-74%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-600" />
          <span>&lt;50%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-space-700 ring-2 ring-blue-500" />
          <span>Off</span>
        </div>
      </div>
    </div>
  );
}
