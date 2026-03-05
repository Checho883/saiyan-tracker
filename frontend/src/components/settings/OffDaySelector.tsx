import { useState } from 'react';
import { Thermometer, Palmtree, BedDouble, Cross, MoreHorizontal } from 'lucide-react';
import type { OffDayReason } from '../../types';
import type { LucideIcon } from 'lucide-react';

interface OffDaySelectorProps {
  onSelect: (reason: OffDayReason) => void;
  onCancel: () => void;
}

const reasonOptions: { reason: OffDayReason; icon: LucideIcon; label: string }[] = [
  { reason: 'sick', icon: Thermometer, label: 'Sick' },
  { reason: 'vacation', icon: Palmtree, label: 'Vacation' },
  { reason: 'rest', icon: BedDouble, label: 'Rest Day' },
  { reason: 'injury', icon: Cross, label: 'Injury' },
  { reason: 'other', icon: MoreHorizontal, label: 'Other' },
];

export function OffDaySelector({ onSelect, onCancel }: OffDaySelectorProps) {
  const [selectedReason, setSelectedReason] = useState<OffDayReason | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">Select a reason for your off day:</p>
      <div className="grid grid-cols-5 gap-3">
        {reasonOptions.map(({ reason, icon: Icon, label }) => (
          <button
            key={reason}
            onClick={() => setSelectedReason(reason)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
              selectedReason === reason
                ? 'ring-2 ring-saiyan-500 bg-space-600'
                : 'bg-space-700 hover:bg-space-600'
            }`}
            aria-label={label}
          >
            <Icon className="w-6 h-6 text-text-primary" />
            <span className="text-xs text-text-secondary">{label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => selectedReason && onSelect(selectedReason)}
          disabled={!selectedReason}
          className="flex-1 bg-saiyan-500 text-white rounded-lg py-2 px-4 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Confirm Off Day
        </button>
        <button
          onClick={onCancel}
          className="text-text-muted text-sm hover:text-text-secondary transition-colors px-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
