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

import { TransformationOverlay } from '../components/animations/TransformationOverlay';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('TransformationOverlay (ANIM-07)', () => {
  it('renders overlay with form data attribute for SSJ', () => {
    const onComplete = vi.fn();
    render(<TransformationOverlay form="ssj" name="Super Saiyan" onComplete={onComplete} />);
    expect(screen.getByTestId('transformation-overlay')).toHaveAttribute('data-form', 'ssj');
  });

  it('renders overlay with form data attribute for SSB', () => {
    const onComplete = vi.fn();
    render(<TransformationOverlay form="ssb" name="Super Saiyan Blue" onComplete={onComplete} />);
    expect(screen.getByTestId('transformation-overlay')).toHaveAttribute('data-form', 'ssb');
  });

  it('shows transformation name text after 800ms', () => {
    const onComplete = vi.fn();
    render(<TransformationOverlay form="ssj" name="Super Saiyan" onComplete={onComplete} />);

    expect(screen.queryByTestId('transformation-name')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByTestId('transformation-name')).toHaveTextContent('SUPER SAIYAN!');
  });

  it('shows correct label for UI form', () => {
    const onComplete = vi.fn();
    render(<TransformationOverlay form="ui" name="Ultra Instinct" onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByTestId('transformation-name')).toHaveTextContent('ULTRA INSTINCT!');
  });

  it('renders SaiyanAvatar with correct form after 500ms', () => {
    const onComplete = vi.fn();
    render(<TransformationOverlay form="ssj" name="Super Saiyan" onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // SaiyanAvatar renders an img with alt containing the form name
    const avatar = screen.getByRole('img', { name: /saiyan ssj/i });
    expect(avatar).toBeInTheDocument();
  });

  it('calls onComplete after 2000ms', () => {
    const onComplete = vi.fn();
    render(<TransformationOverlay form="ssj" name="Super Saiyan" onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
