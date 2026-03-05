import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

const mockPlay = vi.fn();
vi.mock('../audio/useAudio', () => ({
  useAudio: () => ({ play: mockPlay, toggleMute: vi.fn(), isMuted: false }),
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

import { CapsuleDropOverlay } from '../components/animations/CapsuleDropOverlay';

beforeEach(() => {
  vi.useFakeTimers();
  mockPlay.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CapsuleDropOverlay (ANIM-04, ANIM-05)', () => {
  it('renders capsule with pulsing front face', () => {
    const onComplete = vi.fn();
    render(
      <CapsuleDropOverlay rewardTitle="Senzu Bean" rarity="rare" onComplete={onComplete} />
    );
    expect(screen.getByTestId('capsule-front')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('shows reward title after click (flip)', () => {
    const onComplete = vi.fn();
    render(
      <CapsuleDropOverlay rewardTitle="Senzu Bean" rarity="rare" onComplete={onComplete} />
    );

    fireEvent.click(screen.getByTestId('capsule-drop-overlay'));

    expect(screen.getByText('Senzu Bean')).toBeInTheDocument();
    expect(screen.getByText('rare')).toBeInTheDocument();
  });

  it('applies correct rarity data attribute for common', () => {
    const onComplete = vi.fn();
    render(
      <CapsuleDropOverlay rewardTitle="Rock" rarity="common" onComplete={onComplete} />
    );
    expect(screen.getByTestId('capsule-back')).toHaveAttribute('data-rarity', 'common');
  });

  it('applies correct rarity data attribute for epic', () => {
    const onComplete = vi.fn();
    render(
      <CapsuleDropOverlay rewardTitle="Dragon Radar" rarity="epic" onComplete={onComplete} />
    );
    expect(screen.getByTestId('capsule-back')).toHaveAttribute('data-rarity', 'epic');
  });

  it('auto-dismisses 4s after reveal', () => {
    const onComplete = vi.fn();
    render(
      <CapsuleDropOverlay rewardTitle="Senzu Bean" rarity="rare" onComplete={onComplete} />
    );

    fireEvent.click(screen.getByTestId('capsule-drop-overlay')); // reveal

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('plays reveal_chime when capsule is tapped', () => {
    const onComplete = vi.fn();
    render(
      <CapsuleDropOverlay rewardTitle="Senzu Bean" rarity="rare" onComplete={onComplete} />
    );

    fireEvent.click(screen.getByTestId('capsule-drop-overlay'));

    expect(mockPlay).toHaveBeenCalledWith('reveal_chime');
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it('does not play reveal_chime on second tap', () => {
    const onComplete = vi.fn();
    render(
      <CapsuleDropOverlay rewardTitle="Senzu Bean" rarity="rare" onComplete={onComplete} />
    );

    // First tap: reveal
    fireEvent.click(screen.getByTestId('capsule-drop-overlay'));
    expect(mockPlay).toHaveBeenCalledTimes(1);

    // Advance past canDismiss threshold (1500ms)
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Second tap: dismiss (should NOT play sound again)
    fireEvent.click(screen.getByTestId('capsule-drop-overlay'));
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });
});
