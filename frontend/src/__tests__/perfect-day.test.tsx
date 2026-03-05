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
    MotionConfig: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
    useReducedMotion: () => false,
  };
});

import { PerfectDayOverlay } from '../components/animations/PerfectDayOverlay';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PerfectDayOverlay (ANIM-03)', () => {
  it('renders overlay container', () => {
    const onComplete = vi.fn();
    render(<PerfectDayOverlay onComplete={onComplete} />);
    expect(screen.getByTestId('perfect-day-overlay')).toBeInTheDocument();
  });

  it('shows "100% COMPLETE" text after 700ms', () => {
    const onComplete = vi.fn();
    render(<PerfectDayOverlay onComplete={onComplete} />);

    expect(screen.queryByTestId('perfect-day-title')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByTestId('perfect-day-title')).toHaveTextContent('100% COMPLETE');
  });

  it('shows particle burst container after 500ms', () => {
    const onComplete = vi.fn();
    render(<PerfectDayOverlay onComplete={onComplete} />);

    expect(screen.queryByTestId('particle-burst')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTestId('particle-burst')).toBeInTheDocument();
  });

  it('calls onComplete after 2500ms', () => {
    const onComplete = vi.fn();
    render(<PerfectDayOverlay onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows character quote after 1800ms', () => {
    const onComplete = vi.fn();
    render(<PerfectDayOverlay onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(1800);
    });

    expect(screen.getByTestId('perfect-day-quote')).toBeInTheDocument();
  });
});
