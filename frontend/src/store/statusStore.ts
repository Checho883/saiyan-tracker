import { create } from 'zustand';
import type { StatusResponse } from '../types';
import { statusApi } from '../services/api';

interface StatusState {
  status: StatusResponse | null;
  isLoaded: boolean;
  fetchStatus: (date: string) => Promise<void>;
  clearStatus: () => void;
}

export const useStatusStore = create<StatusState>((set) => ({
  status: null,
  isLoaded: false,

  fetchStatus: async (date) => {
    try {
      const status = await statusApi.get(date);
      set({ status, isLoaded: true });
    } catch {
      // Status fetch is non-critical — don't block app init
      set({ status: null, isLoaded: true });
    }
  },

  clearStatus: () => set({ status: null, isLoaded: false }),
}));

// Usage: import { useShallow } from 'zustand/react/shallow';
// Single value: const status = useStatusStore(s => s.status);
