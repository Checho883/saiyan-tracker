import { useEffect } from 'react';
import { useRewardStore } from '../store/rewardStore';

export function useTheme() {
  const settings = useRewardStore((s) => s.settings);
  const updateSettings = useRewardStore((s) => s.updateSettings);

  const theme = settings?.theme ?? 'dark';
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(newTheme);
    updateSettings({ theme: newTheme });
  };

  useEffect(() => {
    if (settings?.theme) {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(settings.theme);
    }
  }, [settings?.theme]);

  return { theme, isDark, toggleTheme };
}
