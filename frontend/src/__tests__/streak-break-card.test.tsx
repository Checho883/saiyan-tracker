import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockPlay = vi.fn();

// Mock state - mutable so tests can configure it
let mockState = { status: null as any, isLoaded: false };

vi.mock('../store/statusStore', () => ({
  useStatusStore: (selector: any) => selector(mockState),
}));

vi.mock('../audio/useAudio', () => ({
  useAudio: () => ({ play: mockPlay }),
}));

// motion/react mock for test environment
vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, initial, animate, exit, transition: _t, ...rest }: any) => (
      <div {...rest}>{children}</div>
    ),
  },
}));

// lucide-react mock
vi.mock('lucide-react', () => ({
  X: (props: any) => <svg data-testid="x-icon" {...props} />,
}));

import { StreakBreakCard } from '../components/dashboard/StreakBreakCard';

describe('StreakBreakCard (22-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = { status: null, isLoaded: false };
  });

  test('renders card when streak_breaks has entries', () => {
    mockState = {
      status: {
        welcome_back: null,
        roast: null,
        streak_breaks: [
          { habit_id: '1', habit_title: 'Pushups', old_streak: 10, halved_value: 5 },
        ],
      },
      isLoaded: true,
    };
    render(<StreakBreakCard />);
    expect(screen.getByTestId('streak-break-card')).toBeInTheDocument();
  });

  test('shows habit titles and streak values', () => {
    mockState = {
      status: {
        welcome_back: null,
        roast: null,
        streak_breaks: [
          { habit_id: '1', habit_title: 'Pushups', old_streak: 10, halved_value: 5 },
          { habit_id: '2', habit_title: 'Reading', old_streak: 7, halved_value: 3 },
        ],
      },
      isLoaded: true,
    };
    render(<StreakBreakCard />);
    expect(screen.getByText(/Pushups/)).toBeInTheDocument();
    expect(screen.getByText(/10 day streak/)).toBeInTheDocument();
    expect(screen.getByText(/Reading/)).toBeInTheDocument();
  });

  test('shows encouraging quote', () => {
    mockState = {
      status: {
        welcome_back: null,
        roast: null,
        streak_breaks: [
          { habit_id: '1', habit_title: 'Pushups', old_streak: 10, halved_value: 5 },
        ],
      },
      isLoaded: true,
    };
    render(<StreakBreakCard />);
    expect(screen.getByText(/A Saiyan grows stronger after every defeat/)).toBeInTheDocument();
  });

  test('dismisses when "Get Back Up" button clicked', () => {
    mockState = {
      status: {
        welcome_back: null,
        roast: null,
        streak_breaks: [
          { habit_id: '1', habit_title: 'Pushups', old_streak: 10, halved_value: 5 },
        ],
      },
      isLoaded: true,
    };
    render(<StreakBreakCard />);
    fireEvent.click(screen.getByText('Get Back Up'));
    expect(screen.queryByTestId('streak-break-card')).not.toBeInTheDocument();
  });

  test('returns null when streak_breaks is empty', () => {
    mockState = {
      status: {
        welcome_back: null,
        roast: null,
        streak_breaks: [],
      },
      isLoaded: true,
    };
    const { container } = render(<StreakBreakCard />);
    expect(container.innerHTML).toBe('');
  });

  test('returns null when not loaded', () => {
    mockState = {
      status: null,
      isLoaded: false,
    };
    const { container } = render(<StreakBreakCard />);
    expect(container.innerHTML).toBe('');
  });
});
