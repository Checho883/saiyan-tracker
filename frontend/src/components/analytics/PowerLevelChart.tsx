import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CalendarDay } from '../../types';

interface PowerLevelChartProps {
  calendarDays: CalendarDay[];
}

interface ChartDataPoint {
  date: string;
  cumulativeXp: number;
}

export function PowerLevelChart({ calendarDays }: PowerLevelChartProps) {
  // Compute cumulative XP from sorted calendar days
  const sorted = [...calendarDays].sort((a, b) => a.date.localeCompare(b.date));
  let cumulative = 0;
  const chartData: ChartDataPoint[] = sorted.map((day) => {
    cumulative += day.xp_earned;
    return {
      date: day.date.slice(5), // "MM-DD"
      cumulativeXp: cumulative,
    };
  });

  return (
    <div className="bg-space-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Power Level</h3>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <defs>
              <filter id="powerGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
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
              trigger="click"
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#F9FAFB' }}
              itemStyle={{ color: '#EAB308' }}
            />
            <Line
              type="monotone"
              dataKey="cumulativeXp"
              stroke="#EAB308"
              strokeWidth={2}
              dot={false}
              filter="url(#powerGlow)"
              animationDuration={1500}
              animationEasing="ease-out"
              name="Cumulative XP"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">
          No data for this period
        </div>
      )}
    </div>
  );
}
