import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFloating, offset, flip, shift, arrow, autoUpdate } from '@floating-ui/react';
import { AnimatePresence } from 'motion/react';
import type { CalendarDay, CalendarDayDetail } from '../../types';
import { habitsApi } from '../../services/api';
import { DayDetailPopover } from './DayDetailPopover';

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<CalendarDayDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const arrowRef = useRef<HTMLDivElement>(null);
  const dayButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const { refs, floatingStyles, middlewareData } = useFloating({
    placement: 'top',
    open: selectedDate !== null && dayDetail !== null,
    middleware: [
      offset(8),
      flip({ fallbackPlacements: ['bottom', 'left', 'right'] }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Reset popover when month changes
  useEffect(() => {
    setSelectedDate(null);
    setDayDetail(null);
  }, [month]);

  // Click-outside dismissal
  useEffect(() => {
    if (!selectedDate) return;
    const handler = (e: MouseEvent) => {
      const floating = refs.floating.current;
      if (floating && !floating.contains(e.target as Node)) {
        // Check if clicked on a day button (let handleDayClick handle it)
        const target = e.target as HTMLElement;
        if (target.closest('[data-calendar-day]')) return;
        setSelectedDate(null);
        setDayDetail(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selectedDate, refs]);

  const handleDayClick = useCallback(async (day: CalendarDay | undefined, dayNum: number) => {
    const dateStr = day?.date;
    if (!dateStr) return;

    if (selectedDate === dateStr) {
      // Toggle off
      setSelectedDate(null);
      setDayDetail(null);
      return;
    }

    // Set reference element to the clicked day button
    const btn = dayButtonRefs.current.get(dayNum);
    if (btn) {
      refs.setReference(btn);
    }

    setSelectedDate(dateStr);
    setIsLoadingDetail(true);

    try {
      const detail = await habitsApi.calendarDayDetail(dateStr);
      setDayDetail(detail);
    } catch {
      setDayDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [selectedDate, refs]);

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
        ref={(el) => { if (el) dayButtonRefs.current.set(dayNum, el); }}
        data-calendar-day={dayNum}
        onClick={() => handleDayClick(day, dayNum)}
        className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-medium transition-colors
          ${day ? colorForTier(tier) : 'bg-space-700'}
          ${isOffDay ? 'ring-2 ring-blue-500' : ''}
          ${day ? 'text-white' : 'text-text-muted'}
          ${selectedDate === day?.date ? 'ring-2 ring-white' : ''}
          hover:opacity-80`}
        aria-label={`Day ${dayNum}${day ? `, ${tier} tier` : ''}${isOffDay ? ', off day' : ''}`}
      >
        {dayNum}
      </button>
    );
  });

  // Arrow positioning
  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;

  return (
    <div className="bg-space-800 rounded-xl p-4 relative">
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

      {/* Floating popover */}
      <AnimatePresence>
        {selectedDate && dayDetail && !isLoadingDetail && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-50"
          >
            <DayDetailPopover detail={dayDetail} />
            {/* Arrow */}
            <div
              ref={arrowRef}
              className="absolute w-2 h-2 bg-space-800 border-space-600 rotate-45"
              style={{
                left: arrowX != null ? `${arrowX}px` : '',
                top: arrowY != null ? `${arrowY}px` : '',
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {isLoadingDetail && selectedDate && (
        <div className="mt-3 text-center text-text-muted text-xs">Loading...</div>
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
