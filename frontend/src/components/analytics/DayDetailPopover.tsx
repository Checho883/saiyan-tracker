import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import type { CalendarDayDetail } from '../../types';

const tierColorMap: Record<string, string> = {
  gold: 'text-yellow-500',
  silver: 'text-blue-400',
  bronze: 'text-red-400',
  base: 'text-text-muted',
};

interface DayDetailPopoverProps {
  detail: CalendarDayDetail;
}

export const DayDetailPopover = forwardRef<HTMLDivElement, DayDetailPopoverProps>(
  function DayDetailPopover({ detail }, ref) {
    const formattedDate = new Date(detail.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-space-800 border border-space-600 rounded-xl shadow-xl p-3 w-64"
      >
        {/* Header: date + tier + XP */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-primary text-sm font-medium">{formattedDate}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase ${tierColorMap[detail.completion_tier] ?? 'text-text-muted'}`}>
              {detail.completion_tier}
            </span>
            <span className="text-saiyan-500 text-xs font-semibold">+{detail.total_xp} XP</span>
          </div>
        </div>

        {detail.is_off_day && (
          <p className="text-blue-400 text-xs mb-2">Off day</p>
        )}
        {detail.is_perfect_day && (
          <p className="text-yellow-400 text-xs mb-2">Perfect day!</p>
        )}

        {/* Per-habit list */}
        {detail.habits.length === 0 ? (
          <p className="text-text-muted text-xs">No habits due</p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {detail.habits.map((h) => (
              <div key={h.id} className="flex items-center gap-2 text-xs">
                {h.is_excused ? (
                  <span className="text-blue-400 text-[10px] font-medium w-4 text-center flex-shrink-0">EXC</span>
                ) : h.completed ? (
                  <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-danger flex-shrink-0" />
                )}
                <span className="text-text-primary truncate flex-1">
                  {h.icon_emoji} {h.title}
                </span>
                {h.completed && h.attribute_xp_awarded > 0 && (
                  <span className="text-saiyan-500 font-medium flex-shrink-0">+{h.attribute_xp_awarded}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }
);
