import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { AttributeDetail } from '../types';
import { powerApi } from '../services/api';

interface PowerState {
  powerLevel: number;
  transformation: string;
  transformationName: string;
  nextTransformation: string | null;
  nextThreshold: number | null;
  dragonBallsCollected: number;
  wishesGranted: number;
  attributes: AttributeDetail[];
  isLoading: boolean;
  error: string | null;

  fetchPower: () => Promise<void>;
  updateFromCheck: (powerLevel: number, transformation: string) => void;
}

export const usePowerStore = create<PowerState>((set) => ({
  powerLevel: 0,
  transformation: '',
  transformationName: '',
  nextTransformation: null,
  nextThreshold: null,
  dragonBallsCollected: 0,
  wishesGranted: 0,
  attributes: [],
  isLoading: false,
  error: null,

  fetchPower: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await powerApi.current();
      set({
        powerLevel: data.power_level,
        transformation: data.transformation,
        transformationName: data.transformation_name,
        nextTransformation: data.next_transformation,
        nextThreshold: data.next_threshold,
        dragonBallsCollected: data.dragon_balls_collected,
        wishesGranted: data.wishes_granted,
        attributes: data.attributes,
        isLoading: false,
      });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message, { duration: 4000 });
      set({ error: message, isLoading: false });
    }
  },

  updateFromCheck: (powerLevel, transformation) => {
    set({ powerLevel, transformation });
  },
}));

// Usage: import { useShallow } from 'zustand/react/shallow';
// Multi-value: const { powerLevel, transformation, attributes } = usePowerStore(useShallow(s => ({ powerLevel: s.powerLevel, transformation: s.transformation, attributes: s.attributes })));
// Single value: const powerLevel = usePowerStore(s => s.powerLevel);
