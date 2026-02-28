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
    <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-5">
      <h3 className="text-sm text-saiyan-muted uppercase tracking-wider mb-4">Weekly Power</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
          <XAxis dataKey="name" stroke="#888899" fontSize={12} />
          <YAxis stroke="#888899" fontSize={12} />
          <Tooltip
            contentStyle={{ backgroundColor: '#12121A', border: '1px solid #1E1E2E', borderRadius: '8px' }}
            labelStyle={{ color: '#E0E0E0' }}
            itemStyle={{ color: '#FF6B00' }}
          />
          <ReferenceLine y={dailyMinimum} stroke="#FF6B00" strokeDasharray="5 5" label={{ value: 'Min', fill: '#FF6B00', fontSize: 10 }} />
          <Bar dataKey="points" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.minimum_met ? '#FF6B00' : entry.is_off_day ? '#1E90FF' : '#333344'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
