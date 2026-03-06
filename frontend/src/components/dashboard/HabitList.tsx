import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { useRewardStore } from '../../store/rewardStore';
import { CategoryGroup } from './CategoryGroup';
import type { CategoryResponse, HabitTodayResponse } from '../../types';

export function HabitList() {
  const todayHabits = useHabitStore((s) => s.todayHabits);
  const categories = useRewardStore((s) => s.categories);

  const groups = useMemo(() => {
    // Group habits by category_id
    const grouped = todayHabits.reduce<Record<string, HabitTodayResponse[]>>(
      (acc, habit) => {
        const key = habit.category_id ?? '__uncategorized__';
        if (!acc[key]) acc[key] = [];
        acc[key].push(habit);
        return acc;
      },
      {}
    );

    // Build sorted group entries
    const categoryMap = new Map<string, CategoryResponse>();
    for (const cat of categories) {
      categoryMap.set(cat.id, cat);
    }

    const entries = Object.entries(grouped).map(([catId, habits]) => ({
      category: catId === '__uncategorized__' ? null : (categoryMap.get(catId) ?? null),
      habits: [...habits].sort((a, b) => a.sort_order - b.sort_order),
      sortOrder: catId === '__uncategorized__' ? Infinity : (categoryMap.get(catId)?.sort_order ?? 999),
    }));

    entries.sort((a, b) => a.sortOrder - b.sortOrder);
    return entries;
  }, [todayHabits, categories]);

  if (todayHabits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-space-700 flex items-center justify-center mb-3">
          <Plus className="w-6 h-6 text-text-muted" />
        </div>
        <p className="text-text-secondary text-sm">No habits yet</p>
        <p className="text-text-muted text-xs mt-1">Create your first habit</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(({ category, habits }) => (
        <CategoryGroup
          key={category?.id ?? '__uncategorized__'}
          category={category}
          habits={habits}
        />
      ))}
    </div>
  );
}
