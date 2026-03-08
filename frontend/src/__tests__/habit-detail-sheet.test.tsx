import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock motion/react
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
  };
});

// Mock API — data inlined in factory to avoid hoisting issues
vi.mock('../services/api', () => ({
  habitsApi: {
    contributionGraph: vi.fn().mockResolvedValue([]),
    stats: vi.fn().mockResolvedValue({
      total_completions: 42,
      current_streak: 5,
      best_streak: 12,
      completion_rate_7d: 0.8571,
      completion_rate_30d: 0.7333,
      total_xp_earned: 1240,
      attribute_xp: { STR: 1240 },
    }),
    calendar: vi.fn().mockResolvedValue([
      { date: '2026-03-01', completed: true, attribute_xp_awarded: 30 },
      { date: '2026-03-02', completed: false, attribute_xp_awarded: 0 },
      { date: '2026-03-03', completed: true, attribute_xp_awarded: 30 },
    ]),
  },
}));

import { HabitDetailSheet } from '../components/dashboard/HabitDetailSheet';
import { habitsApi } from '../services/api';
import type { HabitTodayResponse } from '../types';

const mockHabit: HabitTodayResponse = {
  id: 'test-habit-id',
  title: 'Morning Pushups',
  description: null,
  icon_emoji: '💪',
  importance: 'important',
  attribute: 'str',
  frequency: 'daily',
  custom_days: null,
  target_time: '07:00',
  is_temporary: false,
  start_date: '2026-01-15',
  end_date: null,
  sort_order: 0,
  is_active: true,
  category_id: 'cat-1',
  created_at: '2026-01-15T10:00:00Z',
  completed: true,
  streak_current: 5,
  streak_best: 12,
};

const mockedHabitsApi = vi.mocked(habitsApi);

beforeEach(() => {
  vi.clearAllMocks();
  // Restore mock resolved values since clearAllMocks removes them
  mockedHabitsApi.contributionGraph.mockResolvedValue([]);
  (mockedHabitsApi as any).stats.mockResolvedValue({
    total_completions: 42,
    current_streak: 5,
    best_streak: 12,
    completion_rate_7d: 0.8571,
    completion_rate_30d: 0.7333,
    total_xp_earned: 1240,
    attribute_xp: { STR: 1240 },
  });
  (mockedHabitsApi as any).calendar.mockResolvedValue([
    { date: '2026-03-01', completed: true, attribute_xp_awarded: 30 },
    { date: '2026-03-02', completed: false, attribute_xp_awarded: 0 },
    { date: '2026-03-03', completed: true, attribute_xp_awarded: 30 },
  ]);
});

describe('completion rates', () => {
  it('renders 7-day completion rate as percentage', async () => {
    render(<HabitDetailSheet habit={mockHabit} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('86%')).toBeInTheDocument();
    });
  });

  it('renders 30-day completion rate as percentage', async () => {
    render(<HabitDetailSheet habit={mockHabit} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('73%')).toBeInTheDocument();
    });
  });
});

describe('attribute XP', () => {
  it('displays total XP earned with attribute label', async () => {
    render(<HabitDetailSheet habit={mockHabit} onClose={vi.fn()} />);
    await waitFor(() => {
      // toLocaleString formatting varies by locale in jsdom (may use comma, dot, or nothing)
      expect(screen.getByText(/1[,.]?240/)).toBeInTheDocument();
      expect(screen.getByText('STR XP')).toBeInTheDocument();
    });
  });
});

describe('metadata', () => {
  it('shows target time', async () => {
    render(<HabitDetailSheet habit={mockHabit} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('07:00')).toBeInTheDocument();
    });
  });

  it('shows creation date', async () => {
    render(<HabitDetailSheet habit={mockHabit} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/Jan 15, 2026/)).toBeInTheDocument();
    });
  });

  it('shows importance level', async () => {
    render(<HabitDetailSheet habit={mockHabit} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Important')).toBeInTheDocument();
    });
  });

  it('shows attribute badge', async () => {
    render(<HabitDetailSheet habit={mockHabit} onClose={vi.fn()} />);
    expect(screen.getByText('STR')).toBeInTheDocument();
  });
});

describe('history tabs', () => {
  it('defaults to Grid tab', async () => {
    render(<HabitDetailSheet habit={mockHabit} onClose={vi.fn()} />);
    const gridButton = screen.getByRole('button', { name: /grid/i });
    expect(gridButton).toBeInTheDocument();
    expect(screen.getByText('Last 90 Days')).toBeInTheDocument();
  });

  it('can switch to Calendar tab', async () => {
    render(<HabitDetailSheet habit={mockHabit} onClose={vi.fn()} />);
    const calButton = screen.getByRole('button', { name: /calendar/i });
    fireEvent.click(calButton);
    await waitFor(() => {
      // Calendar should show current month/year header
      const now = new Date();
      const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      expect(screen.getByText(monthName)).toBeInTheDocument();
    });
  });
});
