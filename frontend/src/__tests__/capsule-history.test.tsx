import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CapsuleHistoryList } from '../components/analytics/CapsuleHistoryList';

const mockCapsuleHistory = vi.fn();

vi.mock('../services/api', () => ({
  analyticsApi: {
    capsuleHistory: () => mockCapsuleHistory(),
  },
}));

const mockItems = Array.from({ length: 15 }, (_, i) => ({
  id: `cap-${i}`,
  reward_title: `Reward ${i}`,
  reward_rarity: i % 3 === 0 ? 'common' : i % 3 === 1 ? 'rare' : 'epic',
  habit_title: `Habit ${i}`,
  dropped_at: `2026-03-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
}));

describe('CapsuleHistoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading', async () => {
    mockCapsuleHistory.mockResolvedValue([]);
    render(<CapsuleHistoryList />);
    expect(screen.getByText('Capsule History')).toBeInTheDocument();
  });

  it('renders items with rarity badges', async () => {
    mockCapsuleHistory.mockResolvedValue(mockItems.slice(0, 3));
    render(<CapsuleHistoryList />);
    await waitFor(() => {
      expect(screen.getByText('Reward 0')).toBeInTheDocument();
      expect(screen.getByText('Reward 1')).toBeInTheDocument();
      expect(screen.getByText('Reward 2')).toBeInTheDocument();
    });
    // Check rarity badges exist
    expect(screen.getByText('common')).toBeInTheDocument();
    expect(screen.getByText('rare')).toBeInTheDocument();
    expect(screen.getByText('epic')).toBeInTheDocument();
  });

  it('shows "Show more" when more than 10 items', async () => {
    mockCapsuleHistory.mockResolvedValue(mockItems);
    render(<CapsuleHistoryList />);
    await waitFor(() => {
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });
    // Only first 10 visible initially
    expect(screen.getByText('Reward 0')).toBeInTheDocument();
    expect(screen.getByText('Reward 9')).toBeInTheDocument();
    expect(screen.queryByText('Reward 10')).not.toBeInTheDocument();
  });

  it('shows all items after clicking "Show more"', async () => {
    mockCapsuleHistory.mockResolvedValue(mockItems);
    const user = userEvent.setup();
    render(<CapsuleHistoryList />);
    await waitFor(() => {
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Show more'));
    expect(screen.getByText('Reward 14')).toBeInTheDocument();
    expect(screen.queryByText('Show more')).not.toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    mockCapsuleHistory.mockResolvedValue([]);
    render(<CapsuleHistoryList />);
    await waitFor(() => {
      expect(screen.getByText('No capsule drops yet')).toBeInTheDocument();
    });
  });
});
