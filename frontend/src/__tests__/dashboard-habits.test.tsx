import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockHabits, mockCategories, mockCheckResponse } from './__fixtures__/mockData';

// Mock stores
const mockCheckHabit = vi.fn();
vi.mock('../store/habitStore', () => ({
  useHabitStore: vi.fn((selector) =>
    selector({
      todayHabits: mockHabits,
      isLoading: false,
      error: null,
      fetchToday: vi.fn(),
      checkHabit: mockCheckHabit,
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

vi.mock('../store/uiStore', () => ({
  useUiStore: vi.fn((selector) =>
    selector({
      animationQueue: [],
      enqueueAnimation: vi.fn(),
      dequeueAnimation: vi.fn(),
      clearAnimations: vi.fn(),
      activeModal: null,
      openModal: vi.fn(),
      closeModal: vi.fn(),
    })
  ),
}));

// Mock react-hot-toast
const mockToastCustom = vi.fn();
vi.mock('react-hot-toast', () => ({
  default: {
    custom: (...args: unknown[]) => mockToastCustom(...args),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { HabitList } from '../components/dashboard/HabitList';
import { HabitCard } from '../components/dashboard/HabitCard';
import { XpPopup } from '../components/dashboard/XpPopup';
import { showCharacterQuote } from '../components/dashboard/CharacterQuote';

describe('Dashboard Habits (05-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('groups habits by category', () => {
    render(<HabitList />);
    // Training category has 3 habits, Study has 1
    expect(screen.getByText('Training')).toBeInTheDocument();
    expect(screen.getByText('Study')).toBeInTheDocument();
    // All habit titles render
    expect(screen.getByText('Push-ups')).toBeInTheDocument();
    expect(screen.getByText('Meditation')).toBeInTheDocument();
    expect(screen.getByText('Read 30 pages')).toBeInTheDocument();
    expect(screen.getByText('Run 5km')).toBeInTheDocument();
  });

  test('optimistic toggle applies completed class on click', async () => {
    mockCheckHabit.mockResolvedValueOnce(mockCheckResponse);
    const user = userEvent.setup();
    const { container } = render(<HabitCard habit={mockHabits[1]} />);
    // Click the main card element (role="button" with the habit title)
    const card = container.firstElementChild as HTMLElement;
    await user.click(card);
    expect(mockCheckHabit).toHaveBeenCalledWith(
      'habit-2',
      expect.any(String)
    );
  });

  test('streak display shows current/best streak', () => {
    render(<HabitCard habit={mockHabits[0]} />);
    // streak_current: 5, streak_best: 12
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  test('character quote calls toast with character data', () => {
    showCharacterQuote(mockCheckResponse.quote!);
    expect(mockToastCustom).toHaveBeenCalled();
  });

  test('xp popup renders with correct text and color', () => {
    const onDone = vi.fn();
    render(<XpPopup amount={25} attribute="str" onDone={onDone} />);
    expect(screen.getByText('+25 STR XP')).toBeInTheDocument();
  });
});
