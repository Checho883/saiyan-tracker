import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: new Proxy({}, {
    get: (_target, prop) => {
      if (typeof prop === 'string') {
        return ({ children, ...props }: Record<string, unknown>) => {
          const Tag = prop as keyof JSX.IntrinsicElements;
          return <Tag {...(props as Record<string, unknown>)}>{children as React.ReactNode}</Tag>;
        };
      }
      return undefined;
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MotionConfig: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
  useReducedMotion: () => false,
}));

// Mock stores
const mockSettings = {
  display_name: 'Goku',
  sound_enabled: true,
  theme: 'dark' as const,
};

const mockUpdateSettings = vi.fn();

vi.mock('../../store/rewardStore', () => ({
  useRewardStore: (selector: (s: Record<string, unknown>) => unknown) => selector({
    settings: mockSettings,
    updateSettings: mockUpdateSettings,
    fetchSettings: vi.fn(),
    rewards: [],
    wishes: [],
    categories: [],
    fetchRewards: vi.fn(),
    fetchWishes: vi.fn(),
    fetchCategories: vi.fn(),
  }),
}));

// Mock offDaysApi
vi.mock('../../services/api', () => ({
  offDaysApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ off_date: '2026-03-05', habits_reversed: 0, xp_clawed_back: 0 }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock useTheme
vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    isDark: true,
    toggleTheme: vi.fn(),
  }),
}));

import { OffDaySelector } from '../components/settings/OffDaySelector';
import { DeleteConfirmDialog } from '../components/common/DeleteConfirmDialog';

describe('Settings Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('off-day selector shows 5 reason options', () => {
    render(<OffDaySelector onSelect={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText('Sick')).toBeInTheDocument();
    expect(screen.getByLabelText('Vacation')).toBeInTheDocument();
    expect(screen.getByLabelText('Rest Day')).toBeInTheDocument();
    expect(screen.getByLabelText('Injury')).toBeInTheDocument();
    expect(screen.getByLabelText('Other')).toBeInTheDocument();
  });

  test('off-day selector confirm disabled until reason selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<OffDaySelector onSelect={onSelect} onCancel={vi.fn()} />);

    const confirmBtn = screen.getByText('Confirm Off Day');
    expect(confirmBtn).toBeDisabled();

    await user.click(screen.getByLabelText('Sick'));
    expect(confirmBtn).not.toBeDisabled();

    await user.click(confirmBtn);
    expect(onSelect).toHaveBeenCalledWith('sick');
  });

  test('DeleteConfirmDialog renders with item title', () => {
    render(
      <DeleteConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        itemTitle="Test Item"
      />
    );
    expect(screen.getByText(/Delete.*Test Item/)).toBeInTheDocument();
    expect(screen.getByText('Delete Permanently')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('DeleteConfirmDialog hidden when not open', () => {
    const { container } = render(
      <DeleteConfirmDialog
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        itemTitle="Hidden"
      />
    );
    expect(container.innerHTML).toBe('');
  });
});
