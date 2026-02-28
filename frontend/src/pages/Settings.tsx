import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings as SettingsIcon, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { settingsApi, categoryApi } from '@/services/api';
import type { UserSettings, TaskCategory } from '@/types';

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [dailyMin, setDailyMin] = useState(100);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, c] = await Promise.all([settingsApi.get(), categoryApi.list()]);
      setSettings(s);
      setCategories(c);
      setDailyMin(s.daily_point_minimum);
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  const handleSave = async () => {
    try {
      await settingsApi.update({ daily_point_minimum: dailyMin });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  return (
    <div className="min-h-screen bg-saiyan-dark">
      <header className="border-b border-saiyan-border bg-saiyan-darker px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-saiyan-muted hover:text-saiyan-text">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-saiyan-text flex items-center gap-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            <SettingsIcon size={20} className="text-saiyan-orange" />
            Settings
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {/* Profile */}
        {settings && (
          <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-5">
            <h2 className="text-sm text-saiyan-muted uppercase tracking-wider mb-4">Warrior Profile</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-saiyan-muted">Name</label>
                <p className="text-saiyan-text font-semibold">{settings.username}</p>
              </div>
              <div>
                <label className="text-xs text-saiyan-muted">Email</label>
                <p className="text-saiyan-text">{settings.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Daily Minimum */}
        <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-5">
          <h2 className="text-sm text-saiyan-muted uppercase tracking-wider mb-4">Daily Power Minimum</h2>
          <p className="text-sm text-saiyan-muted mb-3">
            The minimum power points you need to earn each day to keep your streak alive.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={25}
              max={500}
              step={25}
              value={dailyMin}
              onChange={e => setDailyMin(Number(e.target.value))}
              className="flex-1 accent-saiyan-orange"
            />
            <span className="text-2xl font-bold text-saiyan-orange w-20 text-right" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {dailyMin}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className={`mt-4 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 ${
              saved ? 'bg-green-500 text-white' : 'bg-saiyan-orange text-white hover:bg-orange-600'
            }`}
          >
            <Save size={16} />
            {saved ? 'Saved!' : 'Save Changes'}
          </motion.button>
        </div>

        {/* Categories */}
        <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-5">
          <h2 className="text-sm text-saiyan-muted uppercase tracking-wider mb-4">Task Categories</h2>
          <div className="space-y-3">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-saiyan-darker rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color_code }} />
                  <span className="text-saiyan-text font-medium">{cat.name}</span>
                </div>
                <span className="text-saiyan-orange font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {cat.point_multiplier}x
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Transformation Thresholds Info */}
        <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-5">
          <h2 className="text-sm text-saiyan-muted uppercase tracking-wider mb-4">Transformation Thresholds</h2>
          <div className="space-y-2">
            {[
              { name: 'Base Form', threshold: 0, color: '#888899' },
              { name: 'Super Saiyan', threshold: 500, color: '#FFD700' },
              { name: 'Super Saiyan 2', threshold: 1500, color: '#FFD700' },
              { name: 'Super Saiyan 3', threshold: 3500, color: '#FFD700' },
              { name: 'Super Saiyan God', threshold: 7000, color: '#FF4444' },
              { name: 'Super Saiyan Blue', threshold: 12000, color: '#1E90FF' },
              { name: 'Ultra Instinct', threshold: 20000, color: '#C0C0FF' },
            ].map(t => (
              <div key={t.name} className="flex items-center justify-between py-1">
                <span className="text-sm" style={{ color: t.color }}>{t.name}</span>
                <span className="text-sm text-saiyan-muted" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {t.threshold.toLocaleString()} PL
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
