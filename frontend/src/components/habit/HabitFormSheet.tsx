import { Drawer } from 'vaul';
import type { HabitTodayResponse } from '../../types';
import { HabitForm } from './HabitForm';

interface HabitFormSheetProps {
  open: boolean;
  onClose: () => void;
  habit?: HabitTodayResponse;
}

export function HabitFormSheet({ open, onClose, habit }: HabitFormSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-space-800 rounded-t-2xl max-h-[85vh] overflow-y-auto outline-none">
          {/* Drag handle */}
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-space-600" />
          <Drawer.Title className="px-4 pt-4 text-lg font-bold text-text-primary">
            {habit ? 'Edit Habit' : 'New Habit'}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            {habit ? 'Edit an existing habit' : 'Create a new habit to track'}
          </Drawer.Description>
          <HabitForm habit={habit} onClose={onClose} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
