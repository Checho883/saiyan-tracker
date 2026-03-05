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

import { TierChangeBanner } from '../components/animations/TierChangeBanner';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('TierChangeBanner (ANIM-02)', () => {
  it('renders "Kaio-ken x3!" for kaioken_x3 tier', () => {
    render(<TierChangeBanner tier="kaioken_x3" />);
    expect(screen.getByTestId('tier-change-banner')).toHaveTextContent('Kaio-ken x3!');
  });

  it('renders "Kaio-ken x10!" for kaioken_x10 tier', () => {
    render(<TierChangeBanner tier="kaioken_x10" />);
    expect(screen.getByTestId('tier-change-banner')).toHaveTextContent('Kaio-ken x10!');
  });

  it('does not render for base tier', () => {
    render(<TierChangeBanner tier="base" />);
    expect(screen.queryByTestId('tier-change-banner')).toBeNull();
  });

  it('does not render for kaioken_x20 tier (100% triggers Perfect Day instead)', () => {
    render(<TierChangeBanner tier="kaioken_x20" />);
    expect(screen.queryByTestId('tier-change-banner')).toBeNull();
  });

  it('auto-dismisses after 1.5s', () => {
    const onDismiss = vi.fn();
    render(<TierChangeBanner tier="kaioken_x3" onDismiss={onDismiss} />);
    expect(screen.getByTestId('tier-change-banner')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('applies correct color class for kaioken_x3', () => {
    render(<TierChangeBanner tier="kaioken_x3" />);
    const banner = screen.getByTestId('tier-change-banner');
    expect(banner.className).toContain('text-saiyan-500');
  });

  it('applies correct color class for kaioken_x10', () => {
    render(<TierChangeBanner tier="kaioken_x10" />);
    const banner = screen.getByTestId('tier-change-banner');
    expect(banner.className).toContain('text-aura-500');
  });
});
