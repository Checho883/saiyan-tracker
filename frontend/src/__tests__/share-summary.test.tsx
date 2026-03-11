import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock stores
vi.mock('../store/habitStore', () => ({
  useHabitStore: Object.assign(
    () => ({}),
    {
      getState: () => ({
        todayHabits: [
          { id: '1', title: 'Pushups', completed: true, streak_current: 5, streak_best: 10 },
          { id: '2', title: 'Reading', completed: false, streak_current: 3, streak_best: 3 },
          { id: '3', title: 'Meditation', completed: true, streak_current: 12, streak_best: 12 },
        ],
      }),
    },
  ),
}));

vi.mock('../store/powerStore', () => ({
  usePowerStore: Object.assign(
    (selector: any) => selector({
      powerLevel: 4500,
      transformationName: 'Super Saiyan',
    }),
    {
      getState: () => ({
        powerLevel: 4500,
        transformationName: 'Super Saiyan',
      }),
    },
  ),
}));

vi.mock('../hooks/useAuraProgress', () => ({
  useAuraProgress: () => ({ percent: 45, tier: 'base' as const }),
}));

vi.mock('../store/rewardStore', () => ({
  useRewardStore: (selector: any) => selector({ settings: { display_name: 'Goku' } }),
}));

vi.mock('../store/uiStore', () => ({
  useUiStore: (selector: any) => selector({ animationQueue: [], dequeueAnimation: vi.fn() }),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ClipboardCopy: (props: any) => <svg data-testid="clipboard-icon" {...props} />,
}));

// Mock react-hot-toast
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};
vi.mock('react-hot-toast', () => ({
  default: mockToast,
}));

// Mock motion/react
vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition: _t, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
  useAnimation: () => ({ start: vi.fn() }),
}));

import { buildDailySummary } from '../utils/shareSummary';
import { ScouterHUD } from '../components/dashboard/ScouterHUD';

describe('buildDailySummary (22-02)', () => {
  test('returns string containing date and completion ratio', () => {
    const summary = buildDailySummary();
    expect(summary).toContain('Saiyan Training Report');
    expect(summary).toContain('2/3');
    expect(summary).toContain('67%');
  });

  test('includes power level and transformation name', () => {
    const summary = buildDailySummary();
    // toLocaleString output varies by environment (4,500 or 4.500)
    expect(summary).toMatch(/4[,.]?500/);
    expect(summary).toContain('Super Saiyan');
  });

  test('includes best streak when > 0', () => {
    const summary = buildDailySummary();
    expect(summary).toContain('Best Streak: 12 days');
  });

  test('includes Powered by Saiyan Tracker footer', () => {
    const summary = buildDailySummary();
    expect(summary).toContain('Powered by Saiyan Tracker');
  });
});

describe('ScouterHUD share button (22-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders share button when onShare provided', () => {
    render(
      <ScouterHUD
        powerLevel={4500}
        transformationName="Super Saiyan"
        nextTransformation="Super Saiyan 2"
        nextThreshold={10000}
        onShare={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Share daily summary')).toBeInTheDocument();
  });

  test('does not render share button when onShare not provided', () => {
    render(
      <ScouterHUD
        powerLevel={4500}
        transformationName="Super Saiyan"
        nextTransformation="Super Saiyan 2"
        nextThreshold={10000}
      />
    );
    expect(screen.queryByLabelText('Share daily summary')).not.toBeInTheDocument();
  });

  test('calls onShare when share button clicked', () => {
    const onShare = vi.fn();
    render(
      <ScouterHUD
        powerLevel={4500}
        transformationName="Super Saiyan"
        nextTransformation="Super Saiyan 2"
        nextThreshold={10000}
        onShare={onShare}
      />
    );
    fireEvent.click(screen.getByLabelText('Share daily summary'));
    expect(onShare).toHaveBeenCalledOnce();
  });
});

describe('Clipboard copy behavior (22-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('successful clipboard write shows success toast', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const summary = buildDailySummary();
    await navigator.clipboard.writeText(summary);
    mockToast.success('Scouter data copied!', { duration: 2000, position: 'top-center' });
    expect(mockToast.success).toHaveBeenCalledWith('Scouter data copied!', { duration: 2000, position: 'top-center' });
  });

  test('failed clipboard write shows error toast', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('denied')),
      },
    });

    try {
      await navigator.clipboard.writeText('test');
    } catch {
      mockToast.error('Copy failed — try again', { duration: 2000, position: 'top-center' });
    }
    expect(mockToast.error).toHaveBeenCalledWith('Copy failed — try again', { duration: 2000, position: 'top-center' });
  });
});
