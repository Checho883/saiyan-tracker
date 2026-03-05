import type { AnalyticsSummary } from '../../types';

interface StatCardsProps {
  summary: AnalyticsSummary | null;
}

interface StatCardData {
  label: string;
  value: string;
}

const clipPath = 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))';

function StatCard({ label, value }: StatCardData) {
  return (
    <div
      className="relative bg-space-800 border border-saiyan-500/30 p-3 overflow-hidden"
      style={{ clipPath }}
    >
      {/* Scan-line overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'linear-gradient(to bottom, rgba(234,179,8,0.05) 0%, transparent 50%, transparent 100%)',
          height: '200%',
          animation: 'scan 3s linear infinite',
        }}
      />
      <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-mono font-bold text-saiyan-400 tabular-nums mt-1">{value}</p>
      <style>{`
        @keyframes scan {
          from { transform: translateY(-50%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      className="bg-space-800 border border-space-600 p-3 overflow-hidden"
      style={{ clipPath }}
    >
      <div className="w-16 h-3 bg-space-700 rounded animate-pulse mb-2" />
      <div className="w-24 h-7 bg-space-700 rounded animate-pulse" />
    </div>
  );
}

export function StatCards({ summary }: StatCardsProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  const cards: StatCardData[] = [
    { label: 'Perfect Days', value: String(summary.perfect_days) },
    { label: 'Average', value: `${Math.round(summary.avg_completion * 100)}%` },
    { label: 'Total XP', value: summary.total_xp.toLocaleString() },
    { label: 'Longest Streak', value: `${summary.longest_streak} days` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <StatCard key={card.label} label={card.label} value={card.value} />
      ))}
    </div>
  );
}
