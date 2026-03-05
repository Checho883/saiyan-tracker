import { create } from 'zustand';

// -- Animation Event Types (skeleton for Phase 7) --

export type AnimationEvent =
  | { type: 'tier_change'; tier: string }
  | { type: 'perfect_day' }
  | { type: 'capsule_drop'; rewardTitle: string; rarity: string }
  | { type: 'dragon_ball'; count: number }
  | { type: 'transformation'; form: string; name: string }
  | { type: 'xp_popup'; amount: number; attribute: string }
  | { type: 'shenron' };

interface UiState {
  // Animation queue (skeleton for Phase 7)
  animationQueue: AnimationEvent[];
  enqueueAnimation: (event: AnimationEvent) => void;
  dequeueAnimation: () => AnimationEvent | undefined;
  clearAnimations: () => void;

  // Modal state
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  animationQueue: [],
  enqueueAnimation: (event) =>
    set((s) => ({ animationQueue: [...s.animationQueue, event] })),
  dequeueAnimation: () => {
    const [first, ...rest] = get().animationQueue;
    set({ animationQueue: rest });
    return first;
  },
  clearAnimations: () => set({ animationQueue: [] }),

  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));

// Usage: import { useShallow } from 'zustand/react/shallow';
// Multi-value: const { animationQueue, activeModal } = useUiStore(useShallow(s => ({ animationQueue: s.animationQueue, activeModal: s.activeModal })));
// Single value: const activeModal = useUiStore(s => s.activeModal);
