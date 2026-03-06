import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WishHistoryList } from '../components/analytics/WishHistoryList';

const mockWishHistory = vi.fn();

vi.mock('../services/api', () => ({
  analyticsApi: {
    wishHistory: () => mockWishHistory(),
  },
}));

const mockItems = Array.from({ length: 15 }, (_, i) => ({
  id: `wish-${i}`,
  wish_title: `Wish ${i}`,
  granted_at: `2026-03-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
}));

describe('WishHistoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading', async () => {
    mockWishHistory.mockResolvedValue([]);
    render(<WishHistoryList />);
    expect(screen.getByText('Wish History')).toBeInTheDocument();
  });

  it('renders items with dates', async () => {
    mockWishHistory.mockResolvedValue(mockItems.slice(0, 3));
    render(<WishHistoryList />);
    await waitFor(() => {
      expect(screen.getByText('Wish 0')).toBeInTheDocument();
      expect(screen.getByText('Wish 1')).toBeInTheDocument();
      expect(screen.getByText('Wish 2')).toBeInTheDocument();
    });
  });

  it('shows "Show more" when more than 10 items', async () => {
    mockWishHistory.mockResolvedValue(mockItems);
    render(<WishHistoryList />);
    await waitFor(() => {
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });
    expect(screen.getByText('Wish 0')).toBeInTheDocument();
    expect(screen.getByText('Wish 9')).toBeInTheDocument();
    expect(screen.queryByText('Wish 10')).not.toBeInTheDocument();
  });

  it('shows all items after clicking "Show more"', async () => {
    mockWishHistory.mockResolvedValue(mockItems);
    const user = userEvent.setup();
    render(<WishHistoryList />);
    await waitFor(() => {
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Show more'));
    expect(screen.getByText('Wish 14')).toBeInTheDocument();
    expect(screen.queryByText('Show more')).not.toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    mockWishHistory.mockResolvedValue([]);
    render(<WishHistoryList />);
    await waitFor(() => {
      expect(screen.getByText('No wishes granted yet')).toBeInTheDocument();
    });
  });
});
