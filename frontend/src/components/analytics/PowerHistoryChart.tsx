import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { PowerHistoryEntry } from '@/types';
import { TRANSFORMATION_COLORS } from '@/types';
import type { TransformationLevel } from '@/types';

interface Props {
  data: PowerHistoryEntry[];
}

export default function PowerHistoryChart({ data }: Props) {
  const chartData = data.map(d => ({
    ...d,
    name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  if (!chartData.length) {
    return (
      <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-5">
        <h3 className="text-sm text-saiyan-muted uppercase tracking-wider mb-4">Power Level History</h3>
        <p className="text-center text-saiyan-muted py-8">Complete tasks to see your power grow!</p>
      </div>
    );
  }

  const latestLevel = (data[data.length - 1]?.transformation_level || 'base') as TransformationLevel;
  const color = TRANSFORMATION_COLORS[latestLevel];

  return (
    <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-5">
      <h3 className="text-sm text-saiyan-muted uppercase tracking-wider mb-4">Power Level History</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
          <XAxis dataKey="name" stroke="#888899" fontSize={11} />
          <YAxis stroke="#888899" fontSize={11} />
          <Tooltip
            contentStyle={{ backgroundColor: '#12121A', border: '1px solid #1E1E2E', borderRadius: '8px' }}
            labelStyle={{ color: '#E0E0E0' }}
            formatter={(value: number) => [`${value.toLocaleString()} PL`, 'Power Level']}
          />
          <Area
            type="monotone"
            dataKey="total_power_points"
            stroke={color}
            fillOpacity={1}
            fill="url(#powerGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
