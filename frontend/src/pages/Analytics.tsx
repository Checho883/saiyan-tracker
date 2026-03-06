import { useState } from 'react';
import type { AnalyticsPeriod } from '../types';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { PeriodSelector } from '../components/analytics/PeriodSelector';
import { StatCards } from '../components/analytics/StatCards';
import { CalendarHeatmap } from '../components/analytics/CalendarHeatmap';
import { AttributeChart } from '../components/analytics/AttributeChart';
import { PowerLevelChart } from '../components/analytics/PowerLevelChart';
import { CapsuleHistoryList } from '../components/analytics/CapsuleHistoryList';
import { WishHistoryList } from '../components/analytics/WishHistoryList';

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function shiftMonth(month: string, delta: number): string {
  const [yearStr, monthStr] = month.split('-');
  let year = Number(yearStr);
  let m = Number(monthStr) + delta;
  if (m < 1) {
    m = 12;
    year -= 1;
  } else if (m > 12) {
    m = 1;
    year += 1;
  }
  return `${year}-${String(m).padStart(2, '0')}`;
}

export default function Analytics() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('all');
  const [month, setMonth] = useState(getCurrentMonth);

  const { summary, calendarDays } = useAnalyticsData(period, month);

  return (
    <div className="p-4 space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-saiyan-500">Analytics</h1>

      <PeriodSelector period={period} onChange={setPeriod} />

      <StatCards summary={summary} />

      <CalendarHeatmap
        days={calendarDays}
        month={month}
        onPrev={() => setMonth((m) => shiftMonth(m, -1))}
        onNext={() => setMonth((m) => shiftMonth(m, 1))}
      />

      <AttributeChart calendarDays={calendarDays} />

      <PowerLevelChart calendarDays={calendarDays} />

      <CapsuleHistoryList />

      <WishHistoryList />
    </div>
  );
}
