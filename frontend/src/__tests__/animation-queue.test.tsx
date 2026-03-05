import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

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

beforeEach(() => {
  useUiStore.setState({ animationQueue: [] });
});

describe('AnimationPlayer (ANIM-01)', () => {
  it('renders nothing when queue is empty', () => {
    const { container } = render(<AnimationPlayer />);
    expect(container.querySelector('[data-testid="animation-overlay"]')).toBeNull();
  });

  it('renders current animation event when queue has items', () => {
    useUiStore.getState().enqueueAnimation({ type: 'perfect_day' });
    render(<AnimationPlayer />);
    expect(screen.getByTestId('animation-overlay')).toBeInTheDocument();
    expect(screen.getByText('PERFECT DAY!')).toBeInTheDocument();
  });

  it('renders capsule_drop event with reward info', () => {
    useUiStore.getState().enqueueAnimation({
      type: 'capsule_drop',
      rewardTitle: 'Senzu Bean',
      rarity: 'rare',
    });
    render(<AnimationPlayer />);
    expect(screen.getByText('CAPSULE: Senzu Bean')).toBeInTheDocument();
  });

  it('renders transformation event with form name', () => {
    useUiStore.getState().enqueueAnimation({
      type: 'transformation',
      form: 'ssj',
      name: 'Super Saiyan',
    });
    render(<AnimationPlayer />);
    expect(screen.getByText('TRANSFORMATION: Super Saiyan')).toBeInTheDocument();
  });

  it('renders shenron event', () => {
    useUiStore.getState().enqueueAnimation({ type: 'shenron' });
    render(<AnimationPlayer />);
    expect(screen.getByText('SHENRON CEREMONY')).toBeInTheDocument();
  });

  it('renders dragon_ball event with count', () => {
    useUiStore.getState().enqueueAnimation({ type: 'dragon_ball', count: 3 });
    render(<AnimationPlayer />);
    expect(screen.getByText('DRAGON BALL #3')).toBeInTheDocument();
  });

  it('filters out xp_popup events (inline, not queued)', () => {
    useUiStore.getState().enqueueAnimation({
      type: 'xp_popup',
      amount: 10,
      attribute: 'str',
    });
    const { container } = render(<AnimationPlayer />);
    expect(container.querySelector('[data-testid="animation-overlay"]')).toBeNull();
  });

  it('filters out tier_change events (inline, not queued)', () => {
    useUiStore.getState().enqueueAnimation({
      type: 'tier_change',
      tier: 'kaioken_x3',
    });
    const { container } = render(<AnimationPlayer />);
    expect(container.querySelector('[data-testid="animation-overlay"]')).toBeNull();
  });

  it('shows queued event even when inline events exist in queue', () => {
    useUiStore.getState().enqueueAnimation({
      type: 'tier_change',
      tier: 'kaioken_x3',
    });
    useUiStore.getState().enqueueAnimation({ type: 'perfect_day' });
    render(<AnimationPlayer />);
    expect(screen.getByText('PERFECT DAY!')).toBeInTheDocument();
  });
});
