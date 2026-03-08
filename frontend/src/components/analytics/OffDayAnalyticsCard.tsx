import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { OffDaySummary } from '../../types';

interface OffDayAnalyticsCardProps {
  data: OffDaySummary | null;
}

const clipPath = 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))';

const REASON_COLORS: Record<string, string> = {
  rest: '#3B82F6',
  sick: '#EF4444',
  vacation: '#22C55E',
  injury: '#F59E0B',
  other: '#6B7280',
};

function LoadingSkeleton() {
  return (
    <div
      className="bg-space-800 border border-space-600 rounded-xl p-4 overflow-hidden"
      style={{ clipPath }}
    >
      <div className="w-28 h-4 bg-space-700 rounded animate-pulse mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <div className="w-full h-12 bg-space-700 rounded animate-pulse" />
        <div className="w-full h-12 bg-space-700 rounded animate-pulse" />
        <div className="w-full h-12 bg-space-700 rounded animate-pulse" />
        <div className="w-full h-12 bg-space-700 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function OffDayAnalyticsCard({ data }: OffDayAnalyticsCardProps) {
  if (!data) {
    return <LoadingSkeleton />;
  }

  if (data.total_off_days === 0) {
    return (
      <div
        className="bg-space-800 border border-saiyan-500/30 rounded-xl p-4 overflow-hidden"
        style={{ clipPath }}
      >
        <h3 className="text-sm font-semibold text-text-primary mb-3">Off-Day Impact</h3>
        <p className="text-sm text-text-muted">No off-days taken yet</p>
      </div>
    );
  }

  const pieData = Object.entries(data.reason_breakdown).map(([reason, count]) => ({
    name: reason.charAt(0).toUpperCase() + reason.slice(1),
    value: count,
    color: REASON_COLORS[reason] ?? REASON_COLORS.other,
  }));

  return (
    <div
      className="bg-space-800 border border-saiyan-500/30 rounded-xl p-4 overflow-hidden"
      style={{ clipPath }}
    >
      <h3 className="text-sm font-semibold text-text-primary mb-3">Off-Day Impact</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider">Off-Days</p>
          <p className="text-2xl font-mono font-bold text-saiyan-400 tabular-nums">{data.total_off_days}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider">XP Missed</p>
          <p className="text-2xl font-mono font-bold text-saiyan-400 tabular-nums">{data.xp_impact_estimate.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider">Streaks Saved</p>
          <p className="text-2xl font-mono font-bold text-saiyan-400 tabular-nums">{data.streaks_preserved}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider">Reasons</p>
          <p className="text-2xl font-mono font-bold text-saiyan-400 tabular-nums">{pieData.length}</p>
        </div>
      </div>

      {pieData.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid rgba(234,179,8,0.3)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap gap-3 mt-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-text-muted">{entry.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
