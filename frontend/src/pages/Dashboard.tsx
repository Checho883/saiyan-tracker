import { useRef, useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { useUiStore } from '../store/uiStore';
import { HeroSection } from '../components/dashboard/HeroSection';
import { MiniHero } from '../components/dashboard/MiniHero';
import { StatsPanel } from '../components/dashboard/StatsPanel';
import { HabitList } from '../components/dashboard/HabitList';
import { HabitFormSheet } from '../components/habit/HabitFormSheet';
import { DeleteConfirmDialog } from '../components/habit/DeleteConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { NudgeBanner } from '../components/dashboard/NudgeBanner';
import { RoastWelcomeCard } from '../components/dashboard/RoastWelcomeCard';
import { StreakBreakCard } from '../components/dashboard/StreakBreakCard';
import { AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const todayHabits = useHabitStore((s) => s.todayHabits);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const activeModal = useUiStore((s) => s.activeModal);
  const openModal = useUiStore((s) => s.openModal);
  const closeModal = useUiStore((s) => s.closeModal);

  // Collapsing hero via IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Derive modal state
  const isFormOpen = activeModal === 'habit-create' || (activeModal?.startsWith('habit-edit-') ?? false);
  const isDeleteOpen = activeModal?.startsWith('habit-delete-') ?? false;

  const editingHabit = useMemo(() => {
    if (!activeModal?.startsWith('habit-edit-')) return undefined;
    const id = activeModal.replace('habit-edit-', '');
    return todayHabits.find((h) => h.id === id);
  }, [activeModal, todayHabits]);

  const deletingHabit = useMemo(() => {
    if (!activeModal?.startsWith('habit-delete-')) return undefined;
    const id = activeModal.replace('habit-delete-', '');
    return todayHabits.find((h) => h.id === id);
  }, [activeModal, todayHabits]);

  // Nudge banner: show when 1-2 habits remain and total > 2
  const remainingHabits = useMemo(
    () => todayHabits.filter((h) => !h.completed),
    [todayHabits],
  );
  const showNudge =
    remainingHabits.length >= 1 &&
    remainingHabits.length <= 2 &&
    todayHabits.length > 2;

  const handleDelete = () => {
    if (deletingHabit) {
      deleteHabit(deletingHabit.id);
    }
  };

  const handleArchive = () => {
    if (deletingHabit) {
      updateHabit(deletingHabit.id, { is_active: false });
    }
  };

  return (
    <div className="pb-20">
      {/* Sticky mini hero when hero scrolls out */}
      {!heroVisible && (
        <div className="fixed top-0 left-0 right-0 z-30 transition-all duration-300">
          <MiniHero />
        </div>
      )}

      {/* Sentinel for IntersectionObserver */}
      <div ref={sentinelRef} className="h-px" />

      {/* Roast/Welcome Card */}
      <RoastWelcomeCard />

      {/* Streak Break Card */}
      <StreakBreakCard />

      {/* Hero Section */}
      <HeroSection />

      {/* Content with consistent spacing */}
      <div className="px-4 space-y-4 mt-4">
        <StatsPanel />
        {todayHabits.length === 0 ? (
          <EmptyState onCreateClick={() => openModal('habit-create')} />
        ) : (
          <HabitList />
        )}
      </div>

      {/* FAB: Create habit */}
      <button
        onClick={() => openModal('habit-create')}
        className="fixed bottom-20 right-4 z-20 w-14 h-14 rounded-full bg-saiyan-500 text-white shadow-lg flex items-center justify-center hover:bg-saiyan-600 transition-colors"
        aria-label="Create habit"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Habit Form Sheet */}
      <HabitFormSheet
        open={isFormOpen}
        onClose={closeModal}
        habit={editingHabit}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={isDeleteOpen}
        onClose={closeModal}
        onConfirm={handleDelete}
        onArchive={handleArchive}
        habitTitle={deletingHabit?.title ?? ''}
      />

      {/* Nudge Banner */}
      <AnimatePresence>
        {showNudge && (
          <NudgeBanner
            remainingHabits={remainingHabits.map((h) => ({
              title: h.title,
              icon_emoji: h.icon_emoji,
            }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
