import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { HabitTodayResponse, CheckHabitResponse, HabitCreate, HabitUpdate } from '../types';
import { habitsApi } from '../services/api';
import { usePowerStore } from './powerStore';
import { useUiStore } from './uiStore';

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

      // Distribute to powerStore
      usePowerStore
        .getState()
        .updateFromCheck(result.power_level, result.transformation);

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
