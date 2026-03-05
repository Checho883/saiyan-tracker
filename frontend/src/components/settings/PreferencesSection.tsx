import { useState, useEffect, useRef } from 'react';
import { useRewardStore } from '../../store/rewardStore';
import { useTheme } from '../../hooks/useTheme';
import { offDaysApi } from '../../services/api';
import { OffDaySelector } from './OffDaySelector';
import type { OffDayReason, OffDayResponse } from '../../types';

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-primary">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-saiyan-500' : 'bg-space-600'
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function PreferencesSection() {
  const settings = useRewardStore((s) => s.settings);
  const updateSettings = useRewardStore((s) => s.updateSettings);
  const { isDark, toggleTheme } = useTheme();

  const [displayNameDraft, setDisplayNameDraft] = useState(settings?.display_name ?? '');
  const [showOffDaySelector, setShowOffDaySelector] = useState(false);
  const [todayOffDay, setTodayOffDay] = useState<OffDayResponse | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync display name from settings
  useEffect(() => {
    if (settings?.display_name !== undefined) {
      setDisplayNameDraft(settings.display_name);
    }
  }, [settings?.display_name]);

  // Check if today is an off-day
  useEffect(() => {
    const today = getTodayDate();
    const month = today.slice(0, 7);
    offDaysApi.list(month).then((offDays) => {
      const match = offDays.find((od) => od.off_date === today);
      setTodayOffDay(match ?? null);
    }).catch(() => { /* ignore */ });
  }, []);

  // Debounced display name save
  const handleDisplayNameChange = (value: string) => {
    setDisplayNameDraft(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSettings({ display_name: value });
    }, 500);
  };

  const handleMarkOffDay = async (reason: OffDayReason) => {
    try {
      await offDaysApi.create({ local_date: getTodayDate(), reason });
      // Refetch to get the OffDayResponse
      const today = getTodayDate();
      const month = today.slice(0, 7);
      const offDays = await offDaysApi.list(month);
      const match = offDays.find((od) => od.off_date === today);
      setTodayOffDay(match ?? null);
      setShowOffDaySelector(false);
    } catch {
      /* toast handled by API layer */
    }
  };

  const handleUndoOffDay = async () => {
    try {
      await offDaysApi.delete(getTodayDate());
      setTodayOffDay(null);
    } catch {
      /* toast handled by API layer */
    }
  };

  return (
    <div className="space-y-5">
      {/* Display Name */}
      <div>
        <label htmlFor="display-name" className="block text-sm text-text-secondary mb-1">
          Display Name
        </label>
        <input
          id="display-name"
          type="text"
          value={displayNameDraft}
          onChange={(e) => handleDisplayNameChange(e.target.value)}
          placeholder="Enter your name"
          className="w-full bg-space-700 border border-space-600 rounded-lg p-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-saiyan-500"
        />
      </div>

      {/* Sound Toggle */}
      <ToggleSwitch
        checked={settings?.sound_enabled ?? false}
        onChange={() => updateSettings({ sound_enabled: !settings?.sound_enabled })}
        label="Sound Effects"
      />

      {/* Theme Toggle */}
      <ToggleSwitch
        checked={isDark}
        onChange={toggleTheme}
        label={isDark ? 'Dark Theme' : 'Light Theme'}
      />

      {/* Off-Day */}
      <div className="pt-2 border-t border-space-600">
        <h4 className="text-sm font-medium text-text-primary mb-2">Off Day</h4>
        {todayOffDay ? (
          <div className="flex items-center justify-between bg-space-700 rounded-lg p-3">
            <div>
              <p className="text-sm text-text-primary">Today is an off day</p>
              <p className="text-xs text-text-muted capitalize">{todayOffDay.reason}</p>
            </div>
            <button
              onClick={handleUndoOffDay}
              className="text-sm text-danger hover:text-danger/80 transition-colors"
            >
              Undo
            </button>
          </div>
        ) : showOffDaySelector ? (
          <OffDaySelector
            onSelect={handleMarkOffDay}
            onCancel={() => setShowOffDaySelector(false)}
          />
        ) : (
          <button
            onClick={() => setShowOffDaySelector(true)}
            className="w-full bg-space-700 hover:bg-space-600 rounded-lg p-3 text-sm text-text-primary transition-colors"
          >
            Mark today as off day
          </button>
        )}
      </div>
    </div>
  );
}
