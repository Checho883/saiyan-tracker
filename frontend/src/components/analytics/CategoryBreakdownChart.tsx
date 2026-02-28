import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CategoryBreakdown } from '@/types';

interface Props {
  data: CategoryBreakdown[];
}

export default function CategoryBreakdownChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="card-base p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Category Breakdown</h3>
        <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>Complete some tasks to see the breakdown!</p>
      </div>
    );
  }

  return (
    <div className="card-base p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Category Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}
            dataKey="total_points" nameKey="category_name">
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.category_color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
            itemStyle={{ color: 'var(--text-primary)' }}
            formatter={(value: number, name: string) => [`${value} PL (${data.find(d => d.category_name === name)?.percentage}%)`, name]}
          />
          <Legend formatter={(value) => <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
