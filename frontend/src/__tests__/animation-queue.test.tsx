import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('../audio/useAudio', () => ({
  useAudio: () => ({ play: vi.fn(), toggleMute: vi.fn(), isMuted: false }),
}));

vi.mock('motion/react', () => {
  const motion = new Proxy({} as Record<string, React.FC<any>>, {
    get: (_target, prop: string) =>
      React.forwardRef(({ children, ...props }: any, ref: any) => {
        const {
          initial: _i, animate: _a, exit: _e, transition: _t,
          variants: _v, whileHover: _wh, whileTap: _wt,
          onAnimationComplete: _oac, layout: _l, layoutId: _li,
          ...htmlProps
        } = props;
        return React.createElement(prop, { ...htmlProps, ref }, children);
      }),
  });

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    MotionConfig: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
    useReducedMotion: () => false,
  };
});

import { AnimationPlayer } from '../components/animations/AnimationPlayer';
import { useUiStore } from '../store/uiStore';
import { PRIORITY_TIERS } from '../store/uiStore';
import { useRewardStore } from '../store/rewardStore';

beforeEach(() => {
  vi.useFakeTimers();
  useUiStore.setState({ animationQueue: [], inlineEvents: [] });
  // Default: active wish so Shenron doesn't show warning
  useRewardStore.setState({
    wishes: [{ id: '1', title: 'Wish', is_active: true, times_wished: 0 } as any],
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Priority Queue (uiStore)', () => {
  it('inserts events sorted by priority tier (tier 1 before tier 2)', () => {
    const store = useUiStore.getState();
    store.enqueueAnimation({ type: 'perfect_day' }); // tier 2
    store.enqueueAnimation({ type: 'transformation', form: 'ssj', name: 'Super Saiyan' }); // tier 1

    const queue = useUiStore.getState().animationQueue;
    expect(queue[0].type).toBe('transformation');
    expect(queue[1].type).toBe('perfect_day');
  });

  it('preserves FIFO within same tier', () => {
    const store = useUiStore.getState();
    store.enqueueAnimation({ type: 'perfect_day' }); // tier 2
    store.enqueueAnimation({ type: 'capsule_drop', rewardTitle: 'Senzu', rarity: 'rare' }); // tier 2
    store.enqueueAnimation({ type: 'tier_change', tier: 'kaioken_x3' }); // tier 2

    const queue = useUiStore.getState().animationQueue;
    expect(queue[0].type).toBe('perfect_day');
    expect(queue[1].type).toBe('capsule_drop');
    expect(queue[2].type).toBe('tier_change');
  });

  it('routes xp_popup to inlineEvents (not animationQueue)', () => {
    const store = useUiStore.getState();
    store.enqueueAnimation({ type: 'xp_popup', amount: 10, attribute: 'str' });

    expect(useUiStore.getState().animationQueue).toHaveLength(0);
    expect(useUiStore.getState().inlineEvents).toHaveLength(1);
    expect(useUiStore.getState().inlineEvents[0].type).toBe('xp_popup');
  });

  it('routes dragon_ball to inlineEvents (not animationQueue)', () => {
    const store = useUiStore.getState();
    store.enqueueAnimation({ type: 'dragon_ball', count: 3 });

    expect(useUiStore.getState().animationQueue).toHaveLength(0);
    expect(useUiStore.getState().inlineEvents).toHaveLength(1);
    expect(useUiStore.getState().inlineEvents[0].type).toBe('dragon_ball');
  });

  it('deduplicates xp_popup events with same attribute by summing amounts', () => {
    const store = useUiStore.getState();
    store.enqueueAnimation({ type: 'xp_popup', amount: 10, attribute: 'str' });
    store.enqueueAnimation({ type: 'xp_popup', amount: 5, attribute: 'str' });

    const inlines = useUiStore.getState().inlineEvents;
    expect(inlines).toHaveLength(1);
    expect(inlines[0].type).toBe('xp_popup');
    if (inlines[0].type === 'xp_popup') {
      expect(inlines[0].amount).toBe(15);
    }
  });

  it('does not deduplicate xp_popup events with different attributes', () => {
    const store = useUiStore.getState();
    store.enqueueAnimation({ type: 'xp_popup', amount: 10, attribute: 'str' });
    store.enqueueAnimation({ type: 'xp_popup', amount: 5, attribute: 'int' });

    expect(useUiStore.getState().inlineEvents).toHaveLength(2);
  });

  it('dequeueAnimation returns highest-priority event first', () => {
    const store = useUiStore.getState();
    store.enqueueAnimation({ type: 'perfect_day' }); // tier 2
    store.enqueueAnimation({ type: 'shenron' }); // tier 1

    const first = useUiStore.getState().dequeueAnimation();
    expect(first?.type).toBe('shenron');
  });

  it('dequeueMultiple removes N events from front', () => {
    const store = useUiStore.getState();
    store.enqueueAnimation({ type: 'transformation', form: 'ssj', name: 'SSJ' });
    store.enqueueAnimation({ type: 'perfect_day' });
    store.enqueueAnimation({ type: 'capsule_drop', rewardTitle: 'Bean', rarity: 'rare' });

    const removed = useUiStore.getState().dequeueMultiple(2);
    expect(removed).toHaveLength(2);
    expect(removed[0].type).toBe('transformation');
    expect(removed[1].type).toBe('perfect_day');
    expect(useUiStore.getState().animationQueue).toHaveLength(1);
  });

  it('clearAnimations clears both queues', () => {
    const store = useUiStore.getState();
    store.enqueueAnimation({ type: 'perfect_day' });
    store.enqueueAnimation({ type: 'xp_popup', amount: 10, attribute: 'str' });

    useUiStore.getState().clearAnimations();
    expect(useUiStore.getState().animationQueue).toHaveLength(0);
    expect(useUiStore.getState().inlineEvents).toHaveLength(0);
  });

  it('has correct tier assignments per CONTEXT.md', () => {
    expect(PRIORITY_TIERS.transformation).toBe(1);
    expect(PRIORITY_TIERS.shenron).toBe(1);
    expect(PRIORITY_TIERS.tier_change).toBe(2);
    expect(PRIORITY_TIERS.perfect_day).toBe(2);
    expect(PRIORITY_TIERS.capsule_drop).toBe(2);
    expect(PRIORITY_TIERS.xp_popup).toBe(3);
    expect(PRIORITY_TIERS.dragon_ball).toBe(3);
  });
});

describe('AnimationPlayer (ANIM-01)', () => {
  it('renders nothing when queue is empty', () => {
    const { container } = render(<AnimationPlayer />);
    expect(container.querySelector('[data-testid="animation-overlay"]')).toBeNull();
  });

  it('renders animation overlay when queue has perfect_day event', () => {
    useUiStore.getState().enqueueAnimation({ type: 'perfect_day' });
    render(<AnimationPlayer />);
    const overlay = screen.getByTestId('animation-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute('data-event-type', 'perfect_day');
  });

  it('renders perfect_day overlay component', () => {
    useUiStore.getState().enqueueAnimation({ type: 'perfect_day' });
    render(<AnimationPlayer />);
    expect(screen.getByTestId('perfect-day-overlay')).toBeInTheDocument();
  });

  it('renders capsule_drop overlay component', () => {
    useUiStore.getState().enqueueAnimation({
      type: 'capsule_drop',
      rewardTitle: 'Senzu Bean',
      rarity: 'rare',
    });
    render(<AnimationPlayer />);
    expect(screen.getByTestId('capsule-drop-overlay')).toBeInTheDocument();
  });

  it('renders transformation overlay component', () => {
    useUiStore.getState().enqueueAnimation({
      type: 'transformation',
      form: 'ssj',
      name: 'Super Saiyan',
    });
    render(<AnimationPlayer />);
    expect(screen.getByTestId('transformation-overlay')).toBeInTheDocument();
  });

  it('renders shenron ceremony component', () => {
    useUiStore.getState().enqueueAnimation({ type: 'shenron' });
    render(<AnimationPlayer />);
    expect(screen.getByTestId('shenron-ceremony')).toBeInTheDocument();
  });

  it('xp_popup events do not appear in overlay queue', () => {
    useUiStore.getState().enqueueAnimation({
      type: 'xp_popup',
      amount: 10,
      attribute: 'str',
    });
    const { container } = render(<AnimationPlayer />);
    expect(container.querySelector('[data-testid="animation-overlay"]')).toBeNull();
  });

  it('dragon_ball events do not appear in overlay queue', () => {
    useUiStore.getState().enqueueAnimation({ type: 'dragon_ball', count: 3 });
    const { container } = render(<AnimationPlayer />);
    expect(container.querySelector('[data-testid="animation-overlay"]')).toBeNull();
  });

  it('renders Tier 1 event first when both Tier 1 and Tier 2 are queued', () => {
    useUiStore.getState().enqueueAnimation({ type: 'perfect_day' }); // tier 2
    useUiStore.getState().enqueueAnimation({
      type: 'transformation',
      form: 'ssj',
      name: 'Super Saiyan',
    }); // tier 1
    render(<AnimationPlayer />);
    // transformation should render first (tier 1)
    expect(screen.getByTestId('transformation-overlay')).toBeInTheDocument();
  });

  it('renders tier_change as overlay (tier 2 banner, not inline)', () => {
    useUiStore.getState().enqueueAnimation({
      type: 'tier_change',
      tier: 'kaioken_x3',
    });
    render(<AnimationPlayer />);
    const overlay = screen.getByTestId('animation-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute('data-event-type', 'tier_change');
  });

  it('renders combo summary when 3+ banner events are queued', () => {
    useUiStore.getState().enqueueAnimation({ type: 'perfect_day' });
    useUiStore.getState().enqueueAnimation({
      type: 'capsule_drop',
      rewardTitle: 'Senzu',
      rarity: 'rare',
    });
    useUiStore.getState().enqueueAnimation({
      type: 'tier_change',
      tier: 'kaioken_x3',
    });
    render(<AnimationPlayer />);
    // First banner event plays individually
    expect(screen.getByTestId('animation-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('animation-overlay')).toHaveAttribute('data-event-type', 'perfect_day');
  });
});
