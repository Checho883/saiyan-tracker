import { useState, useEffect } from 'react';
import { RotateCcw, Archive } from 'lucide-react';
import { habitsApi } from '../../services/api';
import type { HabitResponse } from '../../types';

export function ArchivedHabitsSection() {
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    habitsApi.listArchived()
      .then(setHabits)
      .catch(() => { /* API layer handles toast */ })
      .finally(() => setIsLoading(false));
  }, []);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await habitsApi.restore(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch {
      /* API layer handles toast */
    } finally {
      setRestoringId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-6 text-text-muted text-sm">
        Loading...
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-space-700 flex items-center justify-center mb-3">
          <Archive className="w-6 h-6 text-text-muted" />
        </div>
        <p className="text-text-muted text-sm">No archived habits</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {habits.map((habit) => (
        <div
          key={habit.id}
          className="flex items-center justify-between bg-space-700 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base flex-shrink-0">{habit.icon_emoji}</span>
            <span className="text-sm text-text-primary truncate">{habit.title}</span>
          </div>
          <button
            onClick={() => handleRestore(habit.id)}
            disabled={restoringId === habit.id}
            className="flex items-center gap-1 text-sm text-saiyan-500 hover:text-saiyan-400 transition-colors disabled:opacity-50 flex-shrink-0 ml-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore
          </button>
        </div>
      ))}
    </div>
  );
}
