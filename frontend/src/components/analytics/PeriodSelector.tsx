import type { AnalyticsPeriod } from '../../types';

interface PeriodSelectorProps {
  period: AnalyticsPeriod;
  onChange: (p: AnalyticsPeriod) => void;
}

const periods: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'all', label: 'All' },
];

export function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  return (
    <div role="group" aria-label="Period selector" className="flex bg-space-700 rounded-lg p-1">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            period === p.value
              ? 'bg-saiyan-500 text-white'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
