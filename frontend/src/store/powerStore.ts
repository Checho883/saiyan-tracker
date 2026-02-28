import { create } from 'zustand';
import type { PowerLevel, TransformationInfo, TransformationEvent } from '@/types';
import { powerApi } from '@/services/api';

interface PowerState {
  power: PowerLevel | null;
  transformations: TransformationInfo[];
  newTransformation: TransformationEvent | null;
  loading: boolean;

  fetchPower: () => Promise<void>;
  fetchTransformations: () => Promise<void>;
  setNewTransformation: (t: TransformationEvent | null) => void;
  updateFromCompletion: (result: { new_total_power: number; daily_points: number; daily_minimum_met: boolean; new_transformation: TransformationEvent | null }) => void;
}

export const usePowerStore = create<PowerState>((set, get) => ({
  power: null,
  transformations: [],
  newTransformation: null,
  loading: false,

  fetchPower: async () => {
    set({ loading: true });
    try {
      const power = await powerApi.current();
      set({ power, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchTransformations: async () => {
    try {
      const transformations = await powerApi.transformations();
      set({ transformations });
    } catch {}
  },

  setNewTransformation: (t) => set({ newTransformation: t }),

  updateFromCompletion: (result) => {
    const current = get().power;
    if (current) {
      set({
        power: {
          ...current,
          total_power_points: result.new_total_power,
          daily_points_today: result.daily_points,
          daily_minimum_met: result.daily_minimum_met,
        },
        newTransformation: result.new_transformation || null,
      });
    }
    // Refresh full data
    get().fetchPower();
    get().fetchTransformations();
  },
}));
