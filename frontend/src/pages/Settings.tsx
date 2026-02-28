import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, Sun, Moon } from 'lucide-react';
import { settingsApi, categoryApi } from '@/services/api';
import { useTheme } from '@/context/ThemeContext';
import type { UserSettings, TaskCategory } from '@/types';

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [dailyMin, setDailyMin] = useState(100);
  const [saved, setSaved] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, c] = await Promise.all([settingsApi.get(), categoryApi.list()]);
      setSettings(s); setCategories(c); setDailyMin(s.daily_point_minimum);
    } catch (e) { console.error('Failed to load settings:', e); }
  };

  const handleSave = async () => {
    try {
      await settingsApi.update({ daily_point_minimum: dailyMin });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error('Failed to save settings:', e); }
  };

  return (
    <motion.div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <SettingsIcon size={16} className="text-saiyan-orange" /> Settings
        </h1>

        {/* Theme */}
        <div className="card-base p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Appearance</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Theme</span>
            <button onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
              {theme === 'dark' ? <><Moon size={14} /> Dark</> : <><Sun size={14} /> Light</>}
            </button>
          </div>
        </div>

        {/* Profile */}
        {settings && (
          <div className="card-base p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Warrior Profile</h2>
            <div className="space-y-2">
              <div>
                <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Name</label>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{settings.username}</p>
              </div>
              <div>
                <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Email</label>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{settings.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Daily Minimum */}
        <div className="card-base p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Daily Power Minimum</h2>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Minimum power points needed each day to keep your streak alive.
          </p>
          <div className="flex items-center gap-4">
            <input type="range" min={25} max={500} step={25} value={dailyMin}
              onChange={e => setDailyMin(Number(e.target.value))} className="flex-1 accent-saiyan-orange" />
            <span className="text-xl font-bold font-power text-saiyan-orange w-16 text-right">{dailyMin}</span>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave}
            className={`mt-4 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 text-white ${saved ? 'bg-green-500' : 'bg-saiyan-orange hover:bg-orange-600'}`}>
            <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
          </motion.button>
        </div>

        {/* Categories */}
        <div className="card-base p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Categories</h2>
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color_code }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                </div>
                <span className="text-sm font-bold font-power text-saiyan-orange">{cat.point_multiplier}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transformations */}
        <div className="card-base p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Transformation Thresholds</h2>
          <div className="space-y-1.5">
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
                <span className="text-xs font-medium" style={{ color: t.color }}>{t.name}</span>
                <span className="text-xs font-power" style={{ color: 'var(--text-muted)' }}>{t.threshold.toLocaleString()} PL</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </motion.div>
  );
}
