import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock habitStore
const mockHabits = [
  { id: '1', title: 'Meditation', icon_emoji: '🧘', streak_current: 15, streak_best: 20, is_active: true, completed: true, description: null, importance: 'normal' as const, attribute: 'ki' as const, frequency: 'daily' as const, custom_days: null, target_time: null, is_temporary: false, start_date: '2026-01-01', end_date: null, sort_order: 0, category_id: null, created_at: '2026-01-01T00:00:00Z' },
  { id: '2', title: 'Running', icon_emoji: '🏃', streak_current: 7, streak_best: 10, is_active: true, completed: false, description: null, importance: 'normal' as const, attribute: 'vit' as const, frequency: 'daily' as const, custom_days: null, target_time: null, is_temporary: false, start_date: '2026-01-01', end_date: null, sort_order: 1, category_id: null, created_at: '2026-01-01T00:00:00Z' },
  { id: '3', title: 'Reading', icon_emoji: '📚', streak_current: 22, streak_best: 30, is_active: true, completed: true, description: null, importance: 'normal' as const, attribute: 'int' as const, frequency: 'daily' as const, custom_days: null, target_time: null, is_temporary: false, start_date: '2026-01-01', end_date: null, sort_order: 2, category_id: null, created_at: '2026-01-01T00:00:00Z' },
  { id: '4', title: 'Weights', icon_emoji: '💪', streak_current: 0, streak_best: 5, is_active: true, completed: false, description: null, importance: 'normal' as const, attribute: 'str' as const, frequency: 'daily' as const, custom_days: null, target_time: null, is_temporary: false, start_date: '2026-01-01', end_date: null, sort_order: 3, category_id: null, created_at: '2026-01-01T00:00:00Z' },
  { id: '5', title: 'Stretching', icon_emoji: '🤸', streak_current: 3, streak_best: 8, is_active: true, completed: true, description: null, importance: 'normal' as const, attribute: 'vit' as const, frequency: 'daily' as const, custom_days: null, target_time: null, is_temporary: false, start_date: '2026-01-01', end_date: null, sort_order: 4, category_id: null, created_at: '2026-01-01T00:00:00Z' },
];

vi.mock('../store/habitStore', () => ({
  useHabitStore: vi.fn((selector: (state: { todayHabits: typeof mockHabits }) => unknown) => {
    return selector({ todayHabits: mockHabits });
  }),
}));

import { StreakRankings } from '../components/analytics/StreakRankings';
import { useHabitStore } from '../store/habitStore';

describe('StreakRankings', () => {
  test('renders habits sorted by streak descending', () => {
    render(<StreakRankings />);
    expect(screen.getByText('Power Rankings')).toBeInTheDocument();

    const titles = screen.getAllByTestId('streak-habit-title');
    expect(titles[0].textContent).toBe('Reading');
    expect(titles[1].textContent).toBe('Meditation');
    expect(titles[2].textContent).toBe('Running');
    expect(titles[3].textContent).toBe('Stretching');
  });

  test('filters out habits with streak_current === 0', () => {
    render(<StreakRankings />);
    expect(screen.queryByText('Weights')).not.toBeInTheDocument();
  });

  test('shows empty state when no habits have streaks', () => {
    vi.mocked(useHabitStore).mockImplementation(
      ((selector: (state: { todayHabits: never[] }) => unknown) => selector({ todayHabits: [] })) as typeof useHabitStore
    );

    render(<StreakRankings />);
    expect(screen.getByText('No active streaks yet')).toBeInTheDocument();
  });

  test('top 3 get rank numbers displayed', () => {
    // Restore mock with full habit data
    vi.mocked(useHabitStore).mockImplementation(
      ((selector: (state: { todayHabits: typeof mockHabits }) => unknown) => selector({ todayHabits: mockHabits })) as typeof useHabitStore
    );

    render(<StreakRankings />);
    const ranks = screen.getAllByTestId('streak-rank');
    expect(ranks.length).toBe(4); // 4 habits have streaks > 0
    expect(ranks[0].textContent).toBe('1');
    expect(ranks[1].textContent).toBe('2');
    expect(ranks[2].textContent).toBe('3');
  });
});
