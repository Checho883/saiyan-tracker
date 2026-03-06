import { create } from 'zustand';

// -- Animation Event Types --

export type AnimationEvent =
  | { type: 'tier_change'; tier: string }
  | { type: 'perfect_day' }
  | { type: 'capsule_drop'; rewardTitle: string; rarity: string }
  | { type: 'dragon_ball'; count: number }
  | { type: 'transformation'; form: string; name: string }
  | { type: 'xp_popup'; amount: number; attribute: string }
  | { type: 'shenron' };

/**
 * Priority tiers for animation events.
 * Lower number = higher priority.
 * Tier 1 (Exclusive): Full overlays that play individually
 * Tier 2 (Banner): Overlays subject to combo batching
 * Tier 3 (Inline): Fire independently, bypass the overlay queue
 */
export const PRIORITY_TIERS: Record<AnimationEvent['type'], number> = {
  transformation: 1,  // Exclusive — full overlay, plays individually
  shenron: 1,         // Exclusive — full overlay, plays individually
  tier_change: 2,     // Banner — subject to combo batching
  perfect_day: 2,     // Banner — subject to combo batching
  capsule_drop: 2,    // Banner — subject to combo batching
  xp_popup: 3,        // Inline — fires independently, bypasses queue
  dragon_ball: 3,     // Inline — fires independently, bypasses queue
};

interface UiState {
  // Priority-sorted animation queue (overlay events only, tiers 1-2)
  animationQueue: AnimationEvent[];
  enqueueAnimation: (event: AnimationEvent) => void;
  dequeueAnimation: () => AnimationEvent | undefined;
  dequeueMultiple: (count: number) => AnimationEvent[];
  clearAnimations: () => void;

  // Inline events (tier 3 — fire independently, bypass queue)
  inlineEvents: AnimationEvent[];
  dequeueInline: () => AnimationEvent | undefined;

  // Modal state
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  animationQueue: [],

  enqueueAnimation: (event) => {
    const tier = PRIORITY_TIERS[event.type];

    // Tier 3 (inline): route to inlineEvents with deduplication
    if (tier === 3) {
      set((s) => {
        if (event.type === 'xp_popup') {
          const existing = s.inlineEvents.find(
            (e) => e.type === 'xp_popup' && e.attribute === event.attribute,
          );
          if (existing && existing.type === 'xp_popup') {
            // Deduplicate: sum amounts for same attribute
            return {
              inlineEvents: s.inlineEvents.map((e) =>
                e.type === 'xp_popup' && e.attribute === event.attribute
                  ? { ...e, amount: e.amount + event.amount }
                  : e,
              ),
            };
          }
        }
        return { inlineEvents: [...s.inlineEvents, event] };
      });
      return;
    }

    // Tier 1-2: insert into animationQueue sorted by priority (ascending tier = higher priority first)
    set((s) => {
      const newQueue = [...s.animationQueue];
      // Find insertion point: after all events with same or higher priority (lower/equal tier number)
      let insertIdx = newQueue.length;
      for (let i = 0; i < newQueue.length; i++) {
        if (PRIORITY_TIERS[newQueue[i].type] > tier) {
          insertIdx = i;
          break;
        }
      }
      newQueue.splice(insertIdx, 0, event);
      return { animationQueue: newQueue };
    });
  },

  dequeueAnimation: () => {
    const [first, ...rest] = get().animationQueue;
    set({ animationQueue: rest });
    return first;
  },

  dequeueMultiple: (count: number) => {
    const queue = get().animationQueue;
    const dequeued = queue.slice(0, count);
    set({ animationQueue: queue.slice(count) });
    return dequeued;
  },

  clearAnimations: () => set({ animationQueue: [], inlineEvents: [] }),

  inlineEvents: [],

  dequeueInline: () => {
    const [first, ...rest] = get().inlineEvents;
    set({ inlineEvents: rest });
    return first;
  },

  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));

// Usage: import { useShallow } from 'zustand/react/shallow';
// Multi-value: const { animationQueue, activeModal } = useUiStore(useShallow(s => ({ animationQueue: s.animationQueue, activeModal: s.activeModal })));
// Single value: const activeModal = useUiStore(s => s.activeModal);
