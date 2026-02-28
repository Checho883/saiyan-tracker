import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsApi, powerApi, settingsApi } from '@/services/api';
import WeeklyChart from '@/components/analytics/WeeklyChart';
import CategoryBreakdownChart from '@/components/analytics/CategoryBreakdownChart';
import PowerHistoryChart from '@/components/analytics/PowerHistoryChart';
import type { WeeklyAnalytics, CategoryBreakdown, PowerHistoryEntry } from '@/types';

export default function Analytics() {
  const [weekly, setWeekly] = useState<WeeklyAnalytics | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [powerHistory, setPowerHistory] = useState<PowerHistoryEntry[]>([]);
  const [dailyMinimum, setDailyMinimum] = useState(100);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      const [w, c, p, s] = await Promise.all([
        analyticsApi.weekly(),
        analyticsApi.categoryBreakdown(timeRange),
        powerApi.history(timeRange),
        settingsApi.get(),
      ]);
      setWeekly(w);
      setCategories(c);
      setPowerHistory(p);
      setDailyMinimum(s.daily_point_minimum);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    }
  };

  return (
    <div className="min-h-screen bg-saiyan-dark">
      {/* Header */}
      <header className="border-b border-saiyan-border bg-saiyan-darker px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-saiyan-muted hover:text-saiyan-text">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-saiyan-text flex items-center gap-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <TrendingUp size={20} className="text-saiyan-orange" />
                Power Analytics
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setTimeRange(d)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  timeRange === d ? 'bg-saiyan-orange text-white' : 'border border-saiyan-border text-saiyan-muted hover:text-saiyan-text'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        {weekly && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-saiyan-card border border-saiyan-border rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-saiyan-orange" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {weekly.total_points.toLocaleString()}
              </p>
              <p className="text-xs text-saiyan-muted mt-1">Weekly Points</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-saiyan-card border border-saiyan-border rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-saiyan-blue" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {weekly.average_daily.toFixed(0)}
              </p>
              <p className="text-xs text-saiyan-muted mt-1">Daily Average</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-saiyan-card border border-saiyan-border rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {weekly.days_minimum_met}/{weekly.days.length}
              </p>
              <p className="text-xs text-saiyan-muted mt-1">Days Min Met</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-saiyan-card border border-saiyan-border rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-saiyan-gold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {Math.round((weekly.days_minimum_met / Math.max(weekly.days.length, 1)) * 100)}%
              </p>
              <p className="text-xs text-saiyan-muted mt-1">Success Rate</p>
            </motion.div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {weekly && <WeeklyChart days={weekly.days} dailyMinimum={dailyMinimum} />}
          <CategoryBreakdownChart data={categories} />
          <div className="lg:col-span-2">
            <PowerHistoryChart data={powerHistory} />
          </div>
        </div>
      </main>
    </div>
  );
}
