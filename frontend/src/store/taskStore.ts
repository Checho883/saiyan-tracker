import { create } from 'zustand';
import type { Task, TaskCategory, TaskCompletion, CompletionResult, EnergyLevel } from '@/types';
import { taskApi, categoryApi, completionApi } from '@/services/api';

interface TaskState {
  tasks: Task[];
  categories: TaskCategory[];
  todayCompletions: TaskCompletion[];
  selectedEnergy: EnergyLevel | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchTasks: (energy?: string, categoryId?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTodayCompletions: () => Promise<void>;
  createTask: (data: Parameters<typeof taskApi.create>[0]) => Promise<Task>;
  completeTask: (taskId: string, energy?: string) => Promise<CompletionResult>;
  undoCompletion: (id: string) => Promise<void>;
  setSelectedEnergy: (energy: EnergyLevel | null) => void;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  categories: [],
  todayCompletions: [],
  selectedEnergy: null,
  loading: false,
  error: null,

  fetchTasks: async (energy?: string, categoryId?: string) => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskApi.list({ energy_level: energy, category_id: categoryId });
      set({ tasks, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await categoryApi.list();
      set({ categories });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  fetchTodayCompletions: async () => {
    try {
      const completions = await completionApi.today();
      set({ todayCompletions: completions });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  createTask: async (data) => {
    const task = await taskApi.create(data);
    await get().fetchTasks();
    return task;
  },

  completeTask: async (taskId: string, energy?: string) => {
    const result = await completionApi.complete({
      task_id: taskId,
      energy_at_completion: energy || get().selectedEnergy || undefined,
    });
    await get().fetchTodayCompletions();
    return result;
  },

  undoCompletion: async (id: string) => {
    await completionApi.undo(id);
    await get().fetchTodayCompletions();
  },

  setSelectedEnergy: (energy) => set({ selectedEnergy: energy }),

  deleteTask: async (id: string) => {
    await taskApi.delete(id);
    await get().fetchTasks();
  },
}));
