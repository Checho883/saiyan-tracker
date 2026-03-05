import { Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-space-700 flex items-center justify-center mb-4">
        <Plus className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-text-primary text-lg font-semibold mb-1">No habits yet</h3>
      <p className="text-text-muted text-sm mb-4">
        Create your first habit to start tracking
      </p>
      <button
        onClick={onCreateClick}
        className="bg-saiyan-500 text-white rounded-lg py-3 px-6 font-bold"
      >
        Create Habit
      </button>
    </div>
  );
}
