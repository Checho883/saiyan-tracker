import { motion } from 'motion/react';

interface RemainingHabit {
  title: string;
  icon_emoji: string;
}

interface NudgeBannerProps {
  remainingHabits: RemainingHabit[];
}

function formatHabitList(habits: RemainingHabit[]): string {
  if (habits.length === 1) {
    return `${habits[0].icon_emoji} ${habits[0].title}`;
  }
  return `${habits[0].icon_emoji} ${habits[0].title} and ${habits[1].icon_emoji} ${habits[1].title}`;
}

/**
 * Motivational nudge banner that appears when 1-2 habits remain unchecked.
 * DBZ-themed motivational tone. Fixed position above bottom tab bar.
 */
export function NudgeBanner({ remainingHabits }: NudgeBannerProps) {
  if (remainingHabits.length === 0) return null;

  return (
    <motion.div
      className="fixed bottom-20 left-4 right-4 z-40"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="bg-saiyan-500/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
        <p className="text-white text-sm font-medium text-center" data-testid="nudge-message">
          Almost there, warrior! Just {formatHabitList(remainingHabits)} left!
        </p>
      </div>
    </motion.div>
  );
}
