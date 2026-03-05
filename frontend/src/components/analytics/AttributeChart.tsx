import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePowerStore } from '../../store/powerStore';
import type { CalendarDay } from '../../types';

interface AttributeChartProps {
  calendarDays: CalendarDay[];
}

interface ChartDataPoint {
  date: string;
  xp: number;
}

const ATTRIBUTE_COLORS: Record<string, string> = {
  str: '#EF4444',
  vit: '#22C55E',
  int: '#3B82F6',
  ki: '#EAB308',
};

export function AttributeChart({ calendarDays }: AttributeChartProps) {
  const attributes = usePowerStore((s) => s.attributes);

  // Transform calendar data into chart data (sorted by date)
  const chartData: ChartDataPoint[] = [...calendarDays]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => ({
      date: day.date.slice(5), // "MM-DD"
      xp: day.xp_earned,
    }));

  return (
    <div className="bg-space-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">XP Over Time</h3>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <filter id="neonGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#F9FAFB' }}
              itemStyle={{ color: '#3B82F6' }}
            />
            <Area
              type="monotone"
              dataKey="xp"
              stroke="#3B82F6"
              fill="url(#xpFill)"
              strokeWidth={2}
              filter="url(#neonGlow)"
              animationDuration={1500}
              animationEasing="ease-out"
              name="XP Earned"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">
          No data for this period
        </div>
      )}

      {/* Attribute level bars */}
      {attributes.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-xs text-text-muted uppercase tracking-wider">Current Attributes</h4>
          {attributes.map((attr) => (
            <div key={attr.attribute} className="flex items-center gap-2">
              <span
                className="w-8 text-xs font-mono font-bold uppercase"
                style={{ color: ATTRIBUTE_COLORS[attr.attribute] ?? '#9CA3AF' }}
              >
                {attr.attribute}
              </span>
              <span className="text-xs text-text-secondary w-6 text-right">
                {attr.level}
              </span>
              <div className="flex-1 h-2 bg-space-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(attr.progress_percent, 100)}%`,
                    backgroundColor: ATTRIBUTE_COLORS[attr.attribute] ?? '#9CA3AF',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
