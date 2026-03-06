import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { CategoryResponse, HabitTodayResponse } from '../../types';
import { useHabitStore } from '../../store/habitStore';
import { HabitCard } from './HabitCard';

interface CategoryGroupProps {
  category: CategoryResponse | null;
  habits: HabitTodayResponse[];
}

export function CategoryGroup({ category, habits }: CategoryGroupProps) {
  const reorderHabits = useHabitStore((s) => s.reorderHabits);

  // Sort habits by sort_order within this category
  const sortedHabits = [...habits].sort((a, b) => a.sort_order - b.sort_order);
  const habitIds = sortedHabits.map((h) => h.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = habitIds.indexOf(active.id as string);
    const newIndex = habitIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    // Build new order
    const newIds = [...habitIds];
    newIds.splice(oldIndex, 1);
    newIds.splice(newIndex, 0, active.id as string);

    reorderHabits(category?.id ?? null, newIds);
  };

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
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={habitIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sortedHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
