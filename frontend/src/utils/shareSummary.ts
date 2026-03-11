import { useHabitStore } from '../store/habitStore';
import { usePowerStore } from '../store/powerStore';

/**
 * Builds a DBZ-themed daily training report string from current store state.
 * Single source of truth — imported by HeroSection and MiniHero.
 */
export function buildDailySummary(): string {
  const habits = useHabitStore.getState().todayHabits;
  const { powerLevel, transformationName } = usePowerStore.getState();
  const completed = habits.filter((h) => h.completed).length;
  const total = habits.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const bestStreak = Math.max(...habits.map((h) => h.streak_current), 0);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const lines = [
    `${today} - Saiyan Training Report`,
    ``,
    `Completion: ${completed}/${total} (${pct}%)`,
    `Power Level: ${powerLevel.toLocaleString()} - ${transformationName}`,
  ];
  if (bestStreak > 0) lines.push(`Best Streak: ${bestStreak} days`);
  lines.push('', 'Powered by Saiyan Tracker');
  return lines.join('\n');
}
