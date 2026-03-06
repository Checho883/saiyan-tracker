import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { HabitTodayResponse, CheckHabitResponse, HabitCreate, HabitUpdate, DailyLogSummary } from '../types';
import { habitsApi } from '../services/api';
import { usePowerStore } from './powerStore';
import { useUiStore } from './uiStore';
import { createElement } from 'react';

const POWER_MILESTONES = [1000, 5000, 10000, 50000];

function showDailySummary(dailyLog: DailyLogSummary) {
  toast.custom(
    (t) =>
      createElement(
        'div',
        {
          className: `bg-space-800 border border-saiyan-500/50 rounded-xl p-4 shadow-xl max-w-sm mx-auto ${t.visible ? 'animate-enter' : 'animate-leave'}`,
        },
        createElement(
          'p',
          { className: 'text-saiyan-500 font-bold text-base' },
          'Day Complete!',
        ),
        createElement(
          'div',
          { className: 'flex items-center gap-3 mt-2 text-sm' },
          createElement(
            'span',
            { className: 'text-text-primary' },
            `${Math.round(dailyLog.completion_rate * 100)}%`,
          ),
          createElement('span', { className: 'text-text-muted' }, '|'),
          createElement(
            'span',
            { className: 'text-text-primary capitalize' },
            dailyLog.completion_tier,
          ),
          createElement('span', { className: 'text-text-muted' }, '|'),
          createElement(
            'span',
            { className: 'text-saiyan-500 font-semibold' },
            `+${dailyLog.xp_earned} XP`,
          ),
        ),
      ),
    { duration: 4000, position: 'top-center' },
  );
}

interface HabitState {
  todayHabits: HabitTodayResponse[];
  isLoading: boolean;
  error: string | null;

  fetchToday: (date: string) => Promise<void>;
  checkHabit: (habitId: string, date: string) => Promise<CheckHabitResponse>;
  createHabit: (data: HabitCreate) => Promise<void>;
  updateHabit: (id: string, data: HabitUpdate) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  todayHabits: [],
  isLoading: false,
  error: null,

  fetchToday: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const habits = await habitsApi.todayList(date);
      set({ todayHabits: habits, isLoading: false });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message, isLoading: false });
    }
  },

  checkHabit: async (habitId, date) => {
    // Optimistic toggle: flip completed immediately
    const prev = get().todayHabits;
    set({
      todayHabits: prev.map((h) =>
        h.id === habitId ? { ...h, completed: !h.completed } : h
      ),
    });

    try {
      const result = await habitsApi.check(habitId, { local_date: date });

      // Update local habit state from server response
      set({
        todayHabits: get().todayHabits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                completed: result.is_checking,
                streak_current: result.habit_streak.current_streak,
                streak_best: result.habit_streak.best_streak,
              }
            : h
        ),
      });

      // Capture previous power level BEFORE update for milestone detection
      const prevPower = usePowerStore.getState().powerLevel;

      // Distribute to powerStore
      usePowerStore
        .getState()
        .updateFromCheck(
          result.power_level,
          result.transformation,
          result.transform_change?.name,
        );

      // Distribute to uiStore animation queue
      const ui = useUiStore.getState();

      if (result.transform_change) {
        ui.enqueueAnimation({
          type: 'transformation',
          form: result.transform_change.key,
          name: result.transform_change.name,
        });
      }

      if (result.capsule) {
        ui.enqueueAnimation({
          type: 'capsule_drop',
          rewardTitle: result.capsule.reward_title,
          rarity: result.capsule.reward_rarity,
        });
      }

      if (result.is_perfect_day) {
        ui.enqueueAnimation({ type: 'perfect_day' });
      }

      if (result.attribute_xp_awarded > 0) {
        // Find the habit to get its attribute for the xp popup
        const habit = get().todayHabits.find((h) => h.id === habitId);
        if (habit) {
          ui.enqueueAnimation({
            type: 'xp_popup',
            amount: result.attribute_xp_awarded,
            attribute: habit.attribute,
          });
        }
      }

      if (result.dragon_ball) {
        ui.enqueueAnimation({
          type: 'dragon_ball',
          count: result.dragon_ball.dragon_balls_collected,
        });
      }

      if (result.daily_log.completion_tier) {
        ui.enqueueAnimation({
          type: 'tier_change',
          tier: result.daily_log.completion_tier,
        });
      }

      // Parse backend events[] for new animation types
      if (result.events && result.events.length > 0) {
        for (const event of result.events) {
          if (event.type === 'level_up') {
            ui.enqueueAnimation({
              type: 'level_up',
              attribute: event.attribute as string,
              oldLevel: event.old_level as number,
              newLevel: event.new_level as number,
              title: (event.title as string) ?? null,
            });
          }
          if (event.type === 'streak_milestone') {
            ui.enqueueAnimation({
              type: 'streak_milestone',
              tier: event.tier as number,
              streak: event.streak as number,
              scope: (event.scope as string) ?? 'overall',
              badgeName: (event.badge_name as string) ?? `Milestone ${event.tier}`,
            });
          }
        }
      }

      // Zenkai recovery: fires when zenkai_activated AND is_perfect_day
      if (result.zenkai_activated && result.is_perfect_day && result.is_checking) {
        ui.enqueueAnimation({ type: 'zenkai_recovery' });
      }

      // Power milestone detection
      const crossedMilestone = POWER_MILESTONES.find(
        (m) => prevPower < m && result.power_level >= m,
      );
      if (crossedMilestone) {
        ui.enqueueAnimation({
          type: 'power_milestone',
          milestone: crossedMilestone,
        });
      }

      // Daily summary toast: fires after checking the last habit
      if (result.is_checking) {
        const updatedHabits = get().todayHabits;
        const remaining = updatedHabits.filter((h) => !h.completed);
        if (remaining.length === 0) {
          showDailySummary(result.daily_log);
        }
      }

      return result;
    } catch (err) {
      // Rollback to previous state
      set({ todayHabits: prev, error: (err as Error).message });
      toast.error((err as Error).message, { duration: 4000 });
      throw err;
    }
  },
  createHabit: async (data) => {
    try {
      await habitsApi.create(data);
      const today = new Date().toISOString().split('T')[0];
      await get().fetchToday(today);
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
    }
  },

  updateHabit: async (id, data) => {
    try {
      await habitsApi.update(id, data);
      const today = new Date().toISOString().split('T')[0];
      await get().fetchToday(today);
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
    }
  },

  deleteHabit: async (id) => {
    try {
      await habitsApi.delete(id);
      set({ todayHabits: get().todayHabits.filter((h) => h.id !== id) });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
    }
  },
}));

// Usage: import { useShallow } from 'zustand/react/shallow';
// Multi-value: const { todayHabits, isLoading } = useHabitStore(useShallow(s => ({ todayHabits: s.todayHabits, isLoading: s.isLoading })));
// Single value: const isLoading = useHabitStore(s => s.isLoading);
