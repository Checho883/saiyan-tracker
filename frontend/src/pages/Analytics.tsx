import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { analyticsApi, powerApi, settingsApi, habitApi } from '@/services/api';
import WeeklyChart from '@/components/analytics/WeeklyChart';
import CategoryBreakdownChart from '@/components/analytics/CategoryBreakdownChart';
import PowerHistoryChart from '@/components/analytics/PowerHistoryChart';
import type { WeeklyAnalytics, CategoryBreakdown, PowerHistoryEntry, HabitCalendarResponse } from '@/types';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface CalendarProps {
  calendar: HabitCalendarResponse | null;
  onNavigate: (year: number, month: number) => void;
}

function CalendarHeatmap({ calendar, onNavigate }: CalendarProps) {
  if (!calendar) return null;
  const firstDay = new Date(calendar.year, calendar.month - 1, 1).getDay();
  const now = new Date();
  const isCurrentMonth = calendar.year === now.getFullYear() && calendar.month === now.getMonth() + 1;

  const goPrev = () => {
    const m = calendar.month - 1;
    if (m < 1) onNavigate(calendar.year - 1, 12);
    else onNavigate(calendar.year, m);
  };

  const goNext = () => {
    if (isCurrentMonth) return;
    const m = calendar.month + 1;
    if (m > 12) onNavigate(calendar.year + 1, 1);
    else onNavigate(calendar.year, m);
  };

  const getColor = (rate: number) => {
    if (rate === 0) return 'var(--border-color)';
    if (rate < 50) return 'rgba(255, 107, 0, 0.3)';
    if (rate < 100) return 'rgba(255, 107, 0, 0.6)';
    return '#FFD700';
  };

  return (
    <div className="card-base p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Calendar size={14} className="text-saiyan-orange" /> Habit Calendar
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={goPrev} className="p-1 rounded hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-bold min-w-[140px] text-center" style={{ color: 'var(--text-primary)' }}>
            {MONTH_NAMES[calendar.month - 1]} {calendar.year}
          </span>
          <button onClick={goNext} disabled={isCurrentMonth}
            className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-30"
            style={{ color: 'var(--text-muted)' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <span key={i} className="text-xs" style={{ color: 'var(--text-muted)' }}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {calendar.days.map((day) => {
          const isToday = day.date === now.toISOString().slice(0, 10);
          return (
            <div
              key={day.date}
              className="aspect-square rounded-sm flex items-center justify-center text-xs font-medium"
              style={{
                background: getColor(day.completion_rate),
                color: day.completion_rate >= 100 ? '#000' : 'var(--text-muted)',
                boxShadow: day.completion_rate >= 100
                  ? '0 0 6px rgba(255, 215, 0, 0.4)'
                  : isToday ? '0 0 0 2px #FF6B00' : 'none',
              }}
              title={`${day.date}: ${day.habits_completed}/${day.habits_due} (${day.completion_rate}%)`}
            >
              {new Date(day.date + 'T00:00').getDate()}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-2 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>Less</span>
        {[0, 30, 60, 100].map(r => (
          <div key={r} className="w-3 h-3 rounded-sm" style={{ background: getColor(r) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [weekly, setWeekly] = useState<WeeklyAnalytics | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [powerHistory, setPowerHistory] = useState<PowerHistoryEntry[]>([]);
  const [calendar, setCalendar] = useState<HabitCalendarResponse | null>(null);
  const [dailyMinimum, setDailyMinimum] = useState(100);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => { loadData(); }, [timeRange]);

  const loadData = async () => {
    try {
      const now = new Date();
      const [w, c, p, s, cal] = await Promise.all([
        analyticsApi.weekly(),
        analyticsApi.categoryBreakdown(timeRange),
        powerApi.history(timeRange),
        settingsApi.get(),
        habitApi.calendar(now.getFullYear(), now.getMonth() + 1),
      ]);
      setWeekly(w);
      setCategories(c);
      setPowerHistory(p);
      setDailyMinimum(s.daily_point_minimum);
      setCalendar(cal);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    }
  };

  const navigateCalendar = async (year: number, month: number) => {
    try {
      const cal = await habitApi.calendar(year, month);
      setCalendar(cal);
    } catch (e) {
      console.error('Failed to load calendar:', e);
    }
  };

  const statCards = weekly ? [
    { label: 'Weekly Points', value: weekly.total_points.toLocaleString(), color: '#FF6B00' },
    { label: 'Daily Average', value: weekly.average_daily.toFixed(0), color: '#1E90FF' },
    { label: 'Days Min Met', value: `${weekly.days_minimum_met}/${weekly.days.length}`, color: '#10B981' },
    { label: 'Success Rate', value: `${Math.round((weekly.days_minimum_met / Math.max(weekly.days.length, 1)) * 100)}%`, color: '#FFD700' },
  ] : [];

  return (
    <motion.div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={16} className="text-saiyan-orange" /> Power Analytics
          </h1>
          <div className="flex gap-1">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setTimeRange(d)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${timeRange === d ? 'bg-saiyan-orange text-white' : ''}`}
                style={timeRange !== d ? { border: '1px solid var(--border-color)', color: 'var(--text-muted)' } : {}}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} className="card-base p-3 text-center">
              <p className="text-xl font-bold font-power" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Calendar Heatmap */}
        <div className="mb-5">
          <CalendarHeatmap calendar={calendar} onNavigate={navigateCalendar} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {weekly && <WeeklyChart days={weekly.days} dailyMinimum={dailyMinimum} />}
          <CategoryBreakdownChart data={categories} />
          <div className="lg:col-span-2">
            <PowerHistoryChart data={powerHistory} />
          </div>
        </div>
      </main>
    </motion.div>
  );
}
