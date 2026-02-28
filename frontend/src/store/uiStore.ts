import { create } from 'zustand';
import type { Quote } from '@/types';

interface UIState {
  activeQuote: Quote | null;
  showTaskForm: boolean;
  showOffDayForm: boolean;
  showTransformationAnimation: boolean;
  pointsPopup: { points: number; x: number; y: number } | null;

  setActiveQuote: (q: Quote | null) => void;
  setShowTaskForm: (v: boolean) => void;
  setShowOffDayForm: (v: boolean) => void;
  setShowTransformationAnimation: (v: boolean) => void;
  triggerPointsPopup: (points: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeQuote: null,
  showTaskForm: false,
  showOffDayForm: false,
  showTransformationAnimation: false,
  pointsPopup: null,

  setActiveQuote: (q) => set({ activeQuote: q }),
  setShowTaskForm: (v) => set({ showTaskForm: v }),
  setShowOffDayForm: (v) => set({ showOffDayForm: v }),
  setShowTransformationAnimation: (v) => set({ showTransformationAnimation: v }),
  triggerPointsPopup: (points) => {
    set({ pointsPopup: { points, x: window.innerWidth / 2, y: window.innerHeight / 2 } });
    setTimeout(() => set({ pointsPopup: null }), 2000);
  },
}));
