import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { PowerHistoryEntry, TransformationLevel } from '@/types';
import { TRANSFORMATION_COLORS } from '@/types';

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
      <div className="card-base p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Power Level History</h3>
        <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>Complete tasks to see your power grow!</p>
      </div>
    );
  }

  const latestLevel = (data[data.length - 1]?.transformation_level || 'base') as TransformationLevel;
  const color = TRANSFORMATION_COLORS[latestLevel];

  return (
    <div className="card-base p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Power Level History</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
          <YAxis stroke="var(--text-muted)" fontSize={11} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-primary)' }}
            formatter={(value: number) => [`${value.toLocaleString()} PL`, 'Power Level']}
          />
          <Area type="monotone" dataKey="total_power_points" stroke={color} fillOpacity={1} fill="url(#powerGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
