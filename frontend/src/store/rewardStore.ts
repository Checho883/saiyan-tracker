import { create } from 'zustand';
import toast from 'react-hot-toast';
import type {
  RewardResponse,
  RewardCreate,
  RewardUpdate,
  WishResponse,
  WishCreate,
  WishUpdate,
  CategoryResponse,
  CategoryCreate,
  CategoryUpdate,
  SettingsResponse,
  SettingsUpdate,
} from '../types';
import {
  rewardsApi,
  wishesApi,
  categoriesApi,
  settingsApi,
} from '../services/api';

interface RewardState {
  rewards: RewardResponse[];
  wishes: WishResponse[];
  categories: CategoryResponse[];
  settings: SettingsResponse | null;
  isLoading: boolean;
  error: string | null;

  // Fetch actions
  fetchRewards: () => Promise<void>;
  fetchWishes: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSettings: () => Promise<void>;

  // Reward CRUD
  createReward: (data: RewardCreate) => Promise<void>;
  updateReward: (id: string, data: RewardUpdate) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;

  // Wish CRUD
  createWish: (data: WishCreate) => Promise<void>;
  updateWish: (id: string, data: WishUpdate) => Promise<void>;
  deleteWish: (id: string) => Promise<void>;

  // Category CRUD
  createCategory: (data: CategoryCreate) => Promise<void>;
  updateCategory: (id: string, data: CategoryUpdate) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Settings
  updateSettings: (data: SettingsUpdate) => Promise<void>;
}

export const useRewardStore = create<RewardState>((set, get) => ({
  rewards: [],
  wishes: [],
  categories: [],
  settings: null,
  isLoading: false,
  error: null,

  // -- Fetch actions --

  fetchRewards: async () => {
    set({ isLoading: true, error: null });
    try {
      const rewards = await rewardsApi.list();
      set({ rewards, isLoading: false });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message, isLoading: false });
    }
  },

  fetchWishes: async () => {
    set({ isLoading: true, error: null });
    try {
      const wishes = await wishesApi.list();
      set({ wishes, isLoading: false });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message, isLoading: false });
    }
  },

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoriesApi.list();
      set({ categories, isLoading: false });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message, isLoading: false });
    }
  },

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await settingsApi.get();
      set({ settings, isLoading: false });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message, isLoading: false });
    }
  },

  // -- Reward CRUD --

  createReward: async (data) => {
    try {
      const reward = await rewardsApi.create(data);
      set({ rewards: [...get().rewards, reward] });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message });
    }
  },

  updateReward: async (id, data) => {
    try {
      const updated = await rewardsApi.update(id, data);
      set({ rewards: get().rewards.map((r) => (r.id === id ? updated : r)) });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message });
    }
  },

  deleteReward: async (id) => {
    try {
      await rewardsApi.delete(id);
      set({ rewards: get().rewards.filter((r) => r.id !== id) });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message });
    }
  },

  // -- Wish CRUD --

  createWish: async (data) => {
    try {
      const wish = await wishesApi.create(data);
      set({ wishes: [...get().wishes, wish] });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message });
    }
  },

  updateWish: async (id, data) => {
    try {
      const updated = await wishesApi.update(id, data);
      set({ wishes: get().wishes.map((w) => (w.id === id ? updated : w)) });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message });
    }
  },

  deleteWish: async (id) => {
    try {
      await wishesApi.delete(id);
      set({ wishes: get().wishes.filter((w) => w.id !== id) });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message });
    }
  },

  // -- Category CRUD --

  createCategory: async (data) => {
    try {
      const category = await categoriesApi.create(data);
      set({ categories: [...get().categories, category] });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message });
    }
  },

  updateCategory: async (id, data) => {
    try {
      const updated = await categoriesApi.update(id, data);
      set({
        categories: get().categories.map((c) => (c.id === id ? updated : c)),
      });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message });
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoriesApi.delete(id);
      set({ categories: get().categories.filter((c) => c.id !== id) });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message });
    }
  },

  // -- Settings --

  updateSettings: async (data) => {
    try {
      const settings = await settingsApi.update(data);
      set({ settings });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message });
    }
  },
}));

// Usage: import { useShallow } from 'zustand/react/shallow';
// Multi-value: const { rewards, wishes, isLoading } = useRewardStore(useShallow(s => ({ rewards: s.rewards, wishes: s.wishes, isLoading: s.isLoading })));
// Single value: const settings = useRewardStore(s => s.settings);
