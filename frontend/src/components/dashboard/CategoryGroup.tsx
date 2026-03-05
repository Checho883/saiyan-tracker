import type { CategoryResponse, HabitTodayResponse } from '../../types';
import { HabitCard } from './HabitCard';

interface CategoryGroupProps {
  category: CategoryResponse | null;
  habits: HabitTodayResponse[];
}

export function CategoryGroup({ category, habits }: CategoryGroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
        {category ? (
          <>
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </>
        ) : (
          <span>Uncategorized</span>
        )}
      </h3>
      <div className="space-y-2">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </div>
    </div>
  );
}
