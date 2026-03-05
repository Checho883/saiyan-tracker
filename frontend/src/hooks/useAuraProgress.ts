import { useMemo } from 'react';
import { useHabitStore } from '../store/habitStore';

export type AuraTier = 'base' | 'kaioken_x3' | 'kaioken_x10' | 'kaioken_x20';

export function useAuraProgress() {
  const todayHabits = useHabitStore((s) => s.todayHabits);

  return useMemo(() => {
    const due = todayHabits.length;
    const completed = todayHabits.filter((h) => h.completed).length;
    const percent = due > 0 ? Math.round((completed / due) * 100) : 0;

    let tier: AuraTier = 'base';
    if (percent >= 100) tier = 'kaioken_x20';
    else if (percent >= 80) tier = 'kaioken_x10';
    else if (percent >= 50) tier = 'kaioken_x3';

    return { percent, tier, completed, due };
  }, [todayHabits]);
}
