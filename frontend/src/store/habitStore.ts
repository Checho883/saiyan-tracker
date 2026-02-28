import { create } from 'zustand';
import type { Habit, HabitToday, HabitCheckResult, HabitCalendarResponse } from '@/types';
import { habitApi } from '@/services/api';

interface HabitState {
  habits: Habit[];
  todayHabits: HabitToday[];
  calendar: HabitCalendarResponse | null;
  loading: boolean;

  fetchHabits: () => Promise<void>;
  fetchTodayHabits: () => Promise<void>;
  fetchCalendar: (year?: number, month?: number) => Promise<void>;
  createHabit: (data: Parameters<typeof habitApi.create>[0]) => Promise<Habit>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  checkHabit: (id: string) => Promise<HabitCheckResult>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  todayHabits: [],
  calendar: null,
  loading: false,

  fetchHabits: async () => {
    const habits = await habitApi.list();
    set({ habits });
  },

  fetchTodayHabits: async () => {
    set({ loading: true });
    const todayHabits = await habitApi.today();
    set({ todayHabits, loading: false });
  },

  fetchCalendar: async (year?: number, month?: number) => {
    const calendar = await habitApi.calendar(year, month);
    set({ calendar });
  },

  createHabit: async (data) => {
    const habit = await habitApi.create(data);
    await get().fetchHabits();
    await get().fetchTodayHabits();
    return habit;
  },

  updateHabit: async (id, data) => {
    await habitApi.update(id, data);
    await get().fetchHabits();
    await get().fetchTodayHabits();
  },

  deleteHabit: async (id) => {
    await habitApi.delete(id);
    await get().fetchHabits();
    await get().fetchTodayHabits();
  },

  checkHabit: async (id) => {
    const result = await habitApi.check(id);
    await get().fetchTodayHabits();
    return result;
  },
}));
