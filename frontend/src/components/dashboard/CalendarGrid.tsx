import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HabitCalendarDay } from '../../types';

interface CalendarGridProps {
  days: HabitCalendarDay[];
  color: string; // Attribute color CSS variable for completed dots
}

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

export function CalendarGrid({ days, color }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const dayMap = new Map(days.map((d) => [d.date, d]));

  const { year, month } = currentMonth;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfWeek(year, month);

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  return (
    <div>
      {/* Month header with navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 rounded hover:bg-space-700 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 text-text-muted" />
        </button>
        <span className="text-sm font-medium text-text-primary">
          {getMonthName(new Date(year, month))}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 rounded hover:bg-space-700 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map((label, i) => (
          <div
            key={`hdr-${i}`}
            className="w-8 h-6 flex items-center justify-center text-text-muted text-xs"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for padding before first day */}
        {Array.from({ length: firstDow }, (_, i) => (
          <div key={`pad-${i}`} className="w-8 h-8" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = toDateStr(year, month, day);
          const entry = dayMap.get(dateStr);
          const today = isToday(year, month, day);

          return (
            <div
              key={dateStr}
              className={`w-8 h-8 flex flex-col items-center justify-center rounded-md ${
                today ? 'ring-1 ring-text-muted' : ''
              }`}
            >
              <span className="text-xs text-text-secondary leading-none">
                {day}
              </span>
              {entry ? (
                <div
                  className="w-1.5 h-1.5 rounded-full mt-0.5"
                  style={{
                    backgroundColor: entry.completed ? color : 'var(--color-space-600)',
                  }}
                />
              ) : (
                <div className="w-1.5 h-1.5 mt-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
