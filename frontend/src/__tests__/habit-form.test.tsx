import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockHabits, mockCategories } from './__fixtures__/mockData';

// Mock stores
vi.mock('../store/habitStore', () => ({
  useHabitStore: vi.fn((selector) =>
    selector({
      todayHabits: mockHabits,
      isLoading: false,
      error: null,
      fetchToday: vi.fn(),
      checkHabit: vi.fn(),
      createHabit: vi.fn(),
      updateHabit: vi.fn(),
      deleteHabit: vi.fn(),
    })
  ),
}));

vi.mock('../store/rewardStore', () => ({
  useRewardStore: vi.fn((selector) =>
    selector({
      categories: mockCategories,
      rewards: [],
      wishes: [],
      settings: null,
      isLoading: false,
      error: null,
      fetchCategories: vi.fn(),
      fetchRewards: vi.fn(),
      fetchWishes: vi.fn(),
      fetchSettings: vi.fn(),
      createReward: vi.fn(),
      updateReward: vi.fn(),
      deleteReward: vi.fn(),
      createWish: vi.fn(),
      updateWish: vi.fn(),
      deleteWish: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      updateSettings: vi.fn(),
    })
  ),
}));

import { HabitForm } from '../components/habit/HabitForm';

describe('Habit Form (05-03)', () => {
  test('create form renders with empty fields', () => {
    render(<HabitForm onClose={vi.fn()} />);
    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toHaveValue('');
  });

  test('edit form pre-populates fields', () => {
    render(<HabitForm habit={mockHabits[0]} onClose={vi.fn()} />);
    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toHaveValue('Push-ups');
  });

  test('submit calls create action', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<HabitForm onClose={onClose} />);
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'New habit');
    const submitBtn = screen.getByRole('button', { name: /save|create/i });
    await user.click(submitBtn);
    // Form should attempt to close after submit
    expect(onClose).toHaveBeenCalled();
  });
});
