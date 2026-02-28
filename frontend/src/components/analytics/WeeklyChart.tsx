import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import type { DailyStats } from '@/types';

interface Props {
  days: DailyStats[];
  dailyMinimum: number;
}

export default function WeeklyChart({ days, dailyMinimum }: Props) {
  const data = days.map(d => ({
    ...d,
    name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  return (
    <div className="card-base p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Weekly Power</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
          <YAxis stroke="var(--text-muted)" fontSize={11} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-primary)' }}
            itemStyle={{ color: '#FF6B00' }}
          />
          <ReferenceLine y={dailyMinimum} stroke="#FF6B00" strokeDasharray="5 5" label={{ value: 'Min', fill: '#FF6B00', fontSize: 10 }} />
          <Bar dataKey="points" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.minimum_met ? '#FF6B00' : entry.is_off_day ? '#1E90FF' : 'var(--border-color)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
