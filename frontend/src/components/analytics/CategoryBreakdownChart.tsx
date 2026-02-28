import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CategoryBreakdown } from '@/types';

interface Props {
  data: CategoryBreakdown[];
}

export default function CategoryBreakdownChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-5">
        <h3 className="text-sm text-saiyan-muted uppercase tracking-wider mb-4">Category Breakdown</h3>
        <p className="text-center text-saiyan-muted py-8">Complete some tasks to see the breakdown!</p>
      </div>
    );
  }

  return (
    <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-5">
      <h3 className="text-sm text-saiyan-muted uppercase tracking-wider mb-4">Category Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="total_points"
            nameKey="category_name"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.category_color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#12121A', border: '1px solid #1E1E2E', borderRadius: '8px' }}
            itemStyle={{ color: '#E0E0E0' }}
            formatter={(value: number, name: string) => [`${value} PL (${data.find(d => d.category_name === name)?.percentage}%)`, name]}
          />
          <Legend
            formatter={(value) => <span style={{ color: '#888899', fontSize: '12px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
