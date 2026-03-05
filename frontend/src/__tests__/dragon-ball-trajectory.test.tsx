import { describe, it, expect, vi } from 'vitest';
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
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
    useReducedMotion: () => false,
  };
});

import { DragonBallTrajectory } from '../components/animations/DragonBallTrajectory';

describe('DragonBallTrajectory (ANIM-06)', () => {
  it('renders trajectory container', () => {
    const onComplete = vi.fn();
    render(<DragonBallTrajectory count={3} onComplete={onComplete} />);
    expect(screen.getByTestId('dragon-ball-trajectory')).toBeInTheDocument();
  });

  it('renders golden ball with star number', () => {
    const onComplete = vi.fn();
    render(<DragonBallTrajectory count={5} onComplete={onComplete} />);
    expect(screen.getByTestId('dragon-ball')).toHaveTextContent('5★');
  });

  it('renders ball with different count', () => {
    const onComplete = vi.fn();
    render(<DragonBallTrajectory count={7} onComplete={onComplete} />);
    expect(screen.getByTestId('dragon-ball')).toHaveTextContent('7★');
  });
});
