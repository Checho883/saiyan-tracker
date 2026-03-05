import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
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
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
    useReducedMotion: () => false,
  };
});

import { ShenronCeremony } from '../components/animations/ShenronCeremony';
import { useRewardStore } from '../store/rewardStore';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ShenronCeremony (ANIM-08, ANIM-09)', () => {
  it('shows warning when no active wishes exist (ANIM-09)', () => {
    useRewardStore.setState({ wishes: [] });
    const onComplete = vi.fn();
    render(<ShenronCeremony onComplete={onComplete} />);

    expect(screen.getByTestId('shenron-no-wishes')).toBeInTheDocument();
    expect(screen.getByText('No Active Wishes!')).toBeInTheDocument();
  });

  it('shows warning when all wishes are inactive (ANIM-09)', () => {
    useRewardStore.setState({
      wishes: [
        { id: '1', title: 'New Gi', is_active: false, times_wished: 0 } as any,
      ],
    });
    const onComplete = vi.fn();
    render(<ShenronCeremony onComplete={onComplete} />);

    expect(screen.getByTestId('shenron-no-wishes')).toBeInTheDocument();
  });

  it('dismiss button calls onComplete when no wishes', () => {
    useRewardStore.setState({ wishes: [] });
    const onComplete = vi.fn();
    render(<ShenronCeremony onComplete={onComplete} />);

    screen.getByTestId('shenron-dismiss').click();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders ceremony when active wishes exist', () => {
    useRewardStore.setState({
      wishes: [
        { id: '1', title: 'New Gi', is_active: true, times_wished: 0 } as any,
      ],
    });
    const onComplete = vi.fn();
    render(<ShenronCeremony onComplete={onComplete} />);

    expect(screen.getByTestId('shenron-ceremony')).toBeInTheDocument();
  });

  it('shows "Your wish has been granted!" text during ceremony', () => {
    useRewardStore.setState({
      wishes: [
        { id: '1', title: 'New Gi', is_active: true, times_wished: 0 } as any,
      ],
    });
    const onComplete = vi.fn();
    render(<ShenronCeremony onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByTestId('shenron-wish-text')).toHaveTextContent(
      'Your wish has been granted!'
    );
  });

  it('shows Shenron dragon after 1000ms', () => {
    useRewardStore.setState({
      wishes: [
        { id: '1', title: 'New Gi', is_active: true, times_wished: 0 } as any,
      ],
    });
    const onComplete = vi.fn();
    render(<ShenronCeremony onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('shenron-dragon')).toBeInTheDocument();
  });

  it('calls onComplete after 4500ms', () => {
    useRewardStore.setState({
      wishes: [
        { id: '1', title: 'New Gi', is_active: true, times_wished: 0 } as any,
      ],
    });
    const onComplete = vi.fn();
    render(<ShenronCeremony onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(4500);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
