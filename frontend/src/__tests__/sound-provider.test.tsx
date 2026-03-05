import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SoundProvider } from '../audio/SoundProvider';
import { useAudio } from '../audio/useAudio';
import { Howler } from 'howler';

// Track the last created Howl instance for assertions
let lastHowlInstance: { play: ReturnType<typeof vi.fn>; rate: ReturnType<typeof vi.fn> } | null = null;

vi.mock('howler', async () => {
  class MockHowl {
    play = vi.fn().mockReturnValue(1);
    rate = vi.fn();
    unload = vi.fn();
    on = vi.fn();
    off = vi.fn();
    constructor(_opts?: Record<string, unknown>) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      lastHowlInstance = this;
    }
  }
  return {
    Howl: MockHowl,
    Howler: {
      mute: vi.fn(),
      volume: vi.fn(),
      ctx: { state: 'running' },
    },
  };
});

// Test component that uses the hook
function TestConsumer() {
  const { play, toggleMute, isMuted } = useAudio();
  return (
    <div>
      <span data-testid="muted">{String(isMuted)}</span>
      <button onClick={() => play('scouter_beep')}>Play</button>
      <button onClick={toggleMute}>Toggle</button>
    </div>
  );
}

describe('SoundProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastHowlInstance = null;
  });

  it('provides isMuted=true by default (sound OFF)', () => {
    render(
      <SoundProvider>
        <TestConsumer />
      </SoundProvider>,
    );
    expect(screen.getByTestId('muted').textContent).toBe('true');
  });

  it('toggleMute flips isMuted and calls Howler.mute', async () => {
    const user = userEvent.setup();
    render(
      <SoundProvider>
        <TestConsumer />
      </SoundProvider>,
    );
    await user.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('muted').textContent).toBe('false');
    expect(Howler.mute).toHaveBeenCalledWith(false);
  });

  it('play does nothing when muted', async () => {
    const user = userEvent.setup();
    render(
      <SoundProvider>
        <TestConsumer />
      </SoundProvider>,
    );
    await user.click(screen.getByText('Play'));
    // Howl should not be instantiated when muted
    expect(lastHowlInstance).toBeNull();
  });

  it('play creates Howl and plays sound when unmuted', async () => {
    const user = userEvent.setup();
    render(
      <SoundProvider>
        <TestConsumer />
      </SoundProvider>,
    );
    // Unmute first
    await user.click(screen.getByText('Toggle'));
    // Now play
    await user.click(screen.getByText('Play'));
    expect(lastHowlInstance).not.toBeNull();
    expect(lastHowlInstance!.play).toHaveBeenCalledWith('scouter_beep');
  });

  it('play applies playbackRate variation between 0.9 and 1.1 (AUDIO-09)', async () => {
    const user = userEvent.setup();
    // Seed Math.random for predictable test
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    render(
      <SoundProvider>
        <TestConsumer />
      </SoundProvider>,
    );
    await user.click(screen.getByText('Toggle')); // unmute
    await user.click(screen.getByText('Play'));
    expect(lastHowlInstance).not.toBeNull();
    // 0.9 + 0.5 * 0.2 = 1.0
    expect(lastHowlInstance!.rate).toHaveBeenCalledWith(1.0, 1);
    randomSpy.mockRestore();
  });

  it('useAudio throws when used outside SoundProvider', () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useAudio must be used within a SoundProvider',
    );
    spy.mockRestore();
  });
});
